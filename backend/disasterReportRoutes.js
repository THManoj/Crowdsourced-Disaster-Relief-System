const express = require('express');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  const userRole = req.headers['user-role'];
  if (userRole !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

const disasterReportRoutes = (db) => {
  const router = express.Router();

  // Function to check and create SOS alerts for existing high severity disasters
  const createSOSAlertsForExisting = async () => {
    const connection = await db.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();

      // Get all high severity disasters without SOS alerts
      const [highSeverityDisasters] = await connection.execute(`
        SELECT d.* 
        FROM disasters d 
        LEFT JOIN sosalerts s ON d.disaster_id = s.disaster_id 
        WHERE d.severity_level = 3 AND s.alert_id IS NULL
      `);

      console.log(`Found ${highSeverityDisasters.length} high severity disasters without alerts`);

      // Create SOS alerts for each high severity disaster
      for (const disaster of highSeverityDisasters) {
        const message = `High severity ${disaster.disaster_type} reported in ${disaster.location}. Immediate assistance required.`;
        await connection.execute(
          'INSERT INTO sosalerts (user_id, disaster_id, message, status) VALUES (?, ?, ?, ?)',
          [disaster.reported_by, disaster.disaster_id, message, 'Pending']
        );
        console.log(`Created SOS alert for disaster ID: ${disaster.disaster_id}`);
      }

      await connection.commit();
      console.log('Successfully created SOS alerts for existing disasters');
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error creating SOS alerts for existing disasters:', error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  };

  // Call when server starts
  createSOSAlertsForExisting().catch(console.error);

  // Manual trigger endpoint
  router.post('/create-existing-alerts', async (req, res) => {
    try {
      await createSOSAlertsForExisting();
      res.json({ message: 'SOS alerts created for existing high severity disasters' });
    } catch (error) {
      console.error('Error creating SOS alerts:', error);
      res.status(500).json({ error: 'Failed to create SOS alerts' });
    }
  });

  // Endpoint to create a new disaster report
  router.post('/disaster-report', async (req, res) => {
    const { user_id, location, severity, description } = req.body;

    try {
      console.log({ user_id, location, severity, description });

      // Insert new disaster report
      const [result] = await db.execute(
        'INSERT INTO disasters (user_id, disaster_type, location, severity, description) VALUES (?, ?, ?, ?, ?)',
        [user_id, disaster_type, location, severity, description]
      );

      res.status(201).json({ message: 'Disaster report created successfully!', reportId: result.insertId });
    } catch (error) {
      console.error('Error creating disaster report:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  // Endpoint to get SOS alerts
  router.get('/sos-alerts', async (req, res) => {
    try {
      const query = `
        SELECT sa.*, d.disaster_type, d.location 
        FROM sosalerts sa
        JOIN disasters d ON sa.disaster_id = d.disaster_id
        WHERE d.severity_level = 3
        ORDER BY sa.sent_at DESC
      `;
      const [alerts] = await db.execute(query);
      res.status(200).json(alerts);
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  // Get all disasters
  router.get('/disasters', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM disasters ORDER BY reported_at DESC');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching disasters:', error);
      res.status(500).json({ error: 'Failed to fetch disasters' });
    }
  });

  // Get disasters reported by a specific user
  router.get('/disasters/user/:userId', async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM disasters WHERE reported_by = ? ORDER BY reported_at DESC',
        [req.params.userId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching user disasters:', error);
      res.status(500).json({ error: 'Failed to fetch disasters' });
    }
  });

  // Submit new disaster
  router.post('/submit-disaster', async (req, res) => {
    const { disaster_type, location, severity_level, description } = req.body;
    const reported_by = req.body.user_id;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Insert the disaster
      const [result] = await connection.execute(
        'INSERT INTO disasters (disaster_type, location, severity_level, description, reported_by) VALUES (?, ?, ?, ?, ?)',
        [disaster_type, location, parseInt(severity_level), description, reported_by]
      );

      // Automatically create SOS alert for high severity
      if (parseInt(severity_level) === 3) {
        const message = `High severity ${disaster_type} reported in ${location}. Immediate assistance required.`;
        await connection.execute(
          'INSERT INTO sosalerts (user_id, disaster_id, message, status) VALUES (?, ?, ?, ?)',
          [reported_by, result.insertId, message, 'Pending']
        );
      }

      await connection.commit();
      res.status(201).json({
        message: 'Disaster report created successfully',
        id: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error creating disaster report:', error);
      res.status(500).json({ error: 'Failed to create disaster report' });
    } finally {
      connection.release();
    }
  });

  // Function to check and create SOS alerts for high severity disasters
  const createSOSAlertsForHighSeverity = async () => {
    try {
      // Get all high severity disasters without SOS alerts
      const [highSeverityDisasters] = await db.execute(`
        SELECT d.* 
        FROM disasters d 
        LEFT JOIN sosalerts s ON d.disaster_id = s.disaster_id 
        WHERE d.severity_level = 3 AND s.alert_id IS NULL
      `);

      // Create SOS alerts for each high severity disaster
      for (const disaster of highSeverityDisasters) {
        const message = `High severity ${disaster.disaster_type} reported in ${disaster.location}. Immediate assistance required.`;
        await db.execute(
          'INSERT INTO sosalerts (user_id, disaster_id, message, status) VALUES (?, ?, ?, ?)', 
          [disaster.reported_by, disaster.disaster_id, message, 'Pending']
        );
      }
    } catch (error) {
      console.error('Error creating SOS alerts:', error);
    }
  };

  // Call this function periodically (every 5 minutes)
  setInterval(createSOSAlertsForHighSeverity, 5 * 60 * 1000);

  // Admin route to modify disasters
  router.put('/disasters/:id', checkAdmin, async (req, res) => {
    const { disaster_type, location, severity_level, description } = req.body;

    try {
      await db.beginTransaction();

      // Update the disaster
      await db.execute(
        'UPDATE disasters SET disaster_type = ?, location = ?, severity_level = ?, description = ? WHERE disaster_id = ?', 
        [disaster_type, location, parseInt(severity_level), description, req.params.id]
      );

      // Handle SOS alerts based on severity
      if (parseInt(severity_level) === 3) {
        // Check if SOS alert already exists
        const [existingAlert] = await db.execute(
          'SELECT * FROM sosalerts WHERE disaster_id = ?', 
          [req.params.id]
        );

        if (existingAlert.length === 0) {
          const message = `High severity ${disaster_type} reported in ${location}. Immediate assistance required.`;
          await db.execute(
            'INSERT INTO sosalerts (user_id, disaster_id, message, status) VALUES (?, ?, ?, ?)', 
            [req.body.user_id || null, req.params.id, message, 'Pending']
          );
        }
      } else {
        // Remove SOS alert if severity is lowered
        await db.execute('DELETE FROM sosalerts WHERE disaster_id = ?', [req.params.id]);
      }

      await db.commit();
      res.json({ message: 'Disaster updated successfully' });
    } catch (error) {
      await db.rollback();
      console.error('Error updating disaster:', error);
      res.status(500).json({ error: 'Failed to update disaster' });
    }
  });

  // Admin route to delete disasters
  router.delete('/disasters/:id', checkAdmin, async (req, res) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete related SOS alerts
      await connection.execute('DELETE FROM sosalerts WHERE disaster_id = ?', [req.params.id]);

      // Delete the disaster
      await connection.execute('DELETE FROM disasters WHERE disaster_id = ?', [req.params.id]);

      await connection.commit();
      res.json({ message: 'Disaster and related alerts deleted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting disaster:', error);
      res.status(500).json({ error: 'Failed to delete disaster' });
    } finally {
      connection.release();
    }
  });

  return router;
};

module.exports = disasterReportRoutes;
