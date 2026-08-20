const pool = require("../db");
const redisClient = require("../redisClient");
const jwt = require("jsonwebtoken");

const getHotels = async (req, res) => {

    try {

        const cacheKey = req.originalUrl;

        const cachedHotels = await redisClient.get(cacheKey);

        if (cachedHotels) {

            console.log("Serving from Redis Cache");

            return res.json(
                JSON.parse(cachedHotels)
            );

        }

        console.log("Fetching from PostgreSQL");

        const sort = req.query.sort;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;

        const offset = (page - 1) * limit;

        let query = "SELECT * FROM hotels";

        if (sort === "price") {
            query += " ORDER BY price ASC";
        }

        if (sort === "rating") {
            query += " ORDER BY rating DESC";
        }

        query += ` LIMIT ${limit} OFFSET ${offset}`;

        const result = await pool.query(query);

        await redisClient.setEx(
            cacheKey,
            60,
            JSON.stringify(result.rows)
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Database error"
        });

    }

};



const getHotelById = async (req, res) => {

    try {

        const hotelId = req.params.id;

        const result = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [hotelId]
        );

        if (req.headers.authorization) {

            try {

                const token = req.headers.authorization.split(" ")[1];

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                await pool.query(
                    "INSERT INTO user_events(user_id, hotel_id, event_type) VALUES($1, $2, $3)",
                    [decoded.id, hotelId, "view"]
                );

            } catch (err) {
                console.log("View logging skipped");
            }

        }

        res.json(result.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Database error"
        });

    }

};


const filterHotels = async (req, res) => {

    try {

        const maxPrice = req.query.maxPrice;

        const result = await pool.query(
            "SELECT * FROM hotels WHERE price <= $1",
            [maxPrice]
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Database error"
        });

    }

};



const searchHotels = async (req, res) => {

    try {

        const hotelName = req.query.name;

        const result = await pool.query(
            "SELECT * FROM hotels WHERE LOWER(name) LIKE LOWER($1)",
            [`%${hotelName}%`]
        );

        if (req.headers.authorization) {

            try {

                const token = req.headers.authorization.split(" ")[1];

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                await pool.query(
                    "INSERT INTO user_events(user_id, hotel_id, event_type) VALUES($1, $2, $3)",
                    [decoded.id, null, "search"]
                );

            } catch (err) {
                console.log("Search logging skipped");
            }

        }

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Search error"
        });

    }

};

const compareHotels = async (req, res) => {

    try {

        const { id1, id2 } = req.query;

        const hotel1Result = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id1]
        );

        const hotel2Result = await pool.query(
            "SELECT * FROM hotels WHERE id = $1",
            [id2]
        );

        const hotel1 = hotel1Result.rows[0];
        const hotel2 = hotel2Result.rows[0];

        if (!hotel1 || !hotel2) {
            return res.status(404).json({
                message: "One or both hotels not found"
            });
        }

        const cheaperHotel =
            hotel1.price < hotel2.price
                ? hotel1.name
                : hotel2.name;

        const higherRatedHotel =
            hotel1.rating > hotel2.rating
                ? hotel1.name
                : hotel2.name;

        res.json({
            hotel1,
            hotel2,
            cheaperHotel,
            higherRatedHotel
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Comparison error"
        });

    }

};

const createHotel = async (req, res) => {

    try {

        const { name, price, rating } = req.body;

        const result = await pool.query(
            "INSERT INTO hotels(name, price, rating) VALUES($1, $2, $3) RETURNING *",
            [name, price, rating]
        );

        res.json({
            message: "Hotel added successfully",
            hotel: result.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error adding hotel"
        });

    }

};

const updateHotel = async (req, res) => {

    try {

        const hotelId = req.params.id;

        const { name, price, rating } = req.body;

        const result = await pool.query(
            "UPDATE hotels SET name=$1, price=$2, rating=$3 WHERE id=$4 RETURNING *",
            [name, price, rating, hotelId]
        );

        res.json({
            message: "Hotel updated successfully",
            hotel: result.rows[0]
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error updating hotel"
        });

    }

};

const deleteHotel = async (req, res) => {

    try {

        const hotelId = req.params.id;

        await pool.query(
            "DELETE FROM hotels WHERE id = $1",
            [hotelId]
        );

        res.json({
            message: "Hotel deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error deleting hotel"
        });

    }

};

module.exports = {
    getHotels,
    getHotelById,
    filterHotels,
    searchHotels,
    compareHotels,
    createHotel,
    updateHotel,
    deleteHotel
};

