# test_csv_pipeline.py
# Tests the full ML pipeline using real hotel data from the CSV file

from app.csv_loader import load_hotels_from_csv

from app.hotel_services import (
    track_prices,
    rank_hotels,
    recommend_hotels,
    update_preferences
)

# =============================================
# Load real hotel data from CSV
# =============================================

hotels_data = load_hotels_from_csv()

# Sample user events (replace with real API data when available)
user_events = [
    {
        "user_id": 15,
        "hotel_id": hotels_data[0]["id"] if hotels_data else 1,
        "event_type": "booking"
    },
    {
        "user_id": 15,
        "hotel_id": hotels_data[1]["id"] if len(hotels_data) > 1 else 2,
        "event_type": "view"
    }
]

print("\n===== HOTELS LOADED FROM CSV =====")
print(f"Total Hotels: {len(hotels_data)}")
print("Sample (first 3):")
for h in hotels_data[:3]:
    print(f"  {h['name']} | Price: INR {h['price']} | Rating: {h['rating']}")

print("\n===== PRICE TRACKING =====")
tracked = track_prices(hotels_data)
print(f"Tracked {len(tracked)} hotel prices.")

print("\n===== RANKING (Top 5) =====")
ranked = rank_hotels(hotels_data)
for r in ranked[:5]:
    print(
        f"  {r['name']} | Score: {r['hotel_score']} "
        f"| Price: INR {r['price']} | Rating: {r['rating']}"
    )

print("\n===== RECOMMENDATIONS FOR USER 15 (Top 5) =====")
recommendations = recommend_hotels(ranked, user_events, 15)
for rec in recommendations[:5]:
    print(
        f"  {rec['hotel_name']} | Final Score: {rec['final_score']} "
        f"| User Type: {rec['user_type']}"
    )

print("\n===== USER PREFERENCES =====")
prefs = update_preferences(user_events, hotels_data)
print(prefs)
