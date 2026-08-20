const axios = require("axios");

const ML_BASE_URL = process.env.ML_BASE_URL || "http://127.0.0.1:8001";

// GET /ml-health
const mlHealth = async (req, res) => {
    try {
        const response = await axios.get(`${ML_BASE_URL}/ml-health`);

        res.json(response.data);

    } catch (error) {
        console.log("ML Health Error:", error.message);

        res.status(500).json({
            message: "ML service health check failed"
        });
    }
};

// GET /ranked-hotels
const getRankedHotels = async (req, res) => {
    try {
        const response = await axios.get(`${ML_BASE_URL}/ranked-hotels`, {
            params: req.query
        });

        res.json(response.data);

    } catch (error) {
        console.log("Ranked Hotels Error:", error.message);

        res.status(500).json({
            message: "Error fetching ranked hotels from ML service"
        });
    }
};

// POST /recommendations
const getRecommendations = async (req, res) => {
    try {
        const response = await axios.post(
            `${ML_BASE_URL}/recommendations`,
            req.body,
            {
                params: req.query
            }
        );

        res.json(response.data);

    } catch (error) {
        console.log("Recommendations Error:", error.message);

        res.status(500).json({
            message: "Error fetching recommendations from ML service"
        });
    }
};

// POST /track-event
const trackEvent = async (req, res) => {
    try {
        const response = await axios.post(
            `${ML_BASE_URL}/track-event`,
            req.body
        );

        res.json(response.data);

    } catch (error) {
        console.log("Track Event Error:", error.message);

        res.status(500).json({
            message: "Error tracking event in ML service"
        });
    }
};

module.exports = {
    mlHealth,
    getRankedHotels,
    getRecommendations,
    trackEvent
};