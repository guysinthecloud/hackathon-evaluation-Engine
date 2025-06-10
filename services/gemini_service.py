# services/gemini_service.py
import google.generativeai as genai
import os
import json
import time
from typing import List, Dict, Any, Optional
import logging
from PIL import Image
import base64
import io
from pathlib import Path

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google AI Studio Gemini API"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_AI_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_AI_API_KEY environment variable not set")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')
        
        # Comprehensive evaluation prompt template
        self.evaluation_prompt_template = """
You are an expert hackathon judge evaluating a complete presentation submission. 
You will receive all slides of a presentation as images to analyze the entire narrative flow and coherence.

IMPORTANT: Analyze the presentation as a complete story, considering:
- How well slides connect and flow together
- Overall narrative coherence and structure
- Consistency in messaging across slides
- Complete project comprehension

Domain-Specific Context: {domain_name}
Domain Description: {domain_description}

Evaluation Criteria (score 1-10 for each):
{criteria_descriptions}

Additional Analysis:
- Presentation Flow Score (1-10): How well slides connect narratively
- Completeness Score (1-10): Whether all essential aspects are covered
- Consistency Score (1-10): Message consistency across slides

Please provide a comprehensive evaluation considering the domain-specific requirements and provide constructive feedback for improvement.

Respond in this exact JSON format:
{{
  "overall_analysis": {{
    "presentation_flow_score": 8,
    "completeness_score": 7,
    "consistency_score": 9,
    "total_slides_analyzed": 12
  }},
  "criteria_scores": {{
    {criteria_score_fields}
  }},
  "detailed_feedback": {{
    "strengths": ["Excellent problem identification", "Clear technical architecture", "Strong business model"],
    "weaknesses": ["Demo section unclear", "Missing implementation timeline"],
    "suggestions": ["Add more technical details", "Include user feedback", "Strengthen demo section"]
  }},
  "slide_by_slide_notes": [
    {{"slide": 1, "note": "Strong opening with clear problem statement"}},
    {{"slide": 2, "note": "Good market analysis but needs more data"}}
  ],
  "executive_summary": "This presentation demonstrates a solid understanding of the problem space with an innovative technical solution. The narrative flows well but would benefit from a stronger demonstration section."
}}
"""
    
    def prepare_evaluation_prompt(self, domain_info: Dict[str, Any]) -> str:
        """Prepare the evaluation prompt with domain-specific information"""
        
        # Format criteria descriptions
        criteria_descriptions = []
        criteria_score_fields = []
        
        for key, description in domain_info["judging_criteria"].items():
            criteria_descriptions.append(f"{key.replace('_', ' ').title()}: {description}")
            criteria_score_fields.append(f'"{key}": 8')
        
        criteria_desc_text = "\n".join([f"{i+1}. {desc}" for i, desc in enumerate(criteria_descriptions)])
        criteria_score_text = ",\n    ".join(criteria_score_fields)
        
        prompt = self.evaluation_prompt_template.format(
            domain_name=domain_info["name"],
            domain_description=domain_info["description"],
            criteria_descriptions=criteria_desc_text,
            criteria_score_fields=criteria_score_text
        )
        
        return prompt
    
    async def analyze_complete_presentation(
        self, 
        image_paths: List[str], 
        domain_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze a complete presentation using all slide images
        
        Args:
            image_paths: List of paths to slide images
            domain_info: Domain configuration and criteria
            
        Returns:
            Comprehensive evaluation response
        """
        try:
            logger.info(f"Starting comprehensive presentation analysis for {len(image_paths)} slides")
            
            # Prepare images for Gemini
            images = []
            for image_path in image_paths:
                if os.path.exists(image_path):
                    images.append(Image.open(image_path))
                else:
                    logger.warning(f"Image not found: {image_path}")
            
            if not images:
                raise ValueError("No valid images found for analysis")
            
            # Prepare the evaluation prompt
            prompt = self.prepare_evaluation_prompt(domain_info)
            
            logger.info("Prepared evaluation prompt for Gemini:")
            logger.info(prompt)
            
            # Create content list with prompt and images
            content = [prompt]
            content.extend(images)
            
            # Make API call to Gemini
            start_time = time.time()
            
            response = self.model.generate_content(
                content,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Lower temperature for more consistent scoring
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=4096,
                )
            )
            
            processing_time = time.time() - start_time
            
            # Parse response
            response_text = response.text
            logger.debug(f"Gemini response: {response_text}")
            
            # Extract JSON from response
            try:
                # Find JSON in response (handle markdown code blocks)
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    json_text = response_text[json_start:json_end].strip()
                elif "{" in response_text:
                    # Find first { and last }
                    json_start = response_text.find("{")
                    json_end = response_text.rfind("}") + 1
                    json_text = response_text[json_start:json_end]
                else:
                    raise ValueError("No JSON found in response")
                
                evaluation_result = json.loads(json_text)
                
                # Add metadata
                evaluation_result["metadata"] = {
                    "processing_time_seconds": processing_time,
                    "slides_analyzed": len(images),
                    "domain": domain_info["name"],
                    "gemini_model": "gemini-2.5-flash-preview-04-17",
                    "timestamp": time.time()
                }
                
                logger.info(f"Successfully analyzed presentation in {processing_time:.2f} seconds")
                return evaluation_result
                
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing JSON response: {str(e)}")
                logger.error(f"Raw response: {response_text}")
                
                # Return fallback response
                return self._create_fallback_response(len(images), processing_time, response_text)
                
        except Exception as e:
            logger.error(f"Error in comprehensive presentation analysis: {str(e)}")
            raise
    
    def _create_fallback_response(self, slide_count: int, processing_time: float, raw_response: str) -> Dict[str, Any]:
        """Create a fallback response when JSON parsing fails"""
        return {
            "overall_analysis": {
                "presentation_flow_score": 5,
                "completeness_score": 5,
                "consistency_score": 5,
                "total_slides_analyzed": slide_count
            },
            "criteria_scores": {
                "innovation": 5,
                "technical": 5,
                "problem_fit": 5,
                "presentation": 5,
                "business": 5,
                "demo": 5
            },
            "detailed_feedback": {
                "strengths": ["Analysis completed"],
                "weaknesses": ["Unable to parse detailed evaluation"],
                "suggestions": ["Please review the presentation manually"]
            },
            "slide_by_slide_notes": [
                {"slide": i+1, "note": "Analysis available in raw response"} 
                for i in range(min(slide_count, 10))
            ],
            "executive_summary": "Evaluation completed but detailed analysis parsing failed. Please review raw response.",
            "metadata": {
                "processing_time_seconds": processing_time,
                "slides_analyzed": slide_count,
                "parsing_error": True,
                "raw_response": raw_response[:1000]  # Truncate for storage
            }
        }
    
    def calculate_weighted_score(
        self, 
        criteria_scores: Dict[str, float], 
        weight_distribution: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Calculate weighted scores based on domain-specific weights
        
        Args:
            criteria_scores: Scores for each criterion
            weight_distribution: Weight for each criterion
            
        Returns:
            Dictionary with raw_total and weighted_total scores
        """
        try:
            # Calculate raw total (simple average)
            raw_total = sum(criteria_scores.values()) / len(criteria_scores)
            
            # Calculate weighted total
            weighted_total = 0
            total_weight = 0
            
            for criterion, score in criteria_scores.items():
                weight = weight_distribution.get(criterion, 0)
                weighted_total += score * weight
                total_weight += weight
            
            # Normalize if weights don't sum to 1
            if total_weight > 0 and total_weight != 1.0:
                weighted_total = weighted_total / total_weight
            
            return {
                "raw_total": round(raw_total, 2),
                "weighted_total": round(weighted_total, 2)
            }
            
        except Exception as e:
            logger.error(f"Error calculating weighted score: {str(e)}")
            return {"raw_total": 0.0, "weighted_total": 0.0}
    
    def validate_api_key(self) -> bool:
        """Validate that the Gemini API key is working"""
        try:
            # Test with a simple request
            test_content = "Hello, this is a test."
            response = self.model.generate_content(test_content)
            return bool(response.text)
        except Exception as e:
            logger.error(f"API key validation failed: {str(e)}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current Gemini model"""
        try:
            return {
                "model_name": "gemini-2.0-flash-exp",
                "api_key_configured": bool(self.api_key),
                "api_key_valid": self.validate_api_key()
            }
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            return {
                "model_name": "gemini-2.0-flash-exp",
                "api_key_configured": bool(self.api_key),
                "api_key_valid": False,
                "error": str(e)
            }