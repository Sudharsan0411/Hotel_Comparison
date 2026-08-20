# direct_test.py

from app.hotel_services import (
    rank_hotels,
    recommend_hotels
)

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

ranked = rank_hotels(hotels_data)

print("RANKED")
print(ranked)

print("RECOMMENDATIONS")
print(
    recommend_hotels(
        ranked,
        user_events,
        15
    )
)