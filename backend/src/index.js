const app = require('./app');
const { pool, testConnection } = require('./utils/db');

// Test database connection
testConnection().catch(err => {
    console.error('Failed to connect to the database:', err);
    // Don't exit process here, allow app to start even if DB connection fails initially
});

// Require models to ensure tables are created
require('./models/expense');
require('./models/budget');

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});