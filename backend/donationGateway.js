const express = require('express');

const donationGateway = (db) => {
    const router = express.Router();

    // Route to fetch all disasters
    router.get('/disasters', (req, res) => {
        const query = 'SELECT * FROM disasters'; // Changed from DisasterReport to disasters
        console.log("Executing query:", query); // Log the query
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching disasters:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log("Query results:", results); // Log results
            res.json(results);
        });
    });

    // Route to submit a donation
    router.post('/submitdonations', async (req, res) => {
        const { donor_id, disaster_id, amount } = req.body;
        
        try {
            // First insert the donation
            const donationQuery = 'INSERT INTO donations (donor_id, disaster_id, amount) VALUES (?, ?, ?)';
            const [donationResult] = await db.execute(donationQuery, [donor_id, disaster_id, amount]);
            
            // Then insert the payment record
            const paymentQuery = `
                INSERT INTO payments 
                (user_id, amount, payment_method, payment_date) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `;
            
            const [paymentResult] = await db.execute(
                paymentQuery, 
                [donor_id, amount, req.body.payment_method]
            );

            res.status(201).json({ 
                message: 'Donation and payment recorded successfully!',
                donationId: donationResult.insertId,
                paymentId: paymentResult.insertId
            });
        } catch (error) {
            console.error('Error processing donation and payment:', error);
            res.status(500).json({ error: 'Failed to process donation and payment' });
        }
    });

    // Route to get user's payment history
    router.get('/payments/:userId', async (req, res) => {
        try {
            const query = `
                SELECT 
                    p.payment_id,
                    p.amount,
                    p.payment_method,
                    p.payment_date,
                    d.disaster_id,
                    dis.disaster_type,
                    dis.location
                FROM payments p
                JOIN donations d ON p.user_id = d.donor_id
                JOIN disasters dis ON d.disaster_id = dis.disaster_id
                WHERE p.user_id = ?
                ORDER BY p.payment_date DESC
            `;
            
            const [results] = await db.execute(query, [req.params.userId]);
            
            // Format the decimal amounts before sending
            const formattedResults = results.map(row => ({
                ...row,
                amount: parseFloat(row.amount)
            }));
            
            res.json(formattedResults);
        } catch (error) {
            console.error('Error fetching payment history:', error);
            res.status(500).json({ error: 'Failed to fetch payment history' });
        }
    });

    return router;
};

module.exports = donationGateway;
