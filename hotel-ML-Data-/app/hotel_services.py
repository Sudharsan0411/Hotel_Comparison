from datetime import datetime, UTC

import pandas as pd
from sklearn.preprocessing import MinMaxScaler

from app.api_client import (
    # get_fcm_token,   # Disabled: requires live backend
    get_user_events,
    get_hotels,
    get_alerts
)

# from app.firebase_service import (
#     send_push_notification   # Disabled: requires Firebase credentials
# )


# =====================================================
# PRICE TRACKING
# =====================================================

def track_prices(hotels_data):

    try:

        if not hotels_data:
            return []

        timestamp = datetime.now(
            UTC
        ).isoformat()

        return [
            {
                "hotel_id": hotel["id"],
                "hotel_name": hotel["name"],
                "current_price": hotel["price"],
                "timestamp": timestamp
            }
            for hotel in hotels_data
            if (
                "id" in hotel
                and "name" in hotel
                and "price" in hotel
            )
        ]

    except Exception as e:

        print(
            f"Error in track_prices: {e}"
        )

        return []


# =====================================================
# RANKING SYSTEM
# =====================================================

def rank_hotels(hotels_data):

    try:

        if not hotels_data:
            return []

        df = pd.DataFrame(
            hotels_data
        )

        required_columns = [
            "id",
            "name",
            "price",
            "rating"
        ]

        for column in required_columns:

            if column not in df.columns:

                raise ValueError(
                    f"Missing column: {column}"
                )

        scaler = MinMaxScaler()

        # Lower price = better

        df["price_score"] = (
            1 -
            scaler.fit_transform(
                df[["price"]]
            ).flatten()
        ).round(4)

        # Higher rating = better

        df["rating_score"] = (
            scaler.fit_transform(
                df[["rating"]]
            ).flatten()
        ).round(4)

        # Balanced formula for general audience (all user types)

        df["hotel_score"] = (
            0.50 * df["price_score"]
            +
            0.50 * df["rating_score"]
        ).round(4)

        df = df.sort_values(
            by="hotel_score",
            ascending=False
        )

        return df.to_dict(
            "records"
        )

    except Exception as e:

        print(
            f"Error in rank_hotels: {e}"
        )

        return []


# =====================================================
# RECOMMENDATION SYSTEM
# =====================================================

EVENT_WEIGHTS = {
    "search": 1,
    "view": 2,
    "favorite": 4,
    "booking": 8
}


def recommend_hotels(
    ranked_hotels,
    user_events,
    user_id,
    jwt_token=None
):

    try:

        if not ranked_hotels:
            return []

        if user_events is None:
            if user_id is not None:
                try:
                    user_events = get_user_events(
                        user_id,
                        jwt_token
                    )
                except Exception as e:
                    print(
                        f"Error fetching user events for {user_id}: {e}"
                    )
                    user_events = []
            else:
                user_events = []

        user_history = [

            event

            for event in user_events

            if event.get(
                "user_id"
            ) == user_id
        ]

        # ----------------------------------
        # NEW USER
        # ----------------------------------

        if not user_history:

            recommendations = []

            for hotel in ranked_hotels:

                recommendations.append(
                    {
                        "hotel_id":
                            hotel["id"],

                        "hotel_name":
                            hotel["name"],
                        "price": hotel.get("price", 0),
                        "rating": hotel.get("rating", 0),
                        "city": hotel.get("city", ""),
                        "area": hotel.get("area", ""),
                        "platform": hotel.get("platform", ""),
                        "image": hotel.get("image", ""),
                        "photo_url": hotel.get("photo_url", ""),
                            

                        "hotel_score":
                            round(
                                hotel["hotel_score"],
                                4
                            ),

                        "recommendation_score":
                            0,

                        "final_score":
                            round(
                                hotel["hotel_score"],
                                4
                            ),

                        "user_type":
                            "new_user"
                    }
                )

            return recommendations

        # ----------------------------------
        # RETURNING USER
        # ----------------------------------

        recommendations = []

        for hotel in ranked_hotels:

            recommendation_score = 0

            hotel_events = [

                event

                for event in user_history

                if event.get(
                    "hotel_id"
                ) == hotel["id"]
            ]

            for event in hotel_events:

                recommendation_score += (

                    EVENT_WEIGHTS.get(
                        event.get(
                            "event_type"
                        ),
                        0
                    )
                )

            recommendation_score += (
                hotel["rating"] * 5
            )

            if hotel["price"] <= 8000:

                recommendation_score += 10

            normalized_recommendation = (
                recommendation_score / 50
            )

            final_score = (

                0.70 *
                hotel["hotel_score"]

                +

                0.30 *
                normalized_recommendation
            )

            recommendations.append(
                {
                    "hotel_id":
                        hotel["id"],

                    "hotel_name":
                        hotel["name"],

                    "hotel_score":
                        round(
                            hotel["hotel_score"],
                            4
                        ),

                    "recommendation_score":
                        round(
                            recommendation_score,
                            2
                        ),

                    "final_score":
                        round(
                            final_score,
                            4
                        ),

                    "user_type":
                        "returning_user"
                }
            )

        recommendations.sort(
            key=lambda x:
            x["final_score"],
            reverse=True
        )

        return recommendations

    except Exception as e:

        print(
            f"Error in recommend_hotels: {e}"
        )

        return []


# =====================================================
# ALERTS
# =====================================================

def check_price_alerts(
    tracked_prices,
    alerts
):

    try:

        if not tracked_prices:
            return []

        if not alerts:
            return []

        notifications = []

        for alert in alerts:

            for hotel in tracked_prices:

                if (
                    hotel["hotel_id"]
                    == alert["hotel_id"]
                    and
                    hotel["current_price"]
                    <= alert["target_price"]
                ):

                    notifications.append(
                        {
                            "user_id":
                                alert["user_id"],

                            "hotel_id":
                                hotel["hotel_id"],

                            "message":
                                (
                                    f"Price dropped to "
                                    f"{hotel['current_price']}"
                                )
                        }
                    )

        return notifications 

    except Exception as e:

        print(
            f"Error in check_price_alerts: {e}"
        )

        return []


def send_notification(
    user_id,
    hotel_id,
    message
):

    try:

        print(
            "\n===== NOTIFICATION ====="
        )

        print(
            f"User ID: {user_id}"
        )

        print(
            f"Hotel ID: {hotel_id}"
        )

        print(
            f"Message: {message}"
        )

        print(
            "========================\n"
        )

    except Exception as e:

        print(
            f"Error in send_notification: {e}"
        )



def process_alerts(
    tracked_prices,
    alerts,
    jwt_token=None
):

    notifications = (
        check_price_alerts(
            tracked_prices,
            alerts
        )
    )

    for notification in notifications:

        # FCM & Firebase disabled until backend is live
        # -----------------------------------------------
        # token_response = (
        #     get_fcm_token(
        #         notification["user_id"],
        #         jwt_token
        #     )
        # )
        # fcm_token = token_response.get("fcm_token")
        # send_push_notification(
        #     fcm_token,
        #     "Hotel Price Alert",
        #     notification["message"]
        # )

        print(
            f"[ALERT] User {notification['user_id']} -> "
            f"{notification['message']} "
            f"(FCM disabled)"
        )

    return notifications

# =====================================================
# FEEDBACK LEARNING
# =====================================================

def update_preferences(
    user_events,
    hotels_data
):

    try:

        if not user_events:
            return {}

        user_preferences = {}

        for event in user_events:

            user_id = event["user_id"]

            if user_id not in user_preferences:

                user_preferences[user_id] = {
                    "views": 0,
                    "favorites": 0,
                    "bookings": 0
                }

            if event["event_type"] == "view":

                user_preferences[user_id][
                    "views"
                ] += 1

            elif (
                event["event_type"]
                == "favorite"
            ):

                user_preferences[user_id][
                    "favorites"
                ] += 1

            elif (
                event["event_type"]
                == "booking"
            ):

                user_preferences[user_id][
                    "bookings"
                ] += 1

        return user_preferences

    except Exception as e:

        print(
            f"Error in update_preferences: {e}"
        )

        return {}


# =====================================================
# ML PIPELINE
# =====================================================

def ml_pipeline(
    hotels_data=None,
    user_events=None,
    user_id=None,
    alerts=None,
    jwt_token=None
):

    try:

        if hotels_data is None:
            try:
                hotels_data = get_hotels()
            except Exception as e:
                print(f"Error fetching hotels in ml_pipeline: {e}")
                hotels_data = []

        if user_events is None and user_id is not None:
            try:
                user_events = get_user_events(user_id, jwt_token)
            except Exception as e:
                print(f"Error fetching user events in ml_pipeline for {user_id}: {e}")
                user_events = []

        if alerts is None:
            try:
                alerts = get_alerts(jwt_token)
            except Exception as e:
                print(f"Error fetching alerts in ml_pipeline: {e}")
                alerts = []

        tracked_prices = track_prices(
            hotels_data
        )

        ranked_hotels = rank_hotels(
            hotels_data
        )

        recommendations = (
            recommend_hotels(
                ranked_hotels,
                user_events,
                user_id,
                jwt_token
            )
        )

        user_preferences = (
            update_preferences(
                user_events,
                hotels_data
            )
        )

        notifications = []

        if alerts:

           notifications = (
                process_alerts(
                    tracked_prices,
                    alerts,
                    jwt_token
                )
            )
        return {

            "tracked_prices":
                tracked_prices,

            "ranked_hotels":
                ranked_hotels,

            "recommendations":
                recommendations,

            "user_preferences":
                user_preferences,

            "notifications":
                notifications
        }

    except Exception as e:

        print(
            f"Error in ml_pipeline: {e}"
        )

        return {
            "tracked_prices": [],
            "ranked_hotels": [],
            "recommendations": [],
            "user_preferences": {},
            "notifications": []
        }