"""
Full verification: hotel_services.py ML logic + all 4 FastAPI endpoints
"""

import requests
import json

BASE = "http://localhost:8000"
PASS = "[PASS]"
FAIL = "[FAIL]"

results = []

def check(label, condition, detail=""):
    status = PASS if condition else FAIL
    results.append((status, label))
    print(f"{status}  {label}")
    if detail:
        print(f"       {detail}")

print("\n" + "="*60)
print("  FULL VERIFICATION: Hotel Services + API Endpoints")
print("="*60)


# ─────────────────────────────────────────────────────────────
# SECTION 1: hotel_services.py — Core ML Logic
# ─────────────────────────────────────────────────────────────

print("\n--- hotel_services.py Core ML Logic ---\n")

from app.csv_loader import load_hotels_from_csv
from app.hotel_services import (
    track_prices,
    rank_hotels,
    recommend_hotels,
    update_preferences,
    check_price_alerts
)

hotels = load_hotels_from_csv()
check("CSV Loader: loads hotels",            len(hotels) > 0,          f"{len(hotels)} hotels loaded")

# Price Tracking
tracked = track_prices(hotels)
check("track_prices: returns data",          len(tracked) == len(hotels), f"{len(tracked)} prices tracked")
check("track_prices: has hotel_id",          "hotel_id" in tracked[0])
check("track_prices: has current_price",     "current_price" in tracked[0])
check("track_prices: has timestamp",         "timestamp" in tracked[0])

# Ranking
ranked = rank_hotels(hotels)
check("rank_hotels: returns data",           len(ranked) > 0,          f"{len(ranked)} hotels ranked")
check("rank_hotels: has hotel_score",        "hotel_score" in ranked[0])
check("rank_hotels: has price_score",        "price_score" in ranked[0])
check("rank_hotels: has rating_score",       "rating_score" in ranked[0])
check("rank_hotels: sorted descending",      ranked[0]["hotel_score"] >= ranked[-1]["hotel_score"])
check("rank_hotels: 50/50 formula",
    abs(ranked[0]["hotel_score"] - (
        0.5 * ranked[0]["price_score"] + 0.5 * ranked[0]["rating_score"]
    )) < 0.001
)

# Recommendations — returning user
user_events = [
    {"user_id": 15, "hotel_id": hotels[0]["id"], "event_type": "booking"},
    {"user_id": 15, "hotel_id": hotels[1]["id"], "event_type": "view"},
    {"user_id": 15, "hotel_id": hotels[2]["id"], "event_type": "favorite"},
]
recs = recommend_hotels(ranked, user_events, 15)
check("recommend_hotels: returning user recs",  len(recs) > 0)
check("recommend_hotels: has final_score",       "final_score" in recs[0])
check("recommend_hotels: has user_type",         "user_type" in recs[0])
check("recommend_hotels: returning_user flag",   recs[0]["user_type"] == "returning_user")

# Recommendations — new user
new_recs = recommend_hotels(ranked, [], 99)
check("recommend_hotels: new user recs",         len(new_recs) > 0)
check("recommend_hotels: new_user flag",         new_recs[0]["user_type"] == "new_user")

# Preferences
prefs = update_preferences(user_events, hotels)
check("update_preferences: user 15 found",   15 in prefs)
check("update_preferences: bookings count",  prefs[15]["bookings"] == 1)
check("update_preferences: views count",     prefs[15]["views"] == 1)
check("update_preferences: favorites count", prefs[15]["favorites"] == 1)

# Price Alerts
alerts = [
    {"user_id": 15, "hotel_id": hotels[0]["id"], "target_price": hotels[0]["price"] + 100}
]
notifications = check_price_alerts(tracked, alerts)
check("check_price_alerts: alert triggered",  len(notifications) > 0)
check("check_price_alerts: has message",      "message" in notifications[0])


# ─────────────────────────────────────────────────────────────
# SECTION 2: FastAPI Endpoints
# ─────────────────────────────────────────────────────────────

print("\n--- FastAPI Endpoints ---\n")

# GET /ml-health
try:
    r = requests.get(f"{BASE}/ml-health", timeout=5)
    data = r.json()
    check("GET /ml-health: status 200",          r.status_code == 200)
    check("GET /ml-health: status=ok",           data["status"] == "ok")
    check("GET /ml-health: hotels_loaded > 0",   data["hotels_loaded"] > 0,  f"{data['hotels_loaded']} hotels")
except Exception as e:
    check("GET /ml-health",                      False,                       str(e))

# GET /ranked-hotels
try:
    r = requests.get(f"{BASE}/ranked-hotels", params={"limit": 5}, timeout=10)
    data = r.json()
    check("GET /ranked-hotels: status 200",       r.status_code == 200)
    check("GET /ranked-hotels: has ranked list",  len(data["ranked_hotels"]) == 5)
    check("GET /ranked-hotels: hotel has score",  "hotel_score" in data["ranked_hotels"][0])
except Exception as e:
    check("GET /ranked-hotels",                   False,                      str(e))

# GET /ranked-hotels?city=Mumbai
try:
    r = requests.get(f"{BASE}/ranked-hotels", params={"city": "Mumbai", "limit": 5}, timeout=10)
    data = r.json()
    check("GET /ranked-hotels?city=Mumbai: status 200",   r.status_code == 200)
    check("GET /ranked-hotels?city=Mumbai: filtered",     data["city_filter"] == "Mumbai")
    check("GET /ranked-hotels?city=Mumbai: has results",  data["total"] > 0,  f"{data['total']} Mumbai hotels")
except Exception as e:
    check("GET /ranked-hotels?city=Mumbai",               False,               str(e))

# POST /track-event (valid)
try:
    r = requests.post(f"{BASE}/track-event", json={
        "user_id": 15,
        "hotel_id": hotels[0]["id"],
        "event_type": "booking"
    }, timeout=10)
    data = r.json()
    check("POST /track-event: status 200",          r.status_code == 200)
    check("POST /track-event: status=ok",           data["status"] == "ok")
    check("POST /track-event: event recorded",      data["event"]["event_type"] == "booking")
    check("POST /track-event: preferences updated", "preferences" in data)
except Exception as e:
    check("POST /track-event",                      False,                     str(e))

# POST /track-event (invalid event_type)
try:
    r = requests.post(f"{BASE}/track-event", json={
        "user_id": 15,
        "hotel_id": hotels[0]["id"],
        "event_type": "invalid_type"
    }, timeout=5)
    check("POST /track-event: rejects invalid type", r.status_code == 400)
except Exception as e:
    check("POST /track-event invalid",               False,                     str(e))

# POST /recommendations
try:
    r = requests.post(f"{BASE}/recommendations", params={"limit": 5}, json={
        "user_id": 15,
        "user_events": [
            {"user_id": 15, "hotel_id": hotels[0]["id"], "event_type": "booking"},
            {"user_id": 15, "hotel_id": hotels[1]["id"], "event_type": "view"}
        ]
    }, timeout=15)
    data = r.json()
    check("POST /recommendations: status 200",          r.status_code == 200)
    check("POST /recommendations: status=ok",           data["status"] == "ok")
    check("POST /recommendations: returning_user",      data["user_type"] == "returning_user")
    check("POST /recommendations: has results",         len(data["recommendations"]) > 0)
    check("POST /recommendations: has final_score",     "final_score" in data["recommendations"][0])
except Exception as e:
    check("POST /recommendations",                      False,                  str(e))

# POST /recommendations (new user)
try:
    r = requests.post(f"{BASE}/recommendations", params={"limit": 3}, json={
        "user_id": 999,
        "user_events": []
    }, timeout=15)
    data = r.json()
    check("POST /recommendations: new user flow",       data["user_type"] == "new_user")
except Exception as e:
    check("POST /recommendations new user",             False,                  str(e))


# ─────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────

passed = sum(1 for s, _ in results if s == PASS)
failed = sum(1 for s, _ in results if s == FAIL)

print("\n" + "="*60)
print(f"  RESULTS:  {passed} PASSED   {failed} FAILED   ({len(results)} total)")
print("="*60 + "\n")

if failed > 0:
    print("Failed checks:")
    for s, label in results:
        if s == FAIL:
            print(f"  x  {label}")
