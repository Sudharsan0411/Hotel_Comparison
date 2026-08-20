const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        res.json({
            message: "User created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET
        );

        res.json({
            message: "Login successful",
            token: token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const profile = (req, res) => {
    res.json({
        message: "Protected Route Accessed",
        user: req.user
    });
};

module.exports = {
    signup,
    login,
    profile
};