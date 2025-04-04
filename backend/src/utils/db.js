const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Only once

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/econo-me'
});

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Modify the connection to handle errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test connection function
const testConnection = async () => {
    try {
        // Test PostgreSQL connection
        const client = await pool.connect();
        console.log('PostgreSQL connection successful');
        client.release();

        // Test Sequelize connection
        await sequelize.authenticate();
        console.log('Sequelize connection successful');
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
};

module.exports = { 
    pool, 
    sequelize,
    testConnection 
};