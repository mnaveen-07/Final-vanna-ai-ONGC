"""
Celery worker configuration.
Background tasks for schema ingestion, query caching, etc.
"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "vanna-platform",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task
def health_check():
    """Simple task to verify Celery is working."""
    return {"status": "ok", "service": "celery-worker"}
