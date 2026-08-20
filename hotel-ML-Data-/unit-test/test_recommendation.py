# test_recommendation.py

from app.tasks import refresh_recommendations

hotels_data = [
    {
        "id": 1,
        "name": "Taj Bangalore",
        "price": 7500,
        "rating": 4.8
    },
    {
        "id": 2,
        "name": "Leela Palace",
        "price": 12000,
        "rating": 4.9
    }
]

user_events = [
    {
        "user_id": 15,
        "hotel_id": 1,
        "event_type": "booking"
    }
]

result = refresh_recommendations.delay(
    hotels_data,
    user_events,
    15
)

print(result.get(timeout=10))