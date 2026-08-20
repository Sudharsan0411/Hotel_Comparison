const axios = require("axios");

const ML_BASE_URL =
  process.env.ML_BASE_URL ||
  process.env.ML_SERVICE_URL ||
  "http://127.0.0.1:5000";

console.log("ML_BASE_URL:", ML_BASE_URL);

// GET /ml-health
const mlHealth = async (req, res) => {
  try {
    const response = await axios.get(`${ML_BASE_URL}/ml-health`);
    res.json(response.data);
  } catch (error) {
    console.log("ML Health Error:", error.message);

    res.status(500).json({
      message: "ML service health check failed",
      error: error.message,
      mlUrl: `${ML_BASE_URL}/ml-health`,
    });
  }
};

// GET /ranked-hotels
const getRankedHotels = async (req, res) => {
  try {
    const response = await axios.get(`${ML_BASE_URL}/ranked-hotels`, {
      params: req.query,
    });

    res.json(response.data);
  } catch (error) {
    console.log("Ranked Hotels Error:", error.message);

    res.status(500).json({
      message: "Error fetching ranked hotels from ML service",
      error: error.message,
    });
  }
};

// POST /recommendation
const getRecommendations = async (req, res) => {
  try {
    const body = req.body || {};
    const query = req.query || {};

    const limit = body.limit || query.limit || 10;

    const response = await axios.post(
      `${ML_BASE_URL}/recommendations`,
      {
        user_id: body.user_id || 1,
        user_events: body.user_events || [],
      },
      {
        params: {
          limit: limit,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log("Recommendations Error:", error.message);

    res.status(500).json({
      message: "Error fetching recommendations from ML service",
      error: error.message,
      mlError: error.response?.data,
    });
  }
};

// POST /track-event
const trackEvent = async (req, res) => {
  try {
    const response = await axios.post(
      `${ML_BASE_URL}/track-event`,
      {
        user_id: req.body.user_id || 1,
        hotel_id: req.body.hotel_id,
        event_type: req.body.event_type,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log("Track Event Error:", error.message);

    res.status(500).json({
      message: "Error tracking event in ML service",
      error: error.message,
      mlError: error.response?.data,
    });
  }
};

module.exports = {
  mlHealth,
  getRankedHotels,
  getRecommendations,
  trackEvent,
};