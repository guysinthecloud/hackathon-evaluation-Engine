# celery_app.py
from celery import Celery
import os
import redis
from kombu import Queue
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)

# Create Celery app
celery_app = Celery(
    "hackathon_evaluation",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["celery_tasks"]
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Worker settings
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    
    # Rate limiting
    task_default_rate_limit="10/m",  # 10 tasks per minute
    
    # Retry settings
    task_default_retry_delay=60,
    task_max_retries=3,
      # Queue configuration
    task_routes={
        "celery_tasks.evaluate_presentation_task": {"queue": "evaluation"},
        "celery_tasks.process_submission_task": {"queue": "processing"},
        "celery_tasks.calculate_rankings_task": {"queue": "scoring"},
        "celery_tasks.calculate_score_task": {"queue": "scoring"},
    },
    
    # Define queues
    task_queues=(
        Queue("evaluation", routing_key="evaluation"),
        Queue("processing", routing_key="processing"),
        Queue("scoring", routing_key="scoring"),
    ),
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
)