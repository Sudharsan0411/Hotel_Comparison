"""
ml_api.py — FastAPI server exposing ML pipeline as REST APIs

Endpoints:
    GET  /ml-health          → Health check
    GET  /ranked-hotels      → Returns ranked hotel list from CSV
    POST /recommendations    → Returns personalized hotel recommendations
    POST /track-event        → Tracks a user interaction event
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, UTC

from app.csv_loader import load_hotels_from_csv
from app.hotel_services import (
    rank_hotels,
    recommend_hotels,
    track_prices,
    update_preferences
)


# =====================================================
# APP SETUP
# =====================================================

app = FastAPI(
    title="Hotel ML API",
    description="ML-powered hotel ranking, recommendation, and price tracking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


# =====================================================
# IN-MEMORY SESSION STORE
# (Replaces Redis/DB until backend is live)
# =====================================================

_user_events_store: List[dict] = []


# =====================================================
# REQUEST / RESPONSE MODELS
# =====================================================

class UserEvent(BaseModel):
    user_id: int
    hotel_id: str
    event_type: str   # "view" | "search" | "favorite" | "booking"


class RecommendationRequest(BaseModel):
    user_id: int
    user_events: Optional[List[UserEvent]] = []


# =====================================================
# ENDPOINTS
# =====================================================

@app.get(
    "/ml-health",
    tags=["Health"],
    summary="ML service health check"
)
def ml_health():
    """
    Returns health status of the ML service.
    Checks that hotel data is loadable from CSV.
    """
    try:

        hotels = load_hotels_from_csv()

        return {
            "status":        "ok",
            "timestamp":     datetime.now(UTC).isoformat(),
            "hotels_loaded": len(hotels),
            "message":       "ML service is running"
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"ML service unhealthy: {str(e)}"
        )


@app.get(
    "/ranked-hotels",
    tags=["Ranking"],
    summary="Get all hotels ranked by ML score"
)
def get_ranked_hotels(
    limit: int = 50,
    city: Optional[str] = None
):
    """
    Loads hotel data from CSV, applies the ML ranking
    formula (50% price score + 50% rating score), and
    returns hotels sorted by score (highest first).

    Query Params:
        limit (int): Max number of hotels to return (default: 50)
        city  (str): Optional filter by city name
    """
    try:

        hotels = load_hotels_from_csv()

        if not hotels:

            raise HTTPException(
                status_code=404,
                detail="No hotel data found"
            )

        if city:
            hotels = [
                h for h in hotels
                if h.get("city", "").lower() == city.lower()
            ]

        ranked = rank_hotels(hotels)

        return {
            "status":       "ok",
            "total":        len(ranked),
            "city_filter":  city or "all",
            "ranked_hotels": ranked[:limit]
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Ranking error: {str(e)}"
        )


@app.post(
    "/recommendations",
    tags=["Recommendations"],
    summary="Get personalized hotel recommendations for a user"
)
def get_recommendations(
    body: RecommendationRequest,
    limit: int = 20
):
    """
    Returns personalized hotel recommendations for a user.

    - If the user has past events (bookings, views, favorites),
      they are treated as a returning user with personalized scores.
    - If no events exist, general ranked hotels are returned
      (new user flow).

    Body:
        user_id     (int):          The user's ID
        user_events (list):         List of user interaction events
    """
    try:

        hotels = load_hotels_from_csv()

        if not hotels:

            raise HTTPException(
                status_code=404,
                detail="No hotel data found"
            )

        ranked = rank_hotels(hotels)

        events = [
            event.model_dump()
            for event in body.user_events
        ]

        # Also include any previously tracked events for this user
        stored = [
            e for e in _user_events_store
            if e["user_id"] == body.user_id
        ]

        all_events = events + stored

        recommendations = recommend_hotels(
            ranked,
            all_events,
            body.user_id
        )

        return {
            "status":          "ok",
            "user_id":         body.user_id,
            "user_type":       "returning_user" if all_events else "new_user",
            "total":           len(recommendations),
            "recommendations": recommendations[:limit]
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Recommendation error: {str(e)}"
        )


@app.post(
    "/track-event",
    tags=["Events"],
    summary="Track a user interaction event"
)
def track_event(event: UserEvent):
    """
    Records a user interaction event (view, search, favorite, booking).
    These events are used to personalise future recommendations.

    Supported event types:
        - view
        - search
        - favorite
        - booking
    """
    valid_types = {"view", "search", "favorite", "booking"}

    if event.event_type not in valid_types:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid event_type '{event.event_type}'. "
                f"Must be one of: {sorted(valid_types)}"
            )
        )

    try:

        record = event.model_dump()
        record["tracked_at"] = datetime.now(UTC).isoformat()

        _user_events_store.append(record)

        # Update user preferences in memory
        hotels = load_hotels_from_csv()

        prefs = update_preferences(
            [record],
            hotels
        )

        return {
            "status":      "ok",
            "message":     "Event tracked successfully",
            "event":       record,
            "preferences": prefs
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Event tracking error: {str(e)}"
        )
