# run_pipeline.py
# Runs the complete ML pipeline directly from the CSV in the app folder

from app.csv_loader import load_hotels_from_csv

from app.hotel_services import (
    track_prices,
    rank_hotels,
    recommend_hotels,
    update_preferences,
    check_price_alerts,
    ml_pipeline
)

print("\n" + "="*60)
print("  HOTEL ML PIPELINE - FULL RUN")
print("="*60)

# ─────────────────────────────────────────
# STEP 1: Load real hotel data from CSV
# ─────────────────────────────────────────

hotels_data = load_hotels_from_csv()

print(f"\n[STEP 1] Hotels Loaded: {len(hotels_data)}")
print("  Sample Hotels:")
for h in hotels_data[:5]:
    print(
        f"    - {h['name']} | "
        f"City: {h['city']} | "
        f"Price: INR {h['price']} | "
        f"Rating: {h['rating']} | "
        f"Category: {h['price_category']}"
    )

# ─────────────────────────────────────────
# STEP 2: Price Tracking
# ─────────────────────────────────────────

tracked = track_prices(hotels_data)

print(f"\n[STEP 2] Price Tracking: {len(tracked)} hotels tracked")
print("  Sample Tracked Prices (first 3):")
for t in tracked[:3]:
    print(
        f"    - {t['hotel_name']} | "
        f"Price: INR {t['current_price']} | "
        f"Timestamp: {t['timestamp']}"
    )

# ─────────────────────────────────────────
# STEP 3: Hotel Ranking
# ─────────────────────────────────────────

ranked = rank_hotels(hotels_data)

print(f"\n[STEP 3] Ranking: {len(ranked)} hotels ranked")
print("  Top 10 Ranked Hotels:")
for i, r in enumerate(ranked[:10], 1):
    print(
        f"    {i}. {r['name']} | "
        f"Score: {r['hotel_score']} | "
        f"Price: INR {r['price']} | "
        f"Rating: {r['rating']}"
    )

# ─────────────────────────────────────────
# STEP 4: Recommendations (returning user)
# ─────────────────────────────────────────

user_id = 15

user_events = [
    {
        "user_id": user_id,
        "hotel_id": hotels_data[0]["id"],
        "event_type": "booking"
    },
    {
        "user_id": user_id,
        "hotel_id": hotels_data[1]["id"],
        "event_type": "view"
    },
    {
        "user_id": user_id,
        "hotel_id": hotels_data[2]["id"],
        "event_type": "favorite"
    }
]

recommendations = recommend_hotels(ranked, user_events, user_id)

print(f"\n[STEP 4] Recommendations for User {user_id} (Returning User):")
print("  Top 10 Recommended Hotels:")
for i, rec in enumerate(recommendations[:10], 1):
    print(
        f"    {i}. {rec['hotel_name']} | "
        f"Final Score: {rec['final_score']} | "
        f"Hotel Score: {rec['hotel_score']} | "
        f"Rec Score: {rec['recommendation_score']}"
    )

# ─────────────────────────────────────────
# STEP 5: New User Recommendations
# ─────────────────────────────────────────

new_user_recs = recommend_hotels(ranked, [], 99)

print(f"\n[STEP 5] Recommendations for New User (User 99):")
print("  Top 5 (General Rankings):")
for i, rec in enumerate(new_user_recs[:5], 1):
    print(
        f"    {i}. {rec['hotel_name']} | "
        f"Final Score: {rec['final_score']} | "
        f"User Type: {rec['user_type']}"
    )

# ─────────────────────────────────────────
# STEP 6: Price Alerts
# ─────────────────────────────────────────

alerts = [
    {
        "user_id": user_id,
        "hotel_id": hotels_data[0]["id"],
        "target_price": hotels_data[0]["price"] + 500
    },
    {
        "user_id": user_id,
        "hotel_id": hotels_data[5]["id"],
        "target_price": hotels_data[5]["price"] + 200
    }
]

notifications = check_price_alerts(tracked, alerts)

print(f"\n[STEP 6] Price Alerts: {len(notifications)} notification(s) triggered")
for n in notifications:
    print(
        f"    - User {n['user_id']} | "
        f"Hotel ID: {n['hotel_id']} | "
        f"Message: {n['message']}"
    )

# ─────────────────────────────────────────
# STEP 7: Feedback / Preference Learning
# ─────────────────────────────────────────

prefs = update_preferences(user_events, hotels_data)

print(f"\n[STEP 7] User Preference Learning:")
for uid, pref in prefs.items():
    print(
        f"    User {uid} -> "
        f"Views: {pref['views']} | "
        f"Favorites: {pref['favorites']} | "
        f"Bookings: {pref['bookings']}"
    )

# ─────────────────────────────────────────
# STEP 8: Full ML Pipeline (Combined)
# ─────────────────────────────────────────

print(f"\n[STEP 8] Running Full ml_pipeline() function...")
result = ml_pipeline(
    hotels_data=hotels_data,
    user_events=user_events,
    user_id=user_id,
    alerts=alerts
)

print("  ml_pipeline() Output Summary:")
print(f"    - tracked_prices   : {len(result['tracked_prices'])} hotels")
print(f"    - ranked_hotels    : {len(result['ranked_hotels'])} hotels")
print(f"    - recommendations  : {len(result['recommendations'])} hotels")
print(f"    - user_preferences : {result['user_preferences']}")
print(f"    - notifications    : {len(result['notifications'])} alert(s)")

print("\n" + "="*60)
print("  ALL PIPELINE STEPS COMPLETED SUCCESSFULLY")
print("="*60 + "\n")
