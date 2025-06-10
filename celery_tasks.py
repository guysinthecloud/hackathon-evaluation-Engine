#celery_tasks.py

from celery import current_task
from celery.exceptions import Retry
from celery_app import celery_app
from sqlalchemy.orm import Session
import time
import asyncio
from pathlib import Path
import json
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta

from database import SessionLocal
from models import Submission, SubmissionEvaluation, SubmissionScore, Domain, SystemHealth
from services.pdf_processor import PDFProcessor
from services.gemini_service import GeminiService
from services.rate_limiter import GeminiRateLimiter
import redis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
redis_client = redis.Redis(host='localhost', port=6379, db=0)
rate_limiter = GeminiRateLimiter(redis_client)
pdf_processor = PDFProcessor()
gemini_service = GeminiService()

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_submission_task(self, submission_id: int):
    """
    Process a submission: convert PDF to images and prepare for evaluation
    """
    db = SessionLocal()
    start_time = time.time()
    
    try:
        # Get submission
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return {"status": "error", "message": "Submission not found"}

        # Update status
        submission.status = "processing"
        db.commit()

        # Convert PDF to images
        pdf_path = submission.pdf_file_url
        slides_dir = Path(pdf_path).parent / "slides"
        slides_dir.mkdir(exist_ok=True)

        logger.info(f"Processing submission {submission_id}: {pdf_path}")

        # Process PDF
        image_paths = pdf_processor.convert_pdf_to_images(pdf_path, str(slides_dir))
        
        if not image_paths:
            raise ValueError("No images generated from PDF")

        logger.info(f"Generated {len(image_paths)} images for submission {submission_id}")        # Update submission status
        submission.status = "processed"
        db.commit()

        # Queue for evaluation
        evaluate_presentation_task.delay(submission_id)

        # Record processing time
        processing_time = time.time() - start_time
        record_system_metric("pdf_processing_time", processing_time, "seconds", 
                           {"submission_id": submission_id, "slide_count": len(image_paths)})

        return {
            "status": "success", 
            "submission_id": submission_id,
            "slides_generated": len(image_paths),
            "processing_time": processing_time
        }

    except Exception as e:
        logger.error(f"Error processing submission {submission_id}: {str(e)}")
        
        # Update submission status
        if 'submission' in locals():
            submission.status = "error"
            db.commit()
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            retry_delay = 60 * (2 ** self.request.retries)
            raise self.retry(countdown=retry_delay, exc=e)
        
        return {"status": "error", "message": str(e), "submission_id": submission_id}
    
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=5, default_retry_delay=120)
def evaluate_presentation_task(self, submission_id: int):
    """
    Comprehensive evaluation of a presentation using Gemini 2.5 Flash
    Analyzes all slides together for narrative flow and coherence
    """
    db = SessionLocal()
    start_time = time.time()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Get submission and domain
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return {"status": "error", "message": "Submission not found"}

        domain = db.query(Domain).filter(Domain.id == submission.domain_id).first()
        if not domain:
            logger.error(f"Domain {submission.domain_id} not found")
            return {"status": "error", "message": "Domain not found"}

        # Check rate limit using synchronous execution of async function
        can_make_request = loop.run_until_complete(rate_limiter.can_make_request("gemini_api"))
        if not can_make_request:
            wait_time = loop.run_until_complete(rate_limiter.get_wait_time("gemini_api"))
            logger.info(f"Rate limited. Retrying in {wait_time} seconds")
            raise self.retry(countdown=wait_time)
        
        # Update submission status to evaluating
        submission.status = "evaluating"
        db.commit()

        # Load all slide images
        slides_dir = Path(submission.pdf_file_url).parent / "slides"
        image_paths = list(slides_dir.glob("*.png"))
        image_paths.sort()  # Ensure correct order

        if not image_paths:
            raise ValueError("No slide images found for evaluation")

        logger.info(f"Evaluating {len(image_paths)} slides for submission {submission_id}")

        # Create domain info dictionary
        domain_info = {
            "name": domain.name,
            "description": domain.description,
            "judging_criteria": domain.judging_criteria,
            "weight_distribution": domain.weight_distribution
        }
        
        # Send to Gemini for comprehensive analysis using synchronous execution
        gemini_response = loop.run_until_complete(gemini_service.analyze_complete_presentation(
            image_paths=[str(path) for path in image_paths],
            domain_info=domain_info
        ))
        
        if not gemini_response:
            raise ValueError("No response from Gemini service")
            
        # Parse and validate response
        parsed_response = parse_gemini_response(gemini_response)
        
        # Create evaluation record
        evaluation = SubmissionEvaluation(
            submission_id=submission_id,
            all_slides_analysis=parsed_response,
            gemini_response=gemini_response,
            criteria_scores=parsed_response.get('criteria_scores', {}),
            overall_feedback=parsed_response.get('detailed_feedback', {}).get('summary', ''),
            executive_summary=parsed_response.get('executive_summary', ''),
            processing_time_seconds=time.time() - start_time,
            slide_count_analyzed=len(image_paths),
            presentation_flow_score=parsed_response.get('overall_analysis', {}).get('presentation_flow_score'),
            completeness_score=parsed_response.get('overall_analysis', {}).get('completeness_score'),
            consistency_score=parsed_response.get('overall_analysis', {}).get('consistency_score')
        )
        
        db.add(evaluation)
        
        # Update submission status to evaluated (NOT completed yet)
        submission.status = "evaluated"
        db.commit()
        db.refresh(evaluation)

        # Queue scoring calculation - THIS IS CRUCIAL
        logger.info(f"Queueing score calculation for submission {submission_id}")
        calculate_score_task.delay(submission_id)

        logger.info(f"Evaluation completed for submission {submission_id}")

        # Record evaluation time
        evaluation_time = time.time() - start_time
        record_system_metric("evaluation_time", evaluation_time, "seconds",
                           {"submission_id": submission_id, "slide_count": len(image_paths)})

        return {
            "status": "success",
            "submission_id": submission_id,
            "evaluation_id": evaluation.id,
            "processing_time": evaluation_time
        }

    except Exception as e:
        logger.error(f"Error evaluating submission {submission_id}: {str(e)}")
        
        # Update submission status
        if 'submission' in locals():
            submission.status = "evaluation_error"
            db.commit()
        
        # Retry with exponential backoff
        if self.request.retries < self.max_retries:
            retry_delay = 120 * (2 ** self.request.retries)
            logger.info(f"Retrying evaluation for submission {submission_id} in {retry_delay} seconds")
            raise self.retry(countdown=retry_delay, exc=e)
        
        return {"status": "error", "message": str(e), "submission_id": submission_id}
    
    finally:
        db.close()
        loop.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def calculate_score_task(self, submission_id: int):
    """
    Calculate final weighted scores and rankings for a submission
    """
    db = SessionLocal()
    
    try:
        logger.info(f"Starting score calculation for submission {submission_id}")
        
        # Get submission, evaluation, and domain
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return {"status": "error", "message": "Submission not found"}

        evaluation = db.query(SubmissionEvaluation).filter(
            SubmissionEvaluation.submission_id == submission_id
        ).first()
        if not evaluation:
            logger.error(f"Evaluation not found for submission {submission_id}")
            return {"status": "error", "message": "Evaluation not found"}

        domain = db.query(Domain).filter(Domain.id == submission.domain_id).first()
        if not domain:
            logger.error(f"Domain {submission.domain_id} not found")
            return {"status": "error", "message": "Domain not found"}

        # Calculate scores
        criteria_scores = evaluation.criteria_scores
        if not criteria_scores:
            raise ValueError("No criteria scores found in evaluation")

        # Create or update score record
        score_record = db.query(SubmissionScore).filter(
            SubmissionScore.submission_id == submission_id
        ).first()
        
        if not score_record:
            score_record = SubmissionScore(submission_id=submission_id)
            db.add(score_record)

        # Set basic scores
        score_record.criteria_breakdown = criteria_scores
        score_record.raw_total = sum(criteria_scores.values())

        # Calculate weighted scores
        weighted_total = score_record.calculate_weighted_total(domain.weight_distribution)
        
        # Add quality bonuses/penalties
        presentation_bonus = calculate_presentation_bonus(evaluation)
        consistency_penalty = calculate_consistency_penalty(evaluation)
        
        score_record.presentation_quality_bonus = presentation_bonus
        score_record.consistency_penalty = consistency_penalty
        
        # Final adjusted score
        final_score = weighted_total + presentation_bonus - consistency_penalty
        score_record.weighted_total = final_score
        
        # Normalize to 100 scale (assuming max possible score is 10 * sum of weights)
        max_possible = 10.0 * sum(domain.weight_distribution.values())
        score_record.normalized_score = (final_score / max_possible) * 100 if max_possible > 0 else 0

        db.commit()
        
        # Update submission with final scores and mark as completed
        submission.total_score = score_record.raw_total
        submission.weighted_score = score_record.weighted_total
        submission.evaluation_completed_at = datetime.utcnow()
        submission.status = "completed"  # NOW we mark it as completed
        db.commit()

        # Queue ranking calculation for the domain
        logger.info(f"Queueing ranking calculation for domain {domain.id}")
        calculate_rankings_task.delay(domain.id)

        logger.info(f"Score calculated for submission {submission_id}: {final_score:.2f}")

        return {
            "status": "success",
            "submission_id": submission_id,
            "final_score": final_score,
            "normalized_score": score_record.normalized_score
        }

    except Exception as e:
        logger.error(f"Error calculating scores for submission {submission_id}: {str(e)}")
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=30 * (2 ** self.request.retries), exc=e)
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

def calculate_presentation_bonus(evaluation: SubmissionEvaluation) -> float:
    """
    Calculate bonus points based on presentation quality metrics
    """
    base_bonus = 0.0
    
    # Add bonus for excellent flow
    if evaluation.presentation_flow_score and evaluation.presentation_flow_score >= 8:
        base_bonus += 0.5
    
    # Add bonus for completeness
    if evaluation.completeness_score and evaluation.completeness_score >= 8:
        base_bonus += 0.3
    
    return min(base_bonus, 1.0)  # Cap bonus at 1.0

def calculate_consistency_penalty(evaluation: SubmissionEvaluation) -> float:
    """
    Calculate penalty points based on consistency issues
    """
    if not evaluation.consistency_score:
        return 0.0
    
    if evaluation.consistency_score < 5:
        return 1.0
    elif evaluation.consistency_score < 7:
        return 0.5
    
    return 0.0

def create_evaluation_prompt(domain: Domain) -> str:
    """
    Create a customized evaluation prompt based on domain criteria
    """
    base_prompt = """You are an expert hackathon judge evaluating a complete presentation submission.
You will analyze all slides together to evaluate the entire narrative flow and coherence.

Consider:
- How well slides connect and flow together
- Overall narrative coherence and structure
- Consistency in messaging across slides
- Complete project comprehension

Evaluation Criteria (score 1-10 for each):
"""
    
    # Add domain-specific criteria
    for criteria, weight in domain.weight_distribution.items():
        base_prompt += f"- {criteria}: {domain.judging_criteria.get(criteria, '')}\n"
    
    response_format = """{
        "overall_analysis": {
            "presentation_flow_score": <1-10>,
            "completeness_score": <1-10>,
            "consistency_score": <1-10>,
            "total_slides_analyzed": <number>
        },
        "criteria_scores": {
            <scores for each criteria>
        },
        "detailed_feedback": {
            "strengths": [<list of strengths>],
            "weaknesses": [<list of weaknesses>],
            "suggestions": [<list of suggestions>]
        },
        "executive_summary": "<concise overall evaluation>"
    }"""
    
    return base_prompt + "\n\nRespond in this JSON format:\n" + response_format

def parse_gemini_response(response: str) -> Dict[str, Any]:
    """
    Parse and validate the Gemini service response
    """
    try:
        if isinstance(response, str):
            parsed = json.loads(response)
        else:
            parsed = response
            
        required_fields = [
            'overall_analysis',
            'criteria_scores',
            'detailed_feedback',
            'executive_summary'
        ]
        
        for field in required_fields:
            if field not in parsed:
                raise ValueError(f"Missing required field: {field}")
        
        return parsed
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON response: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing response: {str(e)}")

def record_system_metric(metric_name: str, value: float, unit: str, metadata: Dict[str, Any] = None):
    """
    Record system health and performance metrics
    """
    try:
        db = SessionLocal()
        metric = SystemHealth(
            metric_name=metric_name,
            metric_value=value,
            metric_unit=unit,
            metadata=metadata or {},
            recorded_at=datetime.utcnow()
        )
        db.add(metric)
        db.commit()
    except Exception as e:
        logger.error(f"Error recording metric {metric_name}: {str(e)}")
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def calculate_rankings_task(self, domain_id: int):
    """
    Calculate and update rankings for all submissions in a domain
    Updates both SubmissionScore and Submission tables with ranking information
    """
    db = SessionLocal()
    
    try:
        logger.info(f"Starting ranking calculation for domain {domain_id}")
        
        # Get all completed submissions for the domain with their scores
        submissions_with_scores = db.query(SubmissionScore).join(Submission).filter(
            Submission.domain_id == domain_id,
            Submission.status == "completed"
        ).order_by(SubmissionScore.weighted_total.desc()).all()
        
        if not submissions_with_scores:
            logger.warning(f"No completed submissions found for domain {domain_id}")
            return {
                "status": "success",
                "domain_id": domain_id,
                "submissions_ranked": 0,
                "message": "No completed submissions to rank"
            }
        
        # Calculate total submissions for percentile calculation
        total_submissions = len(submissions_with_scores)
        
        # Update rankings in both SubmissionScore and Submission tables
        ranking_updates = []
        
        for rank, score_record in enumerate(submissions_with_scores, 1):
            # Update SubmissionScore table
            score_record.ranking_position = rank
            
            # Calculate percentile rank (higher is better)
            percentile = ((total_submissions - rank + 1) / total_submissions) * 100
            score_record.percentile_rank = round(percentile, 2)
            
            # Get the corresponding submission
            submission = db.query(Submission).filter(
                Submission.id == score_record.submission_id
            ).first()
            
            if submission:
                # Update Submission table with ranking info
                submission.ranking_position = rank
                submission.weighted_score = score_record.weighted_total  # Ensure consistency
                
                ranking_updates.append({
                    "submission_id": score_record.submission_id,
                    "team_name": submission.team_name,
                    "rank": rank,
                    "score": score_record.weighted_total,
                    "percentile": percentile
                })
                
                logger.debug(
                    f"Ranked submission {score_record.submission_id} ({submission.team_name}) "
                    f"at position {rank} with score {score_record.weighted_total:.2f} "
                    f"({percentile:.1f}th percentile)"
                )
        
        # Commit all changes
        db.commit()
        
        logger.info(
            f"Rankings updated for domain {domain_id}: {len(submissions_with_scores)} submissions ranked"
        )
        
        return {
            "status": "success",
            "domain_id": domain_id,
            "submissions_ranked": len(submissions_with_scores),
            "rankings": ranking_updates
        }
    
    except Exception as e:
        logger.error(f"Error calculating rankings for domain {domain_id}: {str(e)}")
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries), exc=e)
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()