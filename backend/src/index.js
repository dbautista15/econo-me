const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./utils/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});