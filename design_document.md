# Hackathon PPT Submission Evaluation Engine

## 🎯 System Overview

A comprehensive evaluation system that automatically assesses hackathon presentation submissions using AI-powered analysis. The system converts PDF presentations to images, analyzes each slide using Google AI Studio, and provides structured scoring based on predefined criteria.

## 🏗️ System Architecture

### High-Level Flow
```
PDF Upload → PDF to Images → Rate-Limited Queue → Single LLM Analysis (All Slides) → Score Calculation → Results Dashboard
```

### Core Components
1. **File Management System** - Handle PDF uploads and local storage
2. **PDF Processing Service** - Convert PDFs to high-quality images locally
3. **Domain Management** - Organize submissions by hackathon categories
4. **Rate-Limited LLM Service** - Process all slides together through Gemini 2.5 Flash
5. **Celery Task Queue** - Handle async processing with rate limiting
6. **Scoring System** - Calculate final scores from comprehensive evaluation
7. **Results Dashboard** - Display evaluation results and analytics

## 🛠️ Recommended Tech Stack

### Backend
- **Framework**: Python with FastAPI
- **Database**: PostgreSQL (structured data) + Redis (caching & rate limiting)
- **File Storage**: Local filesystem with organized directory structure
- **PDF Processing**: PyPDF2 + pdf2image (Poppler)
- **Queue System**: Celery with Redis broker
- **API Documentation**: FastAPI auto-generated OpenAPI/Swagger

### Frontend
- **Framework**: Next.js with TypeScript
- **UI Library**: Material-UI or Tailwind CSS with shadcn/ui
- **State Management**: Zustand or SWR for server state
- **Charts**: Chart.js or Recharts
- **File Upload**: Built-in Next.js file upload with drag-and-drop

### AI Integration
- **LLM Service**: Google AI Studio SDK (Gemini 2.5 Flash)
- **Image Processing**: Pillow (PIL) for image optimization
- **Rate Limiting**: Custom implementation with Redis

### Local File Storage Structure
```
/storage/
├── uploads/
│   ├── domain_1/
│   │   ├── submission_1/
│   │   │   ├── original.pdf
│   │   │   └── slides/
│   │   │       ├── slide_1.png
│   │   │       ├── slide_2.png
│   │   │       └── ...
│   │   └── submission_2/
│   └── domain_2/
├── temp/
└── processed/
```

### Rate Limiting Strategy
- **Redis-based rate limiter** for Gemini API calls
- **Queue delay mechanism** ensuring 10 requests/minute limit
- **Retry logic** with exponential backoff
- **Priority queue** for urgent evaluations

## 📊 Database Schema

### Core Tables
```sql
-- Domains/Categories
domains (
  id, name, description, 
  judging_criteria (JSON), 
  weight_distribution (JSON),
  created_at, updated_at
)

-- Submissions
submissions (
  id, domain_id, team_name, 
  pdf_file_url, status,
  total_score, evaluation_completed_at,
  created_at, updated_at
)

-- Individual submission evaluations (single comprehensive evaluation)
submission_evaluations (
  id, submission_id, 
  all_slides_analysis (JSON),
  gemini_response (JSON),
  criteria_scores (JSON),
  overall_feedback (TEXT),
  processing_time_seconds,
  created_at
)

-- Rate limiting tracking
api_rate_limits (
  id, api_key_hash, 
  requests_count, 
  window_start_time,
  last_request_time
)

-- Final aggregated scores
submission_scores (
  id, submission_id,
  criteria_breakdown (JSON),
  weighted_total, raw_total,
  ranking_position
)
```

## 🎯 Judging Criteria Framework

### Standard Criteria Categories
1. **Innovation & Creativity** (20%)
   - Uniqueness of solution
   - Creative problem-solving approach
   - Novel use of technology

2. **Technical Implementation** (25%)
   - Code quality and architecture
   - Technology stack appropriateness
   - Scalability considerations

3. **Problem Definition & Solution Fit** (20%)
   - Clear problem statement
   - Solution relevance
   - Market need validation

4. **Presentation Quality** (15%)
   - Slide design and clarity
   - Information organization
   - Visual appeal

5. **Business Viability** (10%)
   - Market potential
   - Monetization strategy
   - Competitive analysis

6. **Demo & Prototype** (10%)
   - Working demonstration
   - Feature completeness
   - User experience

### Domain-Specific Criteria
Each domain can have customized criteria with different weightings:
- **FinTech**: Security, Compliance, User Trust
- **HealthTech**: Patient Safety, Data Privacy, Clinical Validation
- **EdTech**: Learning Effectiveness, Accessibility, Engagement
- **AI/ML**: Model Performance, Data Quality, Ethical Considerations

## 🔄 Detailed System Flow

### 1. Submission Phase
```
User uploads PDF → Validate file → Store in cloud storage → Create submission record → Queue for processing
```

### 2. Processing Phase
```
PDF → Convert to images (300 DPI) → Store locally → Queue submission for comprehensive evaluation
```

### 3. Evaluation Phase (Single Comprehensive Analysis)
```
Prepare all slide images → Check rate limit → Send all images to Gemini 2.5 Flash → Parse comprehensive response → Store complete evaluation
```

### 4. Scoring Phase
```
Extract scores from comprehensive analysis → Apply domain-specific weighting → Calculate final score → Update rankings → Generate detailed report
```

## 🤖 LLM Integration Strategy

### Comprehensive Presentation Analysis Prompt
```
You are an expert hackathon judge evaluating a complete presentation submission. 
You will receive all slides of a presentation as images to analyze the entire narrative flow and coherence.

IMPORTANT: Analyze the presentation as a complete story, considering:
- How well slides connect and flow together
- Overall narrative coherence and structure
- Consistency in messaging across slides
- Complete project comprehension

Evaluation Criteria (score 1-10 for each):
1. Innovation & Creativity - Uniqueness and creative problem-solving
2. Technical Implementation - Architecture, code quality, technology choices
3. Problem-Solution Fit - Problem clarity and solution relevance  
4. Presentation Quality - Design, organization, visual appeal
5. Business Viability - Market potential and monetization strategy
6. Demo & Prototype - Working demonstration and completeness

Additional Analysis:
- Presentation Flow Score (1-10): How well slides connect narratively
- Completeness Score (1-10): Whether all essential aspects are covered
- Consistency Score (1-10): Message consistency across slides

Respond in this JSON format:
{
  "overall_analysis": {
    "presentation_flow_score": 8,
    "completeness_score": 7,
    "consistency_score": 9,
    "total_slides_analyzed": 12
  },
  "criteria_scores": {
    "innovation": 8,
    "technical": 7,
    "problem_fit": 9,
    "presentation": 6,
    "business": 7,
    "demo": 5
  },
  "detailed_feedback": {
    "strengths": ["Excellent problem identification", "Clear technical architecture", "Strong business model"],
    "weaknesses": ["Demo section unclear", "Missing implementation timeline"],
    "suggestions": ["Add more technical details", "Include user feedback", "Strengthen demo section"]
  },
  "slide_by_slide_notes": [
    {"slide": 1, "note": "Strong opening with clear problem statement"},
    {"slide": 2, "note": "Good market analysis but needs more data"},
    ...
  ],
  "executive_summary": "This presentation demonstrates a solid understanding of the problem space with an innovative technical solution. The narrative flows well but would benefit from a stronger demonstration section."
}
```

### Rate Limiting Implementation
```python
# FastAPI + Redis rate limiter
from fastapi import HTTPException
import redis
import time

class GeminiRateLimiter:
    def __init__(self, redis_client, max_requests=10, window_minutes=1):
        self.redis = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_minutes * 60
        
    async def can_make_request(self, api_key_hash: str) -> bool:
        current_time = int(time.time())
        window_start = current_time - self.window_seconds
        
        # Remove old requests
        self.redis.zremrangebyscore(f"rate_limit:{api_key_hash}", 0, window_start)
        
        # Count current requests in window
        request_count = self.redis.zcard(f"rate_limit:{api_key_hash}")
        
        if request_count >= self.max_requests:
            return False
            
        # Add current request
        self.redis.zadd(f"rate_limit:{api_key_hash}", {str(current_time): current_time})
        self.redis.expire(f"rate_limit:{api_key_hash}", self.window_seconds)
        
        return True
        
    async def get_wait_time(self, api_key_hash: str) -> int:
        """Returns seconds to wait before next request is allowed"""
        oldest_request = self.redis.zrange(f"rate_limit:{api_key_hash}", 0, 0, withscores=True)
        if not oldest_request:
            return 0
        
        oldest_time = oldest_request[0][1]
        wait_time = int(oldest_time + self.window_seconds - time.time())
        return max(0, wait_time)
```

### Celery Task with Rate Limiting
```python
from celery import Celery
import asyncio

@celery_app.task(bind=True, max_retries=3)
def evaluate_presentation_comprehensive(self, submission_id: int):
    try:
        # Check rate limit
        if not rate_limiter.can_make_request("gemini_api"):
            wait_time = rate_limiter.get_wait_time("gemini_api")
            # Retry after wait time
            raise self.retry(countdown=wait_time)
        
        # Load all slide images
        slide_images = load_submission_images(submission_id)
        
        # Send comprehensive prompt to Gemini 2.5 Flash
        response = await gemini_client.analyze_complete_presentation(
            images=slide_images,
            domain_criteria=get_domain_criteria(submission_id)
        )
        
        # Store comprehensive evaluation
        store_evaluation_results(submission_id, response)
        
        return {"status": "success", "submission_id": submission_id}
        
    except Exception as e:
        # Exponential backoff retry
        raise self.retry(countdown=60 * (2 ** self.request.retries))
```

## 📈 Advanced Features

### Real-time Processing
- WebSocket connections for live progress updates
- Rate limit status monitoring
- Processing queue visualization with ETA
- Comprehensive evaluation progress tracking

### Analytics Dashboard
- Score distribution charts across all criteria
- Presentation flow analysis
- Domain-wise performance comparisons
- Rate limit usage analytics
- Processing time metrics

### Comprehensive Evaluation Features
- Complete presentation narrative analysis
- Cross-slide consistency checking
- Flow and coherence scoring
- Slide-by-slide detailed feedback
- Executive summary generation

### Integration Capabilities
- REST API for external systems
- Webhook notifications
- CSV/Excel export functionality
- Slack/Discord bot integration

## 🔧 Implementation Phases

### Phase 1 (MVP - 2-3 weeks)
- Basic PDF upload and local storage
- PDF to image conversion pipeline
- Single domain support
- Rate-limited Gemini 2.5 Flash integration
- Comprehensive presentation evaluation
- Basic scoring dashboard

### Phase 2 (Enhanced - 2-3 weeks)
- Multiple domain support with custom criteria
- Advanced rate limiting and queue management
- Detailed analytics and flow analysis
- WebSocket real-time updates
- Presentation coherence scoring

### Phase 3 (Production - 2-3 weeks)
- User authentication and role-based access
- Advanced security measures
- Performance optimization for local deployment
- Batch processing capabilities
- Export and reporting features

## 🛡️ Security & Compliance

### Data Protection
- Encrypt PDFs at rest and in transit
- Implement file size and type restrictions
- Audit logs for all evaluations
- GDPR compliance for participant data

### API Security
- Rate limiting on uploads and API calls
- API key management for Google AI Studio
- Input validation and sanitization
- CORS configuration

## 📊 Performance Considerations

### Optimization Strategies
- Parallel processing of slides
- Image compression without quality loss
- Database query optimization
- CDN for static assets
- Caching frequently accessed data

### Scaling Approach
- Horizontal scaling with load balancers
- Database sharding by domain
- Microservices architecture for large deployments
- Queue-based processing for handling spikes

This comprehensive system design provides a robust foundation for building your hackathon evaluation engine while maintaining flexibility for future enhancements.