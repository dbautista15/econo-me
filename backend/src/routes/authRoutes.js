/**
 * Authentication Routes
 * 
 * This file contains Express routes for user authentication and profile management.
 * It includes both public routes (accessible without authentication) and
 * protected routes (requiring authentication).
 * 
 * @module authRoutes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Public authentication routes
 * 
 * These routes don't require authentication:
 * POST /register - Creates a new user account
 * POST /login - Authenticates a user and returns a token
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

/**
 * Protected authentication routes
 * 
 * These routes require the authMiddleware for authentication:
 * GET /profile - Retrieves the current user's profile
 * PUT /profile - Updates the current user's profile
 * PUT /change-password - Changes the current user's password
 */
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;