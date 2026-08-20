const pool = require("../db");

const createBooking = async (req, res) => {

    try {

        const userId = req.user.id;

        const { hotelId, checkIn, checkOut } = req.body;

        const result = await pool.query(
            `INSERT INTO bookings(user_id, hotel_id, check_in, check_out)
             VALUES($1, $2, $3, $4)
             RETURNING *`,
            [userId, hotelId, checkIn, checkOut]
        );

        await pool.query(
            "INSERT INTO user_events(user_id, hotel_id, event_type) VALUES($1, $2, $3)",
            [userId, hotelId, "booking"]
        );

        res.json({
            message: "Booking created successfully",
            booking: result.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error creating booking"
        });

    }

};

const getBookings = async (req, res) => {

    try {

        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                bookings.id,
                hotels.name AS hotel_name,
                bookings.check_in,
                bookings.check_out
             FROM bookings
             JOIN hotels
             ON bookings.hotel_id = hotels.id
             WHERE bookings.user_id = $1`,
            [userId]
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching bookings"
        });

    }

};

const cancelBooking = async (req, res) => {

    try {

        const bookingId = req.params.id;
        const userId = req.user.id;

        await pool.query(
            "DELETE FROM bookings WHERE id = $1 AND user_id = $2",
            [bookingId, userId]
        );

        res.json({
            message: "Booking cancelled successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error cancelling booking"
        });

    }

};

module.exports = {
    createBooking,
    getBookings,
    cancelBooking
};