const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  const userRole = req.user?.role;
  if (userRole !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = (db) => {
  // Signup route - remove 'auth' from path since it's already included in app.use('/auth', authRoutes)
  router.post('/signup', async (req, res) => {
    const { username, email, phone_number, country, city, password } = req.body;

    if (!username || !email || !phone_number || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Check if email or username already exists
      const [existingUser] = await db.execute(
        'SELECT * FROM users WHERE email = ? OR username = ?', 
        [email, username]
      );
      
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email or username already registered' });
      }

      // Insert new user with default role as 'User'
      const [result] = await db.execute(
        'INSERT INTO users (username, email, phone_number, country, city, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, phone_number, country, city, password, 'User']
      );

      res.status(201).json({ 
        message: 'User registered successfully',
        userId: result.insertId 
      });

    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Error registering user' });
    }
  });

  // Login route
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      // Check user credentials
      const [users] = await db.execute(
        'SELECT user_id, username, email, role FROM users WHERE email = ? AND password = ?',
        [email, password]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'Invalid email or password' });
      }

      const user = users[0];

      // Generate JWT token
      const token = jwt.sign(
        { id: user.user_id, email: user.email, role: user.role },
        'your_jwt_secret',
        { expiresIn: '1h' }
      );

      res.json({
        token,
        user: {
          id: user.user_id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Error during login' });
    }
  });

  return router;
};
