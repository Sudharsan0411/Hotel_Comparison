from app.api_client import (
    get_alerts,
    get_fcm_token,
    get_user_events
)

print(
    get_alerts()
)

print(
    get_fcm_token(15)
)

print(
    get_user_events(15)
)