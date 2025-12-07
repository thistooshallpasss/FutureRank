// In server.js

// 1. Import necessary packages
const express = require('express');
const mysql = require('mysql2/promise'); // Using the promise-based version
const cors = require('cors');
require('dotenv').config(); // To use variables from .env file

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 4. Database Connection Pool
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 5. API Endpoints (The Core Logic)


// ======================================================================
// === UPDATED JEE MAINS RANK PREDICTOR (Bug #3, #7, #19 FIXED) ===
// ======================================================================
app.post('/api/predict-mains-rank', async (req, res) => {
    try {
        const { marks, category, gender, pwd_status } = req.body;

        // Bug #3, #7 — Strict validation
        if (
            marks === undefined ||
            marks === null ||
            isNaN(marks) ||
            !category ||
            !gender ||
            !pwd_status
        ) {
            return res.status(400).json({
                error: 'Invalid or missing fields. Marks must be a number.'
            });
        }

        const sqlQuery = `
            SELECT EXPECTED_GENERAL_RANK_MIN, EXPECTED_GENERAL_RANK_MAX,
                   EXPECTED_CATEGORY_RANK_MIN, EXPECTED_CATEGORY_RANK_MAX
            FROM jee_mains_ranks
            WHERE MARKS_SCORED = ? AND CATEGORY = ? AND GENDER = ? AND PWD_STATUS = ? AND YEAR = 2025
        `;

        const [results] = await dbPool.execute(sqlQuery, [
            marks, category, gender, pwd_status
        ]);

        if (results.length > 0) {
            return res.json(results[0]);
        } else {
            // Bug #19
            return res.status(404).json({
                message: 'No data found. This combination of category/marks might be invalid.'
            });
        }

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ======================================================================
// === UPDATED JEE ADVANCED RANK PREDICTOR ===
// ======================================================================
app.post('/api/predict-advanced-rank', async (req, res) => {
    try {
        const { marks, category, gender, pwd_status } = req.body;

        if (
            marks === undefined ||
            marks === null ||
            isNaN(marks) ||
            !category ||
            !gender ||
            !pwd_status
        ) {
            return res.status(400).json({ error: 'Missing or invalid fields.' });
        }

        const sqlQuery = `
            SELECT EXPECTED_GENERAL_RANK_MIN, EXPECTED_GENERAL_RANK_MAX,
                   EXPECTED_CATEGORY_RANK_MIN, EXPECTED_CATEGORY_RANK_MAX
            FROM jee_advanced_ranks
            WHERE MARKS_SCORED = ? AND CATEGORY = ? AND GENDER = ? AND PWD_STATUS = ? AND YEAR = 2025
        `;

        const [results] = await dbPool.execute(sqlQuery, [
            marks, category, gender, pwd_status
        ]);

        if (results.length > 0) {

            // Not qualified case
            if (results[0].EXPECTED_GENERAL_RANK_MIN === 0) {
                return res.json({
                    message: "Not Qualified for Rank List based on the provided marks."
                });
            }

            return res.json(results[0]);
        } else {
            return res.status(404).json({
                message: 'No rank data found. Marks may be below cutoff.'
            });
        }

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ======================================================================
// === JEE MAINS PERCENTILE PREDICTOR ===
// ======================================================================
app.post('/api/predict-mains-percentile', async (req, res) => {
    try {
        const { marks, session, shift } = req.body;

        if (
            marks === undefined ||
            marks === null ||
            isNaN(marks) ||
            !session ||
            !shift
        ) {
            return res.status(400).json({ error: 'Missing or invalid fields.' });
        }

        const sqlQuery = `
            SELECT EXPECTED_PERCENTILE
            FROM jee_mains_percentile_data
            WHERE MARKS_SCORED = ? AND SESSION = ? AND SHIFT = ? AND YEAR = 2025
        `;

        const [results] = await dbPool.execute(sqlQuery, [
            marks, session, shift
        ]);

        if (results.length > 0) {
            return res.json(results[0]);
        } else {
            return res.status(404).json({
                message: 'No percentile data found for the provided inputs.'
            });
        }

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ======================================================================
// === MISSING COLLEGE ROUTE (Bug #10 FIXED) ===
// ======================================================================
app.get('/api/college-list', async (req, res) => {
    // Basic placeholder to prevent frontend crashes
    res.json({
        message: "College prediction feature coming soon!"
    });
});


// 6. Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
