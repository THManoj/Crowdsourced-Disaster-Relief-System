const express = require('express');

const sosAlertRoutes = (db) => {
  const router = express.Router();

  // Get all SOS alerts for high severity disasters
  router.get('/sos-alerts', async (req, res) => {
    try {
      const query = `
        SELECT sa.*, d.disaster_type, d.location
        FROM sosalerts sa
        JOIN disasters d ON sa.disaster_id = d.disaster_id
        WHERE d.severity_level = 3
        ORDER BY sa.sent_at DESC
      `;
      const [rows] = await db.execute(query);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
      res.status(500).json({ error: 'Failed to fetch SOS alerts' });
    }
  });

  // Update SOS alert status
  router.put('/sos-alerts/:id', async (req, res) => {
    const { status } = req.body;
    try {
      await db.execute(
        'UPDATE sosalerts SET status = ? WHERE alert_id = ?',
        [status, req.params.id]
      );
      res.json({ message: 'Alert status updated successfully' });
    } catch (error) {
      console.error('Error updating alert status:', error);
      res.status(500).json({ error: 'Failed to update alert status' });
    }
  });

  // Delete SOS alert
  router.delete('/sos-alerts/:id', async (req, res) => {
    try {
      await db.execute('DELETE FROM sosalerts WHERE alert_id = ?', [req.params.id]);
      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  });

  return router;
};

module.exports = sosAlertRoutes;