-- USERS

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    fcm_token TEXT
);

-- HOTELS

CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name TEXT,
    price INT,
    rating FLOAT
);

-- FAVORITES

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    hotel_id INT REFERENCES hotels(id)
);

-- BOOKINGS

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    hotel_id INT REFERENCES hotels(id),
    check_in DATE,
    check_out DATE
);

-- USER EVENTS

CREATE TABLE user_events (
    id SERIAL PRIMARY KEY,
    user_id INT,
    hotel_id INT,
    event_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ALERTS

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    hotel_id INT REFERENCES hotels(id),
    target_price INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);