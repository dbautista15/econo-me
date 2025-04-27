/**
 * @fileoverview Express Application Configuration
 * 
 * This file configures the Express application for the Econo-me API.
 * It sets up middleware, defines routes, and exports the configured
 * Express application instance.
 * 
 * @module app
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires ./routes/routes
 * @requires ./routes/authRoutes
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const economeRoutes = require('./routes/routes');
const authRoutes = require('./routes/authRoutes');

/**
 * Express application instance
 * 
 * Creates a new Express application instance that will be configured
 * with middleware and routes.
 * 
 * @constant {Object} app - The Express application instance
 */
const app = express();

/**
 * Middleware Configuration
 * 
 * Configures the Express application with necessary middleware:
 * - CORS: Enables Cross-Origin Resource Sharing for all routes
 * - express.json(): Parses JSON request bodies
 * 
 * These middleware functions are applied to all routes in the application.
 */
app.use(cors());
app.use(express.json());

/**
 * Route Registration
 * 
 * Registers the application's route handlers with specific path prefixes:
 * - '/api': General application routes (expenses, budgets, incomes, etc.)
 * - '/api/auth': Authentication-related routes (login, register, profile, etc.)
 * 
 * This approach organizes routes into logical groups and establishes
 * a consistent URL structure for the API.
 */
app.use('/api', economeRoutes);
app.use('/api/auth', authRoutes);

/**
 * Root Route Handler
 * 
 * Defines a simple handler for the root path ('/') that returns a welcome message.
 * This provides a basic indicator that the API is running when accessed directly.
 * 
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Simple text response
 */
app.get('/', (req, res) => {
    res.send('Welcome to the Econo-me API');
});

/**
 * Test Route Handler
 * 
 * Defines a test endpoint ('/api/test') that returns a JSON confirmation
 * that the backend is operational. Useful for health checks and basic
 * connectivity testing.
 * 
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with status message
 */
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

/**
 * Module Export
 * 
 * Exports the configured Express application for use in other modules,
 * particularly the server initialization in index.js. This pattern allows
 * for separation of concerns between application configuration and server
 * startup. It also facilitates testing by allowing the app to be imported
 * without starting the server.
 * 
 * @exports app
 */
module.exports = app;