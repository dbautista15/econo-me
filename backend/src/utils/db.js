const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create PostgreSQL connection pool for raw SQL queries
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/econo-me'
});

// Handle unexpected errors on the pool
pool.on('error', (err) => {
    console.error('Unexpected error on PostgreSQL connection:', err);
    process.exit(-1);
});

// Create Sequelize ORM connection (used for model-based operations)
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

// Test both connection methods
const testConnection = async () => {
    try {
        // Test PostgreSQL connection
        const client = await pool.connect();
        console.log('PostgreSQL connection successful');
        client.release();

        // Test Sequelize connection
        await sequelize.authenticate();
        console.log('Sequelize connection successful');
        
        return true;
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