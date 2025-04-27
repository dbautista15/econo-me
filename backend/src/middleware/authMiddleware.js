/**
 * @fileoverview Authentication Middleware
 * 
 * This middleware handles JWT token validation and user authentication for protected routes.
 * It extracts the JWT token from the request header, verifies it, and attaches the user
 * data to the request object for use in subsequent route handlers.
 * 
 * @module middleware/authMiddleware
 * @requires jsonwebtoken
 * @requires ../utils/db
 */

const jwt = require('jsonwebtoken');
const { pool } = require('../utils/db');

/**
 * Express middleware that authenticates requests using JWT tokens
 * 
 * This middleware performs the following steps:
 * 1. Extracts the JWT token from the Authorization header
 * 2. Verifies the token's signature and expiration
 * 3. Validates that the user referenced in the token exists in the database
 * 4. Attaches the decoded user data to the request object for use by route handlers
 *
 * If any step fails, it returns a 401 Unauthorized response
 *
 * @async
 * @function authMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() on success or returns an error response
 * 
 * @example
 * // Use in routes:
 * router.get('/protected-route', authMiddleware, (req, res) => {
 *   // req.user is now available with user data from the token
 *   const userId = req.user.id;
 *   res.json({ message: `Hello user ${userId}!` });
 * });
 */
const authMiddleware = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
    
    // Check if user exists in database
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Add user from payload to request object
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;