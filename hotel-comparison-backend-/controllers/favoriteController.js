const pool = require("../db");

const addFavorite = async (req, res) => {

    try {

        const userId = req.user.id;

        const { hotelId } = req.body;

        const result = await pool.query(
            "INSERT INTO favorites(user_id, hotel_id) VALUES($1, $2) RETURNING *",
            [userId, hotelId]
        );

        await pool.query(
            "INSERT INTO user_events(user_id, hotel_id, event_type) VALUES($1, $2, $3)",
            [userId, hotelId, "favorite"]
        );

        res.json({
            message: "Favorite added",
            favorite: result.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error adding favorite"
        });

    }

};

const getFavorites = async (req, res) => {

    try {

        const userId = req.user.id;

        const result = await pool.query(
            `SELECT hotels.*
             FROM favorites
             JOIN hotels
             ON favorites.hotel_id = hotels.id
             WHERE favorites.user_id = $1`,
            [userId]
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching favorites"
        });

    }

};

const deleteFavorite = async (req, res) => {

    try {

        const userId = req.user.id;
        const hotelId = req.params.hotelId;

        await pool.query(
            "DELETE FROM favorites WHERE user_id = $1 AND hotel_id = $2",
            [userId, hotelId]
        );

        res.json({
            message: "Favorite removed"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error removing favorite"
        });

    }

};

module.exports = {
    addFavorite,
    getFavorites,
    deleteFavorite
};