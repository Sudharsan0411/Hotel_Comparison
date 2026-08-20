# Hotel Booking Backend API

## Overview

A Node.js + Express.js backend for a Hotel Booking and Recommendation System. The project provides hotel management, user authentication, booking management, favorites, alerts, user interaction tracking, Redis caching, and Firebase Cloud Messaging (FCM) token support.

This backend is designed to integrate with frontend applications, recommendation engines, and notification services.

---

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Redis
* JWT Authentication
* bcrypt
* dotenv

---

## Features

### Authentication

* User Signup
* User Login
* Password Hashing using bcrypt
* JWT-based Authentication
* Protected Routes

### Hotel Management

* Create Hotel
* View Hotels
* Update Hotel
* Delete Hotel
* Pagination
* Sorting by Price
* Sorting by Rating

### Search & Filtering

* Search Hotels by Name
* Filter Hotels by Maximum Price
* Compare Two Hotels

### Favorites

* Add Favorite Hotel
* View Favorite Hotels
* Remove Favorite Hotel

### Bookings

* Create Booking
* View User Bookings
* Cancel Booking

### Alerts

* Create Price Alert
* View User Alerts

### FCM Integration

* Save User FCM Token
* Fetch User FCM Token

### User Event Tracking

Tracks:

* Hotel Views
* Searches
* Favorites
* Bookings

Used for:

* Recommendation System
* Analytics
* User Behavior Tracking

### Redis Caching

* Hotel list endpoint caching
* Reduced database load
* Faster API responses

### ML Service Integration

* Connects Node.js backend to FastAPI ML service
* Supports ML health check
* Supports ranked hotels
* Supports personalized recommendations
* Supports ML event tracking
Note: These ML proxy routes require the FastAPI ML service to be running at `ML_BASE_URL`, default `http://127.0.0.1:8001`. If the ML service is not running, these routes will return an error.

---

## Project Structure

```text
hotel-backend/
│
├── controllers/
│   ├── hotelController.js
│   ├── authController.js
│   ├── favoriteController.js
│   ├── bookingController.js
│   ├── alertController.js
│   ├── userEventController.js
│   └── mlController.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── middleware/
│   └── auth.js
│
├── db.js
├── redisClient.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd hotel-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. PostgreSQL Setup

Create a database:

```sql
CREATE DATABASE hotel_project;
```

Run:

```sql
\i database/schema.sql
\i database/seed.sql
```

### 4. Redis Setup

Start Redis Server:

```bash
redis-server
```

Verify:

```bash
redis-cli ping
```

Expected:

```text
PONG
```

### 5. Environment Variables

Create a `.env` file:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=hotel_project
DB_PASSWORD=your_password
DB_PORT=5432
ML_BASE_URL=http://127.0.0.1:8001
JWT_SECRET=your_secret_key

REDIS_URL=redis://localhost:6379

PORT=3002
```

### 6. Run Server

```bash
node server.js
```

Expected Output:

```text
Server Started on Port 3002
Redis Connected
```

---

## Database Tables

### users

| Column    | Type   |
| --------- | ------ |
| id        | SERIAL |
| name      | TEXT   |
| email     | TEXT   |
| password  | TEXT   |
| fcm_token | TEXT   |

### hotels

| Column | Type   |
| ------ | ------ |
| id     | SERIAL |
| name   | TEXT   |
| price  | INT    |
| rating | FLOAT  |

### favorites

| Column   | Type   |
| -------- | ------ |
| id       | SERIAL |
| user_id  | INT    |
| hotel_id | INT    |

### bookings

| Column    | Type   |
| --------- | ------ |
| id        | SERIAL |
| user_id   | INT    |
| hotel_id  | INT    |
| check_in  | DATE   |
| check_out | DATE   |

### user_events

| Column     | Type      |
| ---------- | --------- |
| id         | SERIAL    |
| user_id    | INT       |
| hotel_id   | INT       |
| event_type | TEXT      |
| created_at | TIMESTAMP |

### ML Integration

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | /ml-health       |
| GET    | /ranked-hotels   |
| POST   | /recommendations |
| POST   | /track-event     |

### alerts

| Column       | Type      |
| ------------ | --------- |
| id           | SERIAL    |
| user_id      | INT       |
| hotel_id     | INT       |
| target_price | INT       |
| created_at   | TIMESTAMP |

---

## API Endpoints

### Authentication

| Method | Endpoint |
| ------ | -------- |
| POST   | /signup  |
| POST   | /login   |
| GET    | /profile |

### Hotels

| Method | Endpoint   |
| ------ | ---------- |
| GET    | /hotels    |
| GET    | /hotel/:id |
| POST   | /hotel     |
| PUT    | /hotel/:id |
| DELETE | /hotel/:id |

### Search & Filter

| Method | Endpoint |
| ------ | -------- |
| GET    | /search  |
| GET    | /filter  |
| GET    | /compare |

### Favorites

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | /favorites          |
| GET    | /favorites          |
| DELETE | /favorites/:hotelId |

### Bookings

| Method | Endpoint      |
| ------ | ------------- |
| POST   | /bookings     |
| GET    | /bookings     |
| DELETE | /bookings/:id |

### Alerts

| Method | Endpoint |
| ------ | -------- |
| POST   | /alerts  |
| GET    | /alerts  |

### FCM

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /fcm-token         |
| GET    | /fcm-token/:userId |

### User Events

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | /user-events/:userId   |
---

## Recommendation System Support

### User Events API

```http
GET /user-events/:userId
```

Available user events:

* view
* search
* favorite
* booking

Stored in:

```sql
user_events
```

Schema:

```sql
(user_id, hotel_id, event_type, created_at)
```

### ML Service Proxy APIs

These routes forward requests from the Node.js backend to the FastAPI ML service.

```http
GET  /ml-health
GET  /ranked-hotels
POST /recommendations
POST /track-event
```

---

## Future Improvements

* Route Layer Refactoring
* Service Layer Architecture
* Input Validation
* Swagger Documentation
* Docker Support
* Role-Based Access Control
* Unit Testing

---

## Author

Backend Development Module

Node.js • Express.js • PostgreSQL • Redis • JWT * axios
