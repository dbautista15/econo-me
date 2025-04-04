const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./utils/db');

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Access-Control-Allow-Credentials'
  ],
  credentials: true
};

const app = express();

// Apply CORS
app.use(cors(corsOptions));
app.use(express.json());

// Require routes
const routes = require('./routes/routes');
app.use('/api', routes);

// Test database connection
testConnection().catch(err => {
    console.error('Failed to connect to the database:', err);
});

// Require models to ensure tables are created
require('./models/expense');
require('./models/budget');

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});