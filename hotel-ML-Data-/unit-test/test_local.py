# test_local.py

from app.hotel_services import (
    rank_hotels,
    track_prices,
    recommend_hotels,
    update_preferences
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

print("\n===== RANKING =====")
print(rank_hotels(hotels_data))

print("\n===== PRICE TRACKING =====")
print(track_prices(hotels_data))

print("\n===== RECOMMENDATIONS =====")
ranked_hotels = rank_hotels(hotels_data)

print(
    recommend_hotels(
        ranked_hotels,
        user_events,
        15
    )
)

print("\n===== PREFERENCES =====")
print(
    update_preferences(
        user_events,
        hotels_data
    )
)