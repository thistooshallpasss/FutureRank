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
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies
app.use(express.static('public')); // To serve your HTML, CSS, JS files

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

// === JEE MAINS RANK PREDICTOR ENDPOINT (UPDATED) ===
app.post('/api/predict-mains-rank', async (req, res) => {
    try {
        // 1. Now receiving pwd_status from the frontend
        const { marks, category, gender, pwd_status } = req.body;

        if (marks === undefined || !category || !gender || !pwd_status) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        
        const latestYear = 2025;

        // 2. Updated SQL query to select the new MIN/MAX columns and use PWD_STATUS
        const sqlQuery = `
            SELECT 
                EXPECTED_GENERAL_RANK_MIN, EXPECTED_GENERAL_RANK_MAX, 
                EXPECTED_CATEGORY_RANK_MIN, EXPECTED_CATEGORY_RANK_MAX 
            FROM jee_mains_ranks 
            WHERE MARKS_SCORED = ? AND CATEGORY = ? AND GENDER = ? AND PWD_STATUS = ? AND YEAR = ?
        `;

        // 3. Added pwd_status to the query parameters
        const [results] = await dbPool.execute(sqlQuery, [marks, category, gender, pwd_status, latestYear]);

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'No rank data found for the provided inputs. Please check the marks.' });
        }

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// === JEE ADVANCED RANK PREDICTOR ENDPOINT (UPDATED) ===
app.post('/api/predict-advanced-rank', async (req, res) => {
    try {
        const { marks, category, gender, pwd_status } = req.body;

        if (marks === undefined || !category || !gender || !pwd_status) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const latestYear = 2025;

        // 1. Updated SQL query to select the new MIN/MAX columns
        const sqlQuery = `
            SELECT 
                EXPECTED_GENERAL_RANK_MIN, EXPECTED_GENERAL_RANK_MAX, 
                EXPECTED_CATEGORY_RANK_MIN, EXPECTED_CATEGORY_RANK_MAX
            FROM jee_advanced_ranks 
            WHERE MARKS_SCORED = ? AND CATEGORY = ? AND GENDER = ? AND PWD_STATUS = ? AND YEAR = ?
        `;

        const [results] = await dbPool.execute(sqlQuery, [marks, category, gender, pwd_status, latestYear]);

        if (results.length > 0) {
            // Check if the rank is 0 (Not Qualified)
            if (results[0].EXPECTED_GENERAL_RANK_MIN === 0) {
                return res.json({ message: 'Not Qualified for Rank List based on the provided marks.' });
            }
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'No rank data found. Marks might be below the cutoff range.' });
        }

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// Add this new endpoint to your server.js file

// === JEE MAINS PERCENTILE PREDICTOR ENDPOINT ===
app.post('/api/predict-mains-percentile', async (req, res) => {
    try {
        const { marks, session, shift } = req.body;

        // Basic validation
        if (marks === undefined || !session || !shift) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        
        // We'll query the latest year's data (2025)
        const latestYear = 2025;

        const sqlQuery = `
            SELECT EXPECTED_PERCENTILE 
            FROM jee_mains_percentile_data 
            WHERE MARKS_SCORED = ? AND SESSION = ? AND SHIFT = ? AND YEAR = ?
        `;

        const [results] = await dbPool.execute(sqlQuery, [marks, session, shift, latestYear]);

        if (results.length > 0) {
            res.json(results[0]); // Send back the found percentile
        } else {
            res.status(404).json({ message: 'No percentile data found for the provided inputs. Please check the marks.' });
        }

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// 6. Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});