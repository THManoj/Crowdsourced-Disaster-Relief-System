const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/getDonationDetails', async (req, res) => {
        try {
            const query = `
                SELECT 
                    d.donation_id,
                    d.donor_id,
                    d.amount,
                    d.donated_at,
                    dis.disaster_type,
                    dis.location,
                    dis.severity_level
                FROM donations d
                JOIN disasters dis ON d.disaster_id = dis.disaster_id
                ORDER BY d.donated_at DESC
                LIMIT 10
            `;
            
            const [rows] = await db.execute(query);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching donation details:', error);
            res.status(500).json({ error: 'Failed to fetch donations' });
        }
    });

    return router;
};
