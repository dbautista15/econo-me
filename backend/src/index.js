const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./utils/db');
const economeRoutes = require('./routes/routes');

// Require the expense model to ensure the table is created
require('./models/expense');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', economeRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Econo-me API');
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});