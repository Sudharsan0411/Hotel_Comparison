require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});



const {
    getHotels,
    getHotelById,
    filterHotels,
    searchHotels,
    compareHotels,
    createHotel,
    updateHotel,
    deleteHotel
} = require("./controllers/hotelController");

const {
    signup,
    login,
    profile
} = require("./controllers/authController");

const {
    addFavorite,
    getFavorites,
    deleteFavorite
} = require("./controllers/favoriteController");

const {
    createBooking,
    getBookings,
    cancelBooking
} = require("./controllers/bookingController");

const {
    createAlert,
    getAlerts,
    saveFcmToken,
    getFcmToken
} = require("./controllers/alertController");

const {
    getUserEvents
} = require("./controllers/userEventController");

const {
    mlHealth,
    getRankedHotels,
    getRecommendations,
    trackEvent
} = require("./controllers/mlController");

const auth = require("./middleware/auth");



app.get("/", (req, res) => {
    res.send("Backend Running");
});


// GET ALL HOTELS

app.get("/hotels", getHotels);

// GET SINGLE HOTEL

app.get("/hotel/:id", getHotelById);

// FILTER HOTELS

app.get("/filter", filterHotels);

// SIGNUP API

app.post("/signup", signup);

//CREATE HOTEL API
app.post("/hotel", createHotel);

//UPDATE HOTEL AP
app.put("/hotel/:id", updateHotel);

//DELETE HOTEL API
app.delete("/hotel/:id", deleteHotel);

app.post("/login", login);

//Create Protected Route
app.get("/profile", auth, profile);

// SEARCH HOTEL BY NAME

app.get("/search", searchHotels);

// COMPARE HOTELS

app.get("/compare", compareHotels);

// Add Favorite API
app.post("/favorites", auth, addFavorite);

//View Favorites
app.get("/favorites", auth, getFavorites);

//Delete Favorite
app.delete("/favorites/:hotelId", auth, deleteFavorite);

// CREATE BOOKING

app.post("/bookings", auth, createBooking);


//view booking
app.get("/bookings", auth, getBookings);


// Cancel Booking API
app.delete("/bookings/:id", auth, cancelBooking);

// SAVE FCM TOKEN

app.post("/fcm-token", auth, saveFcmToken);

// GET FCM TOKEN

app.get("/fcm-token/:userId", getFcmToken);

// CREATE ALERT

app.post("/alerts", auth, createAlert);


// GET USER ALERTS

app.get("/alerts", auth, getAlerts);

app.get("/user-events/:userId", getUserEvents);

// ML SERVICE ROUTES

app.get("/ml-health", mlHealth);

app.get("/ranked-hotels", getRankedHotels);

app.get("/recommendations", getRecommendations);
app.post("/recommendations", getRecommendations);

app.post("/track-event", trackEvent);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Server Started on Port ${PORT}`);
});