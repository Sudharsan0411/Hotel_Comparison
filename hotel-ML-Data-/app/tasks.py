from app.celery_app import celery_app

from app.hotel_services import (
    track_prices,
    rank_hotels,
    recommend_hotels,
    check_price_alerts,
    update_preferences
)

from app.api_client import get_hotels, get_alerts


# ==========================================
# PRICE TRACKING
# ==========================================

@celery_app.task
def track_prices_job(hotels_data=None):

    if hotels_data is None:
        try:
            hotels_data = get_hotels()
        except Exception as e:
            print(f"Error fetching hotels in task: {e}")
            hotels_data = []

    return track_prices(
        hotels_data
    )


# ==========================================
# RANKING
# ==========================================

@celery_app.task
def refresh_rankings(hotels_data=None):

    if hotels_data is None:
        try:
            hotels_data = get_hotels()
        except Exception as e:
            print(f"Error fetching hotels in task: {e}")
            hotels_data = []

    return rank_hotels(
        hotels_data
    )


# ==========================================
# RECOMMENDATIONS
# ==========================================

@celery_app.task
def refresh_recommendations(
    hotels_data=None,
    user_events=None,
    user_id=None
):

    if hotels_data is None:
        try:
            hotels_data = get_hotels()
        except Exception as e:
            print(f"Error fetching hotels in task: {e}")
            hotels_data = []

    ranked_hotels = rank_hotels(
        hotels_data
    )

    return recommend_hotels(
        ranked_hotels,
        user_events,
        user_id
    )


# ==========================================
# FEEDBACK LEARNING
# ==========================================

@celery_app.task
def update_user_preferences(
    user_events=None,
    hotels_data=None
):

    if user_events is None:
        user_events = []

    if hotels_data is None:
        try:
            hotels_data = get_hotels()
        except Exception as e:
            print(f"Error fetching hotels in task: {e}")
            hotels_data = []

    return update_preferences(
        user_events,
        hotels_data
    )


# ==========================================
# ALERTS
# ==========================================

@celery_app.task
def check_alerts_job(
    hotels_data=None,
    alerts=None
):

    if hotels_data is None:
        try:
            hotels_data = get_hotels()
        except Exception as e:
            print(f"Error fetching hotels in task: {e}")
            hotels_data = []

    if alerts is None:
        try:
            alerts = get_alerts()
        except Exception as e:
            print(f"Error fetching alerts in task: {e}")
            alerts = []

    tracked_prices = track_prices(
        hotels_data
    )

    return check_price_alerts(
        tracked_prices,
        alerts
    )