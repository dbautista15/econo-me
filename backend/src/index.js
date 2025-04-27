/**
 * @fileoverview Server Initialization
 * 
 * This file serves as the entry point for the Econo-me application.
 * It initializes the Express server, connects to the database,
 * ensures all database tables are created, and starts listening
 * for incoming requests.
 * 
 * @module index
 * @requires ./app
 * @requires ./models/expense
 * @requires ./models/budget
 * @requires ./models/income
 * @requires ./models/savingsGoal
 * @requires ./utils/db
 */

const app = require('./app');
const { testConnection } = require('./utils/db');

/**
 * Test database connection
 * 
 * Tests the connection to the PostgreSQL database using the utility
 * function from db.js. Logs an error message if the connection fails.
 */
testConnection().catch(err => {
    console.error('Failed to connect to the database:', err);
});

/**
 * Initialize database tables
 * 
 * Requires all model files to ensure their respective tables
 * are created in the database. Each model file contains a
 * function that executes a CREATE TABLE IF NOT EXISTS query.
 * 
 * This approach ensures that the application always has the
 * necessary database structure before handling any requests.
 */
require('./models/expense');
require('./models/budget');
require('./models/income');
require('./models/savingsGoal');

/**
 * Server configuration
 * 
 * Sets the port for the server to listen on. Uses the PORT
 * environment variable if available, otherwise defaults to 5003.
 * 
 * @constant {number} PORT - The port number for the server
 */
const PORT = process.env.PORT || 5003;

/**
 * Start the server
 * 
 * Initializes the HTTP server using the configured Express app.
 * The server begins listening for incoming connections on the
 * specified port. Logs a success message when the server starts.
 */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});