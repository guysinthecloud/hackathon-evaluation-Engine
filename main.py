#main.py

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from pathlib import Path
import logging
from datetime import datetime

from database import engine, SessionLocal, Base
from models import Domain, Submission, SubmissionEvaluation, SubmissionScore
from schemas import (
    DomainCreate, DomainResponse, SubmissionCreate, SubmissionResponse,
    EvaluationResponse, ScoreResponse
)
from services.pdf_processor import PDFProcessor
from services.gemini_service import GeminiService
from services.rate_limiter import GeminiRateLimiter
from celery_tasks import evaluate_presentation_task
import redis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Hackathon PPT Evaluation Engine",
    description="AI-powered hackathon presentation evaluation system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
redis_client = redis.Redis(host='localhost', port=6379, db=0)
rate_limiter = GeminiRateLimiter(redis_client)
pdf_processor = PDFProcessor()
gemini_service = GeminiService()

# Storage configuration
STORAGE_PATH = Path("storage")
UPLOADS_PATH = STORAGE_PATH / "uploads"
TEMP_PATH = STORAGE_PATH / "temp"
PROCESSED_PATH = STORAGE_PATH / "processed"

# Create storage directories
for path in [STORAGE_PATH, UPLOADS_PATH, TEMP_PATH, PROCESSED_PATH]:
    path.mkdir(exist_ok=True)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Hackathon PPT Evaluation Engine API", "version": "1.0.0"}

# Domain Management Endpoints
@app.post("/domains/", response_model=DomainResponse)
async def create_domain(domain: DomainCreate, db: Session = Depends(get_db)):
    """Create a new evaluation domain/category"""
    db_domain = Domain(
        name=domain.name,
        description=domain.description,
        judging_criteria=domain.judging_criteria,
        weight_distribution=domain.weight_distribution
    )
    db.add(db_domain)
    db.commit()
    db.refresh(db_domain)
    return db_domain

@app.get("/domains/", response_model=List[DomainResponse])
async def get_domains(db: Session = Depends(get_db)):
    """Get all evaluation domains"""
    return db.query(Domain).all()

@app.get("/domains/{domain_id}", response_model=DomainResponse)
async def get_domain(domain_id: int, db: Session = Depends(get_db)):
    """Get specific domain by ID"""
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain

# Submission Management Endpoints
@app.post("/submissions/", response_model=SubmissionResponse)
async def create_submission(
    domain_id: int,
    team_name: str,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """Upload and create a new submission"""
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check if domain exists
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    # Create submission record
    submission = Submission(
        domain_id=domain_id,
        team_name=team_name,
        status="uploaded"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    try:
        # Create storage directory for this submission
        submission_dir = UPLOADS_PATH / f"domain_{domain_id}" / f"submission_{submission.id}"
        submission_dir.mkdir(parents=True, exist_ok=True)
        
        # Save PDF file
        pdf_path = submission_dir / "original.pdf"
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update submission with file path
        submission.pdf_file_url = str(pdf_path)
        submission.status = "processing"
        db.commit()
        
        # Queue background processing
        background_tasks.add_task(process_submission, submission.id, str(pdf_path))
        
        logger.info(f"Submission {submission.id} created and queued for processing")
        
        return submission
        
    except Exception as e:
        # Clean up on error
        submission.status = "error"
        db.commit()
        logger.error(f"Error processing submission {submission.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing submission")

async def process_submission(submission_id: int, pdf_path: str):
    """Background task to process PDF and queue evaluation"""
    try:
        # Convert PDF to images
        slides_dir = Path(pdf_path).parent / "slides"
        slides_dir.mkdir(exist_ok=True)
        
        image_paths = pdf_processor.convert_pdf_to_images(pdf_path, str(slides_dir))
        
        # Queue comprehensive evaluation task
        evaluate_presentation_task.delay(submission_id)
        
        logger.info(f"Submission {submission_id} processed and evaluation queued")
        
    except Exception as e:
        logger.error(f"Error in background processing for submission {submission_id}: {str(e)}")
        # Update submission status to error
        db = SessionLocal()
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            submission.status = "error"
            db.commit()
        db.close()

@app.get("/submissions/", response_model=List[SubmissionResponse])
async def get_submissions(
    domain_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all submissions with optional filtering"""
    query = db.query(Submission)
    
    if domain_id:
        query = query.filter(Submission.domain_id == domain_id)
    if status:
        query = query.filter(Submission.status == status)
        
    return query.all()

@app.get("/submissions/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: int, db: Session = Depends(get_db)):
    """Get specific submission by ID"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

# Evaluation Endpoints
@app.get("/submissions/{submission_id}/evaluation", response_model=EvaluationResponse)
async def get_evaluation(submission_id: int, db: Session = Depends(get_db)):
    """Get evaluation results for a submission"""
    evaluation = db.query(SubmissionEvaluation).filter(
        SubmissionEvaluation.submission_id == submission_id
    ).first()
    
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return evaluation

@app.get("/submissions/{submission_id}/score", response_model=ScoreResponse)
async def get_score(submission_id: int, db: Session = Depends(get_db)):
    """Get final score for a submission"""
    score = db.query(SubmissionScore).filter(
        SubmissionScore.submission_id == submission_id
    ).first()
    
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    
    return score

# Analytics Endpoints
@app.get("/analytics/domain/{domain_id}/scores")
async def get_domain_analytics(domain_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific domain"""
    scores = db.query(SubmissionScore).join(Submission).filter(
        Submission.domain_id == domain_id
    ).all()
    
    if not scores:
        return {"message": "No scores found for this domain"}
    
    # Calculate analytics
    total_scores = [score.weighted_total for score in scores]
    criteria_breakdown = {}
    
    for score in scores:
        for criteria, value in score.criteria_breakdown.items():
            if criteria not in criteria_breakdown:
                criteria_breakdown[criteria] = []
            criteria_breakdown[criteria].append(value)
    
    analytics = {
        "total_submissions": len(scores),
        "average_score": sum(total_scores) / len(total_scores),
        "score_distribution": {
            "min": min(total_scores),
            "max": max(total_scores),
            "scores": total_scores
        },
        "criteria_averages": {
            criteria: sum(values) / len(values)
            for criteria, values in criteria_breakdown.items()
        }
    }
    
    return analytics

@app.get("/analytics/processing-stats")
async def get_processing_stats(db: Session = Depends(get_db)):
    """Get processing statistics"""
    evaluations = db.query(SubmissionEvaluation).all()
    
    if not evaluations:
        return {"message": "No evaluations found"}
    
    processing_times = [eval.processing_time_seconds for eval in evaluations if eval.processing_time_seconds]
    
    stats = {
        "total_evaluations": len(evaluations),
        "average_processing_time": sum(processing_times) / len(processing_times) if processing_times else 0,
        "processing_time_distribution": {
            "min": min(processing_times) if processing_times else 0,
            "max": max(processing_times) if processing_times else 0,
            "times": processing_times
        }
    }
    
    return stats

# Health Check Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        
        # Check Redis connection
        redis_client.ping()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": "connected",
                "redis": "connected"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.get("/rate-limit/status")
async def rate_limit_status():
    """Check current rate limit status"""
    can_make_request = await rate_limiter.can_make_request("gemini_api")
    wait_time = await rate_limiter.get_wait_time("gemini_api") if not can_make_request else 0
    
    return {
        "can_make_request": can_make_request,
        "wait_time_seconds": wait_time,
        "requests_per_minute_limit": rate_limiter.max_requests
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)