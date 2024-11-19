const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const donationRoutes = require('./donationRoutes');
const getDonationDetails = require('./getDonationDetails');
const donationGateway = require('./donationGateway');
const reliefCampRoutes = require('./reliefCampRoutes');
const profileRoutes = require('./profileRoutes');
const disasterReportRoutes = require('./disasterReportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Create database connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'manoj@200318',
  database: 'disastermanagementsystem',
  multipleStatements: true  // Allow multiple SQL statements
});

// Route logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Connect to database and setup routes
db.getConnection()
  .then(() => {
    console.log('Connected to the database!');

    // Setup routes
    app.use('/auth', authRoutes(db));
    app.use('/api', donationRoutes(db));
    app.use('/api', getDonationDetails(db));
    app.use('/api', donationGateway(db));
    app.use('/api', reliefCampRoutes(db));
    app.use('/api', profileRoutes(db));
    app.use('/api', disasterReportRoutes(db));
    app.use('/api', require('./sosAlertRoutes')(db));

    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    throw err;
  });
