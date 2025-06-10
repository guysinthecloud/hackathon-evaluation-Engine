from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from pathlib import Path
import json

Base = declarative_base()

class Domain(Base):
    """
    Evaluation domains/categories for hackathon submissions
    Examples: FinTech, HealthTech, EdTech, AI/ML, etc.
    """
    __tablename__ = "domains"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # JSON field containing judging criteria and their descriptions
    # Example: {"innovation": "Uniqueness and creativity", "technical": "Code quality and architecture"}
    judging_criteria = Column(JSON, nullable=False, default=dict)
    
    # JSON field containing weight distribution for each criteria
    # Example: {"innovation": 0.2, "technical": 0.25, "problem_fit": 0.2, "presentation": 0.15, "business": 0.1, "demo": 0.1}
    weight_distribution = Column(JSON, nullable=False, default=dict)
    
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    submissions = relationship("Submission", back_populates="domain")
    
    def __repr__(self):
        return f"<Domain(id={self.id}, name='{self.name}')>"
    
    @property
    def total_weight(self):
        """Calculate total weight to ensure it sums to 1.0"""
        return sum(self.weight_distribution.values()) if self.weight_distribution else 0
    
    def validate_weights(self):
        """Validate that weights sum approximately to 1.0"""
        total = self.total_weight
        return abs(total - 1.0) < 0.01  # Allow small floating point errors


class Submission(Base):
    """
    Individual team submissions for evaluation
    """
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False, index=True)
    team_name = Column(String(255), nullable=False, index=True)
      # File storage information
    pdf_file_url = Column(String(500), nullable=True)  # Local file path
    
    # Processing status: uploaded, processing, evaluated, error, completed
    status = Column(String(50), default="uploaded", nullable=False, index=True)
    
    # Final aggregated scores
    total_score = Column(Float, nullable=True)
    weighted_score = Column(Float, nullable=True)
    ranking_position = Column(Integer, nullable=True)
    
    # Timestamps
    evaluation_completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    domain = relationship("Domain", back_populates="submissions")
    evaluation = relationship("SubmissionEvaluation", back_populates="submission", uselist=False)
    score = relationship("SubmissionScore", back_populates="submission", uselist=False)
    
    def __repr__(self):
        return f"<Submission(id={self.id}, team='{self.team_name}', status='{self.status}')>"
    
    @property
    def is_processed(self):
        """Check if submission has been fully processed"""
        return self.status in ["evaluated", "completed"]
    
    @property
    def slides_directory(self):
        """Get the directory path for slide images"""
        if self.pdf_file_url:
            return Path(self.pdf_file_url).parent / "slides"
        return None


class SubmissionEvaluation(Base):
    """
    Comprehensive AI evaluation results for a submission
    Stores the complete analysis from Gemini including all slides
    """
    __tablename__ = "submission_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, unique=True, index=True)
    
    # Complete analysis from Gemini (JSON format)
    # Contains: overall_analysis, criteria_scores, detailed_feedback, slide_by_slide_notes, executive_summary
    all_slides_analysis = Column(JSON, nullable=False, default=dict)
    
    # Raw response from Gemini API for debugging
    gemini_response = Column(JSON, nullable=True)
    
    # Individual criteria scores (extracted from analysis)
    # Example: {"innovation": 8, "technical": 7, "problem_fit": 9, "presentation": 6, "business": 7, "demo": 5}
    criteria_scores = Column(JSON, nullable=False, default=dict)
    
    # Overall textual feedback and summary
    overall_feedback = Column(Text, nullable=True)
    executive_summary = Column(Text, nullable=True)
    
    # Processing metadata
    processing_time_seconds = Column(Float, nullable=True)
    slide_count_analyzed = Column(Integer, nullable=True)
    
    # Quality metrics from the comprehensive analysis
    presentation_flow_score = Column(Float, nullable=True)  # How well slides connect
    completeness_score = Column(Float, nullable=True)  # Whether all aspects are covered
    consistency_score = Column(Float, nullable=True)  # Message consistency across slides
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    submission = relationship("Submission", back_populates="evaluation")
    
    def __repr__(self):
        return f"<SubmissionEvaluation(id={self.id}, submission_id={self.submission_id})>"
    
    @property
    def average_criteria_score(self):
        """Calculate average score across all criteria"""
        if not self.criteria_scores:
            return None
        scores = list(self.criteria_scores.values())
        return sum(scores) / len(scores) if scores else None
    
    def get_strengths(self):
        """Extract strengths from detailed feedback"""
        if self.all_slides_analysis and 'detailed_feedback' in self.all_slides_analysis:
            return self.all_slides_analysis['detailed_feedback'].get('strengths', [])
        return []
    
    def get_weaknesses(self):
        """Extract weaknesses from detailed feedback"""
        if self.all_slides_analysis and 'detailed_feedback' in self.all_slides_analysis:
            return self.all_slides_analysis['detailed_feedback'].get('weaknesses', [])
        return []
    
    def get_suggestions(self):
        """Extract suggestions from detailed feedback"""
        if self.all_slides_analysis and 'detailed_feedback' in self.all_slides_analysis:
            return self.all_slides_analysis['detailed_feedback'].get('suggestions', [])
        return []


class SubmissionScore(Base):
    """
    Final calculated scores and rankings for submissions
    Derived from SubmissionEvaluation with domain-specific weighting applied
    """
    __tablename__ = "submission_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False, unique=True, index=True)
    
    # Detailed breakdown of scores by criteria
    # Example: {"innovation": 8.0, "technical": 7.0, "problem_fit": 9.0, "presentation": 6.0, "business": 7.0, "demo": 5.0}
    criteria_breakdown = Column(JSON, nullable=False, default=dict)
    
    # Weighted scores based on domain criteria
    # Example: {"innovation": 1.6, "technical": 1.75, "problem_fit": 1.8, "presentation": 0.9, "business": 0.7, "demo": 0.5}
    weighted_breakdown = Column(JSON, nullable=False, default=dict)
    
    # Final scores
    raw_total = Column(Float, nullable=False, default=0.0)  # Sum of all criteria scores
    weighted_total = Column(Float, nullable=False, default=0.0)  # Weighted sum based on domain
    normalized_score = Column(Float, nullable=True)  # Score normalized to 0-100 scale
    
    # Ranking information
    ranking_position = Column(Integer, nullable=True, index=True)
    percentile_rank = Column(Float, nullable=True)  # 0-100 percentile rank within domain
    
    # Additional quality metrics
    presentation_quality_bonus = Column(Float, default=0.0)  # Bonus for exceptional presentation flow
    consistency_penalty = Column(Float, default=0.0)  # Penalty for inconsistent messaging
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    submission = relationship("Submission", back_populates="score")
    
    def __repr__(self):
        return f"<SubmissionScore(id={self.id}, submission_id={self.submission_id}, weighted_total={self.weighted_total})>"
    
    @property
    def grade_letter(self):
        """Convert normalized score to letter grade"""
        if self.normalized_score is None:
            return "N/A"
        
        if self.normalized_score >= 90:
            return "A+"
        elif self.normalized_score >= 85:
            return "A"
        elif self.normalized_score >= 80:
            return "A-"
        elif self.normalized_score >= 75:
            return "B+"
        elif self.normalized_score >= 70:
            return "B"
        elif self.normalized_score >= 65:
            return "B-"
        elif self.normalized_score >= 60:
            return "C+"
        elif self.normalized_score >= 55:
            return "C"
        elif self.normalized_score >= 50:
            return "C-"
        else:
            return "F"
    
    def calculate_weighted_total(self, domain_weights: dict):
        """Calculate weighted total based on domain weight distribution"""
        if not self.criteria_breakdown or not domain_weights:
            return 0.0
        
        weighted_sum = 0.0
        weighted_breakdown = {}
        
        for criteria, score in self.criteria_breakdown.items():
            weight = domain_weights.get(criteria, 0.0)
            weighted_score = score * weight
            weighted_breakdown[criteria] = weighted_score
            weighted_sum += weighted_score
        
        self.weighted_breakdown = weighted_breakdown
        self.weighted_total = weighted_sum
        return weighted_sum


class APIRateLimit(Base):
    """
    Track API rate limiting for Gemini and other external services
    """
    __tablename__ = "api_rate_limits"
    
    id = Column(Integer, primary_key=True, index=True)
    api_service = Column(String(100), nullable=False, index=True)  # 'gemini', 'openai', etc.
    api_key_hash = Column(String(255), nullable=False, index=True)
    
    # Rate limiting tracking
    requests_count = Column(Integer, default=0, nullable=False)
    window_start_time = Column(DateTime(timezone=True), nullable=False)
    last_request_time = Column(DateTime(timezone=True), nullable=True)
    
    # Configuration
    max_requests_per_window = Column(Integer, default=10, nullable=False)
    window_duration_minutes = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<APIRateLimit(service='{self.api_service}', requests={self.requests_count}/{self.max_requests_per_window})>"
    
    @property
    def is_rate_limited(self):
        """Check if currently rate limited"""
        if not self.last_request_time:
            return False
        
        # Check if window has expired
        window_end = self.window_start_time + timedelta(minutes=self.window_duration_minutes)
        current_time = datetime.utcnow()
        
        if current_time > window_end:
            return False  # Window expired, not rate limited
        
        return self.requests_count >= self.max_requests_per_window
    
    def time_until_reset(self):
        """Get seconds until rate limit resets"""
        if not self.window_start_time:
            return 0
        
        window_end = self.window_start_time + timedelta(minutes=self.window_duration_minutes)
        current_time = datetime.utcnow()
        
        if current_time >= window_end:
            return 0
        
        return int((window_end - current_time).total_seconds())


# Additional utility model for system health monitoring
class SystemHealth(Base):
    """
    Track system health and processing statistics
    """
    __tablename__ = "system_health"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(255), nullable=False, index=True)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(50), nullable=True)  # 'seconds', 'count', 'percentage', etc.
    
    # Context information
    context = Column(JSON, nullable=True)  # Additional metadata about the metric
    
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<SystemHealth(metric='{self.metric_name}', value={self.metric_value})>"