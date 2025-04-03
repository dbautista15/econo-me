const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/econo-me'
});

// Modify the connection to handle errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test connection function
const testConnection = async () => {
    const client = await pool.connect();
    try {
        console.log('Connected to database successfully');
    } catch (err) {
        console.error('Error connecting to the database', err.stack);
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { pool, testConnection };