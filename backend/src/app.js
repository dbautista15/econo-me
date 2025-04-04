const express = require('express');
const cors = require('cors');
require('dotenv').config();
const economeRoutes = require('./routes/routes');
const authRoutes = require('./routes/authRoutes'); // Add this line

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', economeRoutes);
app.use('/api/auth', authRoutes); // Add this line

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Econo-me API');
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Export the app for testing purposes
module.exports = app;