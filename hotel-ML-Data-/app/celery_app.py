from celery import Celery

celery_app = Celery(
    "hotel_system",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.timezone = "Asia/Kolkata"
celery_app.conf.beat_schedule = {

    "refresh-rankings": {

        "task":
        "tasks.refresh_rankings",

        "schedule":
        3600
    },

    "refresh-recommendations": {

        "task":
        "tasks.refresh_recommendations",

        "schedule":
        3600
    },

    "track-prices": {

        "task":
        "tasks.track_prices_job",

        "schedule":
        900
    },

    "check-alerts": {

        "task":
        "tasks.check_alerts_job",

        "schedule":
        300
    }
}