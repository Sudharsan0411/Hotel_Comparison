const pool = require("../db");

// CREATE ALERT

const createAlert = async (req, res) => {

    try {

        const userId = req.user.id;

        const { hotelId, targetPrice } = req.body;

        const result = await pool.query(
            `INSERT INTO alerts(user_id, hotel_id, target_price)
             VALUES($1, $2, $3)
             RETURNING *`,
            [userId, hotelId, targetPrice]
        );

        res.json({
            message: "Alert created",
            alert: result.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error creating alert"
        });

    }

};

// GET ALERTS

const getAlerts = async (req, res) => {

    try {

        const userId = req.user.id;

        const result = await pool.query(
            "SELECT * FROM alerts WHERE user_id = $1",
            [userId]
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching alerts"
        });

    }

};

// SAVE FCM TOKEN

const saveFcmToken = async (req, res) => {

    try {

        const userId = req.user.id;

        const { fcmToken } = req.body;

        await pool.query(
            "UPDATE users SET fcm_token = $1 WHERE id = $2",
            [fcmToken, userId]
        );

        res.json({
            message: "FCM token saved"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error saving FCM token"
        });

    }

};

// GET FCM TOKEN

const getFcmToken = async (req, res) => {

    try {

        const userId = req.params.userId;

        const result = await pool.query(
            "SELECT id, fcm_token FROM users WHERE id = $1",
            [userId]
        );

        res.json({
            user_id: result.rows[0].id,
            fcm_token: result.rows[0].fcm_token
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching FCM token"
        });

    }

};

module.exports = {
    createAlert,
    getAlerts,
    saveFcmToken,
    getFcmToken
};