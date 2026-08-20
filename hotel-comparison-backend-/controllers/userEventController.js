const pool = require("../db");

const getUserEvents = async (req, res) => {

    try {

        const userId = req.params.userId;

        const result = await pool.query(
            `SELECT *
             FROM user_events
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching user events"
        });

    }

};

module.exports = {
    getUserEvents
};