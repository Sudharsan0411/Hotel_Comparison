# Hotel ML Data & Recommendation Engine

A distributed, ML-powered Hotel Recommendation, Ranking, Price Tracking, and Alert system built with Python, FastAPI, Celery, Redis, and scikit-learn.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the API Server](#running-the-api-server)
- [API Endpoints](#api-endpoints)
  - [GET /ml-health](#1-get-ml-health)
  - [GET /ranked-hotels](#2-get-ranked-hotels)
  - [POST /recommendations](#3-post-recommendations)
  - [POST /track-event](#4-post-track-event)
- [ML Pipeline](#ml-pipeline)
- [Celery Background Tasks](#celery-background-tasks)
- [Running Tests](#running-tests)
- [Notes](#notes)

---

## Overview

This system is the **ML layer** (Person 6's responsibility) of a collaborative hotel booking platform. It exposes the following capabilities via REST APIs:

| Capability | Description |
|---|---|
| **Hotel Ranking** | Ranks hotels using a balanced 50/50 ML score (price + rating) |
| **Recommendations** | Personalised recommendations for returning users, general rankings for new users |
| **Price Tracking** | Monitors hotel prices with UTC timestamps |
| **Price Alerts** | Triggers notifications when hotel prices drop below a user-defined target |
| **Preference Learning** | Learns user preferences from views, favorites, searches, and bookings |
| **FastAPI REST APIs** | 4 endpoints exposing all ML logic to the frontend/backend |

---

## Project Structure

```
hotel-ML-Data-/
├── app/
│   ├── hotel_services.py         # Core ML logic (ranking, recommendations, alerts)
│   ├── ml_api.py                 # FastAPI REST API server (4 endpoints)
│   ├── csv_loader.py             # Loads and maps hotel data from CSV
│   ├── processed_hotel_dataset.csv  # Real 561-hotel dataset
│   ├── api_client.py             # REST client for backend APIs (hotels, alerts, FCM)
│   ├── tasks.py                  # Celery async task definitions
│   ├── celery_app.py             # Celery + Redis scheduler config
│   ├── config.py                 # Environment config (BASE_URL, API keys)
│   ├── firebase_service.py       # Firebase push notification service
│   └── direct_test.py            # Quick local sanity test
├── unit-test/
│   ├── test_local.py             # Core ML logic test (sample data)
│   ├── test_csv_pipeline.py      # Full pipeline test using real CSV
│   ├── test_endpoints.py         # Full 43-check API + ML verification
│   ├── test_alerts.py            # Price alert logic tests
│   ├── test_firebase.py          # Firebase mock notification test
│   ├── test_recommendation.py    # Recommendation system tests
│   ├── test_price_tracking.py    # Price tracking tests
│   ├── test_celery.py            # Celery task tests
│   └── test_api_integration.py   # Live API integration test (requires backend)
├── main.py                       # Entry point — starts FastAPI server
├── run_pipeline.py               # Full 8-step pipeline runner (CSV-based)
├── requirements.txt              # All Python dependencies
└── README.md                     # This file
```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/Sudharsan0411/hotel-ML-Data-.git
cd hotel-ML-Data-
```

### 2. Create a virtual environment

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Running the API Server

```bash
python main.py
```

Or directly with uvicorn:

```bash
uvicorn app.ml_api:app --host 127.0.0.1 --port 8001 --reload
```

**Server starts at:** `http://127.0.0.1:8001`

| Page | URL |
|---|---|
| Swagger UI (Interactive Docs) | http://127.0.0.1:8001/docs |
| ReDoc | http://127.0.0.1:8001/redoc |

---

## API Endpoints

### 1. `GET /ml-health`

Health check. Confirms the ML service is running and hotel data is loaded.

**Request:**
```
GET http://127.0.0.1:8001/ml-health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-15T10:39:36.680496+00:00",
  "hotels_loaded": 561,
  "message": "ML service is running"
}
```

---

### 2. `GET /ranked-hotels`

Returns all hotels ranked by ML score (50% price + 50% rating). Supports optional city filter and limit.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | int | No | Max hotels to return (default: 50) |
| `city` | string | No | Filter by city (Mumbai, Delhi, Hyderabad, Bangalore) |

**Request — All cities:**
```
GET http://127.0.0.1:8001/ranked-hotels?limit=3
```

**Response:**
```json
{
  "status": "ok",
  "total": 561,
  "city_filter": "all",
  "ranked_hotels": [
    {
      "id": "85558690",
      "name": "Super Collection O Musheerabad Metro Station Hyderabad",
      "price": 18.1,
      "rating": 9.9,
      "city": "Hyderabad",
      "star_rating": 3.0,
      "hotel_type": "Hotel",
      "price_category": "Budget",
      "price_score": 0.9997,
      "rating_score": 0.9857,
      "hotel_score": 0.9927
    },
    {
      "id": "16198265",
      "name": "The Itihas Business Hotel Hitech City",
      "price": 1932.0,
      "rating": 10.0,
      "city": "Hyderabad",
      "star_rating": 0.0,
      "hotel_type": "Hotel",
      "price_category": "Budget",
      "price_score": 0.957,
      "rating_score": 1.0,
      "hotel_score": 0.9785
    },
    {
      "id": "11288710",
      "name": "IndiGo Line Hotel- Banjara Hills X Road",
      "price": 2079.0,
      "rating": 9.9,
      "city": "Hyderabad",
      "star_rating": 3.0,
      "hotel_type": "Hotel",
      "price_category": "Mid-Range",
      "price_score": 0.9538,
      "rating_score": 0.9857,
      "hotel_score": 0.9698
    }
  ]
}
```

**Request — City filter:**
```
GET http://127.0.0.1:8001/ranked-hotels?city=Mumbai&limit=2
```

**Response:**
```json
{
  "status": "ok",
  "total": 145,
  "city_filter": "Mumbai",
  "ranked_hotels": [
    {
      "id": "81062309",
      "name": "Hotel O Jagruti Nagar Ghatkopar Formerly Icy Cool",
      "price": 24.94,
      "rating": 9.5,
      "city": "Mumbai",
      "star_rating": 3.0,
      "hotel_type": "Hotel",
      "price_category": "Budget",
      "price_score": 0.9995,
      "rating_score": 1.0,
      "hotel_score": 0.9998
    },
    {
      "id": "16082488",
      "name": "The Taj Mahal Palace, Mumbai",
      "price": 246.36,
      "rating": 9.3,
      "city": "Mumbai",
      "star_rating": 5.0,
      "hotel_type": "Hotel",
      "price_category": "Budget",
      "price_score": 0.9905,
      "rating_score": 0.9692,
      "hotel_score": 0.9798
    }
  ]
}
```

---

### 3. `POST /recommendations`

Returns personalised hotel recommendations for a user.

- **Returning user** (has past events) → personalised score boosted by interaction history
- **New user** (no events) → general hotel ranking served

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | int | No | Max recommendations to return (default: 20) |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | int | Yes | The user's ID |
| `user_events` | list | No | List of past user events (view, search, favorite, booking) |

**Request — Returning User:**
```
POST http://127.0.0.1:8001/recommendations?limit=3
Content-Type: application/json

{
  "user_id": 10,
  "user_events": [
    { "user_id": 10, "hotel_id": "85558690", "event_type": "booking" },
    { "user_id": 10, "hotel_id": "16198265", "event_type": "view" }
  ]
}
```

**Response:**
```json
{
  "status": "ok",
  "user_id": 10,
  "user_type": "returning_user",
  "total": 561,
  "recommendations": [
    {
      "hotel_id": "85558690",
      "hotel_name": "Super Collection O Musheerabad Metro Station Hyderabad",
      "hotel_score": 0.9927,
      "recommendation_score": 59.5,
      "final_score": 1.0519,
      "user_type": "returning_user"
    },
    {
      "hotel_id": "16198265",
      "hotel_name": "The Itihas Business Hotel Hitech City",
      "hotel_score": 0.9785,
      "recommendation_score": 60.0,
      "final_score": 1.045,
      "user_type": "returning_user"
    },
    {
      "hotel_id": "8231108",
      "hotel_name": "Atlas Homes 1BHK Homestays",
      "hotel_score": 0.9661,
      "recommendation_score": 60.0,
      "final_score": 1.0363,
      "user_type": "returning_user"
    }
  ]
}
```

**Request — New User:**
```
POST http://127.0.0.1:8001/recommendations?limit=3
Content-Type: application/json

{
  "user_id": 999,
  "user_events": []
}
```

**Response:**
```json
{
  "status": "ok",
  "user_id": 999,
  "user_type": "new_user",
  "total": 561,
  "recommendations": [
    {
      "hotel_id": "85558690",
      "hotel_name": "Super Collection O Musheerabad Metro Station Hyderabad",
      "hotel_score": 0.9927,
      "recommendation_score": 0,
      "final_score": 0.9927,
      "user_type": "new_user"
    },
    {
      "hotel_id": "16198265",
      "hotel_name": "The Itihas Business Hotel Hitech City",
      "hotel_score": 0.9785,
      "recommendation_score": 0,
      "final_score": 0.9785,
      "user_type": "new_user"
    },
    {
      "hotel_id": "11288710",
      "hotel_name": "IndiGo Line Hotel- Banjara Hills X Road",
      "hotel_score": 0.9698,
      "recommendation_score": 0,
      "final_score": 0.9698,
      "user_type": "new_user"
    }
  ]
}
```

---

### 4. `POST /track-event`

Records a user interaction event. Used to personalise future recommendations.

**Supported event types:** `view` | `search` | `favorite` | `booking`

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | int | Yes | The user's ID |
| `hotel_id` | string | Yes | The hotel's ID |
| `event_type` | string | Yes | One of: view, search, favorite, booking |

**Request:**
```
POST http://127.0.0.1:8001/track-event
Content-Type: application/json

{
  "user_id": 10,
  "hotel_id": "ChcI3vK7h-SeguAPGgsvZy8xdHMxcXEwMhAB",
  "event_type": "booking"
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Event tracked successfully",
  "event": {
    "user_id": 10,
    "hotel_id": "ChcI3vK7h-SeguAPGgsvZy8xdHMxcXEwMhAB",
    "event_type": "booking",
    "tracked_at": "2026-06-15T10:39:36.945560+00:00"
  },
  "preferences": {
    "10": {
      "views": 0,
      "favorites": 0,
      "bookings": 1
    }
  }
}
```

**Error — Invalid event type:**
```
POST http://127.0.0.1:8001/track-event

{ "user_id": 10, "hotel_id": "abc", "event_type": "click" }
```
```json
{
  "detail": "Invalid event_type 'click'. Must be one of: ['booking', 'favorite', 'search', 'view']"
}
```

---

## ML Pipeline

The core ML pipeline (`hotel_services.py`) runs these steps in order:

| Step | Function | Description |
|---|---|---|
| 1 | `track_prices()` | Records current price + UTC timestamp for all hotels |
| 2 | `rank_hotels()` | Scores hotels: `0.50 × price_score + 0.50 × rating_score` |
| 3 | `recommend_hotels()` | Personalised scores for returning users; ranked list for new users |
| 4 | `check_price_alerts()` | Triggers alerts when current price < user's target price |
| 5 | `update_preferences()` | Counts views, favorites, and bookings per user |
| 6 | `ml_pipeline()` | Runs all steps in one combined function call |

### Ranking Formula

```
price_score  = 1 - MinMaxScaler(price)    # Lower price = higher score
rating_score = MinMaxScaler(rating)        # Higher rating = higher score
hotel_score  = 0.50 × price_score + 0.50 × rating_score
```

### Recommendation Score Weights

| Event Type | Weight |
|---|---|
| booking | 30 |
| favorite | 20 |
| view | 2 |
| search | 1 |

Returning users get a `final_score = hotel_score + (recommendation_score / 1000)`.

---

## Celery Background Tasks

Celery is configured to run periodic ML jobs automatically:

| Task | Schedule | Description |
|---|---|---|
| `refresh_recommendations` | Every 15 min | Re-runs recommendations for active users |
| `track_price_changes` | Every 15 min | Fetches latest prices from backend |
| `check_price_alerts` | Every 5 min | Triggers FCM notifications for price drops |
| `refresh_hotel_rankings` | Every 30 min | Re-ranks all hotels with fresh data |
| `learn_from_feedback` | Every 1 hour | Updates preference model from new events |

> **Note:** Celery tasks require Redis to be running. FCM notifications require the live backend at `http://localhost:3002`.

---

## Running Tests

### Full Verification (43 checks)
```bash
python -m unit-test.test_endpoints
```

### Core ML Logic (sample data)
```bash
python -m unit-test.test_local
```

### Real CSV Pipeline (561 hotels)
```bash
python -m unit-test.test_csv_pipeline
```

### Firebase Mock
```bash
python -m unit-test.test_firebase
```

### Full 8-Step Pipeline Runner
```bash
python run_pipeline.py
```

### Live Backend API (requires Node.js server at localhost:3002)
```bash
python -m unit-test.test_api_integration
```

---

## Notes

| Item | Status |
|---|---|
| Core ML logic | Done |
| FastAPI REST APIs (4 endpoints) | Done |
| CSV data loader | Done |
| Unit tests (43/43 passing) | Done |
| Firebase/FCM push notifications | Commented out — requires live backend |
| Redis / Celery full flow | Commented out — requires Redis connection |
| Live backend integration | Pending — requires Person 3's Node.js server |
