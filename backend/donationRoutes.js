// backend/donationRoutes.js
const express = require('express');
const router = express.Router();

const donationRoutes = (db) => {
    // Route to get donation data
    router.get('/getdonations', async (req, res) => {
        const sqlQuery = 'SELECT * FROM disasters'; // Changed from DisasterReport to Donation
        try {
            const [results] = await db.query(sqlQuery);
            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query failed' });
        }
    });

    // Route to get disaster data
    router.get('/disasters', async (req, res) => {
        const sqlQuery = 'SELECT * FROM disasters';
        try {
            const [results] = await db.query(sqlQuery);
            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query failed' });
        }
    });

    // New route to get total amount donated for a specific disaster
    router.get('/totaldonated/:disasterId', async (req, res) => {
        const disasterId = req.params.disasterId;
        try {
            const [result] = await db.execute('SELECT GetTotalAmountDonated(?) as total', [disasterId]);
            res.json(result[0]);
        } catch (error) {
            console.error('Error getting total donations:', error);
            res.status(500).json({ error: 'Failed to get total donations' });
        }
    });

    return router;
};

module.exports = donationRoutes;
