# schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class SubmissionStatusEnum(str, Enum):
    uploaded = "uploaded"
    processing = "processing"
    evaluating = "evaluating"
    completed = "completed"
    error = "error"

# Domain Schemas
class DomainBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    judging_criteria: Dict[str, Any] = Field(..., description="Criteria definitions")
    weight_distribution: Dict[str, float] = Field(..., description="Scoring weights")
    is_active: bool = Field(default=True, description="Whether the domain is active")

class DomainCreate(DomainBase):
    pass

class DomainResponse(DomainBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Submission Schemas
class SubmissionBase(BaseModel):
    team_name: str = Field(..., min_length=1, max_length=100)
    domain_id: int

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    pdf_file_url: Optional[str] = None
    status: SubmissionStatusEnum
    total_score: Optional[float] = None
    evaluation_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    domain: Optional[DomainResponse] = None
    
    class Config:
        from_attributes = True

# Evaluation Schemas
class EvaluationResponse(BaseModel):
    id: int
    submission_id: int
    all_slides_analysis: Optional[Dict[str, Any]] = None
    gemini_response: Optional[Dict[str, Any]] = None
    criteria_scores: Optional[Dict[str, float]] = None
    overall_feedback: Optional[str] = None
    processing_time_seconds: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Score Schemas
class ScoreResponse(BaseModel):
    id: int
    submission_id: int
    criteria_breakdown: Optional[Dict[str, float]] = None
    weighted_total: Optional[float] = None
    raw_total: Optional[float] = None
    ranking_position: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schemas
class ScoreDistribution(BaseModel):
    min: float
    max: float
    scores: List[float]

class DomainAnalytics(BaseModel):
    total_submissions: int
    average_score: float
    score_distribution: ScoreDistribution
    criteria_averages: Dict[str, float]

class ProcessingStats(BaseModel):
    total_evaluations: int
    average_processing_time: float
    processing_time_distribution: Dict[str, Any]

# Health Check Schemas
class ServiceStatus(BaseModel):
    database: str
    redis: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    services: ServiceStatus

class RateLimitStatus(BaseModel):
    can_make_request: bool
    wait_time_seconds: int
    requests_per_minute_limit: int

# Gemini Response Schemas
class SlideNote(BaseModel):
    slide: int
    note: str

class DetailedFeedback(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]

class OverallAnalysis(BaseModel):
    presentation_flow_score: int = Field(..., ge=1, le=10)
    completeness_score: int = Field(..., ge=1, le=10)
    consistency_score: int = Field(..., ge=1, le=10)
    total_slides_analyzed: int

class CriteriaScores(BaseModel):
    innovation: int = Field(..., ge=1, le=10)
    technical: int = Field(..., ge=1, le=10)
    problem_fit: int = Field(..., ge=1, le=10)
    presentation: int = Field(..., ge=1, le=10)
    business: int = Field(..., ge=1, le=10)
    demo: int = Field(..., ge=1, le=10)

class GeminiEvaluationResponse(BaseModel):
    overall_analysis: OverallAnalysis
    criteria_scores: CriteriaScores
    detailed_feedback: DetailedFeedback
    slide_by_slide_notes: List[SlideNote]
    executive_summary: str

# Default domain configurations
DEFAULT_DOMAINS = [
    {
        "name": "FinTech",
        "description": "Financial Technology Solutions",
        "judging_criteria": {
            "innovation": "Uniqueness of financial solution and creative problem-solving approach",
            "technical": "Code quality, architecture, and scalability of financial systems",
            "problem_fit": "Clear problem statement and solution relevance to financial needs",
            "presentation": "Slide design, clarity, and information organization",
            "business": "Market potential, monetization strategy, and competitive analysis",
            "demo": "Working demonstration, feature completeness, and user experience",
            "security": "Security measures, compliance, and user trust factors",
            "compliance": "Regulatory compliance and financial standards adherence"
        },
        "weight_distribution": {
            "innovation": 0.18,
            "technical": 0.22,
            "problem_fit": 0.18,
            "presentation": 0.12,
            "business": 0.15,
            "demo": 0.08,
            "security": 0.04,
            "compliance": 0.03
        }
    },
    {
        "name": "HealthTech",
        "description": "Healthcare Technology Solutions",
        "judging_criteria": {
            "innovation": "Uniqueness of healthcare solution and creative problem-solving",
            "technical": "Code quality, architecture, and scalability considerations",
            "problem_fit": "Clear problem statement and solution relevance to healthcare",
            "presentation": "Slide design, clarity, and information organization",
            "business": "Market potential, monetization strategy, and competitive analysis",
            "demo": "Working demonstration, feature completeness, and user experience",
            "patient_safety": "Patient safety considerations and risk mitigation",
            "data_privacy": "Healthcare data privacy and HIPAA compliance"
        },
        "weight_distribution": {
            "innovation": 0.20,
            "technical": 0.20,
            "problem_fit": 0.20,
            "presentation": 0.10,
            "business": 0.12,
            "demo": 0.08,
            "patient_safety": 0.06,
            "data_privacy": 0.04
        }
    },
    {
        "name": "EdTech",
        "description": "Educational Technology Solutions",
        "judging_criteria": {
            "innovation": "Uniqueness of educational solution and creative learning approaches",
            "technical": "Code quality, architecture, and platform scalability",
            "problem_fit": "Clear educational problem and solution relevance",
            "presentation": "Slide design, clarity, and information organization",
            "business": "Market potential, monetization strategy, and competitive analysis",
            "demo": "Working demonstration, feature completeness, and user experience",
            "learning_effectiveness": "Demonstrated learning outcomes and pedagogical soundness",
            "accessibility": "Accessibility features and inclusive design principles"
        },
        "weight_distribution": {
            "innovation": 0.18,
            "technical": 0.20,
            "problem_fit": 0.18,
            "presentation": 0.12,
            "business": 0.12,
            "demo": 0.10,
            "learning_effectiveness": 0.06,
            "accessibility": 0.04
        }
    },
    {
        "name": "AI/ML",
        "description": "Artificial Intelligence and Machine Learning Solutions",
        "judging_criteria": {
            "innovation": "Uniqueness of AI/ML approach and creative problem-solving",
            "technical": "Model architecture, code quality, and implementation excellence",
            "problem_fit": "Clear problem statement and AI/ML solution appropriateness",
            "presentation": "Slide design, clarity, and technical communication",
            "business": "Market potential, monetization strategy, and competitive analysis",
            "demo": "Working demonstration, model performance, and user experience",
            "model_performance": "Model accuracy, efficiency, and robustness",
            "data_quality": "Data quality, preprocessing, and ethical considerations"
        },
        "weight_distribution": {
            "innovation": 0.18,
            "technical": 0.25,
            "problem_fit": 0.18,
            "presentation": 0.10,
            "business": 0.12,
            "demo": 0.08,
            "model_performance": 0.06,
            "data_quality": 0.03
        }
    }
]