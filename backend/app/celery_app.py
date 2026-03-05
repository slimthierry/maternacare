"""Celery application configuration for MaternaCare."""

from celery import Celery

from app.config.settings import settings

celery_app = Celery(
    "maternacare",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.alert_tasks",
        "app.tasks.appointment_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Paris",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "check-upcoming-deliveries": {
        "task": "app.tasks.alert_tasks.check_upcoming_deliveries",
        "schedule": 3600.0,  # Every hour
    },
    "check-overdue-appointments": {
        "task": "app.tasks.alert_tasks.check_overdue_appointments",
        "schedule": 3600.0,  # Every hour
    },
    "send-appointment-reminders": {
        "task": "app.tasks.appointment_tasks.send_appointment_reminders",
        "schedule": 3600.0,  # Every hour
    },
}
