/**
 * Database Configuration Module
 * 
 * This module sets up and exports both PostgreSQL raw connection pool
 * and Sequelize ORM connection for the application.
 * 
 * @module database
 */

const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * PostgreSQL Connection Pool
 * 
 * Creates a connection pool for executing raw SQL queries.
 * Uses DATABASE_URL from environment variables or falls back to default connection string.
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/econo-me'
});

/**
 * Error handler for unexpected pool errors
 * Logs the error and exits the process
 */
pool.on('error', (err) => {
    console.error('Unexpected error on PostgreSQL connection:', err);
    process.exit(-1);
});

/**
 * Sequelize ORM Instance
 * 
 * Creates a Sequelize instance for model-based database operations.
 * Configuration is loaded from environment variables with fallbacks to default values.
 */
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
      max: 5,      // Maximum number of connection instances in pool
      min: 0,      // Minimum number of connection instances in pool
      acquire: 30000,  // Maximum time (ms) to get a connection from pool
      idle: 10000   // Maximum time (ms) that a connection can be idle before being released
    }
  }
);

/**
 * Test Database Connections
 * 
 * Tests both PostgreSQL raw connection and Sequelize ORM connection.
 * Logs success or failure messages to the console.
 * 
 * @async
 * @returns {Promise<boolean>} True if both connections are successful
 * @throws {Error} If either connection fails
 */
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