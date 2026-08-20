import requests
from app.config import BASE_URL


def get_alerts(jwt_token=None):

    headers = {}

    if jwt_token:
        headers["Authorization"] = (
            f"Bearer {jwt_token}"
        )

    response = requests.get(
        f"{BASE_URL}/alerts",
        headers=headers
    )

    response.raise_for_status()

    return response.json()


def get_fcm_token(
    user_id,
    jwt_token=None
):

    headers = {}

    if jwt_token:
        headers["Authorization"] = (
            f"Bearer {jwt_token}"
        )

    response = requests.get(
        f"{BASE_URL}/fcm-token/{user_id}",
        headers=headers
    )

    response.raise_for_status()

    return response.json()


def get_hotels():

    response = requests.get(
        f"{BASE_URL}/hotels"
    )

    response.raise_for_status()

    return response.json()


def get_user_events(
    user_id,
    jwt_token=None
):

    headers = {}

    if jwt_token:
        headers["Authorization"] = (
            f"Bearer {jwt_token}"
        )

    response = requests.get(
        f"{BASE_URL}/user-events/{user_id}",
        headers=headers
    )

    response.raise_for_status()

    return response.json()