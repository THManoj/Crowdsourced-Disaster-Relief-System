const express = require('express');

const reliefCampRoutes = (db) => {
    const router = express.Router();

    // Middleware to check admin role
    const checkAdmin = (req, res, next) => {
        const userRole = req.headers['user-role'];
        if (userRole !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        next();
    };

    // Get all relief camps with disaster information
    router.get('/relief-camps', async (req, res) => {
        try {
            const [rows] = await db.execute(`
                SELECT rc.*, d.disaster_type 
                FROM reliefcamps rc
                JOIN disasters d ON rc.disaster_id = d.disaster_id
                ORDER BY rc.camp_id DESC
            `);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching relief camps:', error);
            res.status(500).json({ error: 'Failed to fetch relief camps' });
        }
    });

    // Create new relief camp
    router.post('/relief-camps', async (req, res) => {
        const { camp_name, location, capacity, disaster_id } = req.body;

        try {
            const [result] = await db.execute(
                'INSERT INTO reliefcamps (camp_name, location, capacity, disaster_id) VALUES (?, ?, ?, ?)',
                [camp_name, location, parseInt(capacity), disaster_id]
            );

            res.status(201).json({
                message: 'Relief camp created successfully',
                campId: result.insertId
            });
        } catch (error) {
            console.error('Error creating relief camp:', error);
            res.status(500).json({ error: 'Failed to create relief camp' });
        }
    });

    // New route to fetch relief camps with low resources for the latest high-severity disaster
    router.get('/relief-camps/low-resources', async (req, res) => {
        try {
            const query = `
                SELECT 
                    rc.id AS camp_id,
                    rc.location,
                    rc.capacity,
                    rc.current_occupancy,
                    r.name AS resource_name,
                    r.quantity
                FROM ReliefCamp rc
                JOIN Resource r ON rc.id = r.camp_id
                WHERE rc.disaster_id IN (
                    SELECT id FROM DisasterReport WHERE severity = 'High' ORDER BY timestamp
                )
                AND r.quantity < 300
                ORDER BY rc.id;
            `;
            const [results] = await db.query(query);

            // Format the results into a nested structure
            const lowResourceCamps = results.reduce((acc, row) => {
                const camp = acc.find(c => c.camp_id === row.camp_id);
                if (camp) {
                    camp.resources.push({
                        name: row.resource_name,
                        quantity: row.quantity
                    });
                } else {
                    acc.push({
                        camp_id: row.camp_id,
                        location: row.location,
                        capacity: row.capacity,
                        current_occupancy: row.current_occupancy,
                        resources: row.resource_name ? [{
                            name: row.resource_name,
                            quantity: row.quantity
                        }] : []
                    });
                }
                return acc;
            }, []);

            res.json(lowResourceCamps);
        } catch (err) {
            console.error('Error fetching low-resource relief camps:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    // Delete relief camp (admin only)
    router.delete('/relief-camps/:id', checkAdmin, async (req, res) => {
        try {
            await db.execute('DELETE FROM reliefcamps WHERE camp_id = ?', [req.params.id]);
            res.json({ message: 'Relief camp deleted successfully' });
        } catch (error) {
            console.error('Error deleting relief camp:', error);
            res.status(500).json({ error: 'Failed to delete relief camp' });
        }
    });

    return router;
};

module.exports = reliefCampRoutes;
