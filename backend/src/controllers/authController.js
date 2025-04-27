/**
 * @fileoverview Authentication Controller Module
 * 
 * This module handles all authentication-related operations including user registration,
 * login, profile management, and password changes. It also includes database setup
 * for the users table.
 * 
 * @module controllers/authController
 * @requires ../utils/db
 * @requires bcrypt
 * @requires jsonwebtoken
 */

const { pool } = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Creates the users table in the database if it doesn't exist
 * 
 * @function createUserTable
 * @async
 * @private
 */
const createUserTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created successfully or already exists');
  } catch (err) {
    console.error('Error creating users table:', err);
  }
};

// Initialize the users table
createUserTable();

/**
 * Register a new user with validation and hashed password
 * 
 * @function register
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Desired username
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - Plain text password (will be hashed)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data, token, and message
 */
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    // Create JWT token
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Authenticate an existing user and issue a JWT token
 * 
 * @function login
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data, token, and message
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Fetch the current authenticated user's profile
 * Requires authentication middleware to set req.user
 * 
 * @function getProfile
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object set by authentication middleware
 * @param {number} req.user.id - User ID from token
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user profile data
 */
exports.getProfile = async (req, res) => {
  try {
    // The user ID should be available from the auth middleware
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

/**
 * Update a user's profile information (username and/or email)
 * Requires authentication middleware to set req.user
 * 
 * @function updateProfile
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object set by authentication middleware
 * @param {number} req.user.id - User ID from token
 * @param {Object} req.body - Request body
 * @param {string} [req.body.username] - New username (optional)
 * @param {string} [req.body.email] - New email address (optional)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user data
 */
exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    // Check if new email/username would conflict with existing users
    if (email || username) {
      const checkQuery = 'SELECT * FROM users WHERE (email = $1 OR username = $2) AND id != $3';
      const checkResult = await pool.query(checkQuery, [
        email || '', 
        username || '', 
        req.user.id
      ]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Username or email already in use by another account' 
        });
      }
    }

    // Update only the fields that were provided
    let updateQuery = 'UPDATE users SET ';
    const queryParams = [];
    const updateFields = [];
    
    if (username) {
      queryParams.push(username);
      updateFields.push(`username = $${queryParams.length}`);
    }
    
    if (email) {
      queryParams.push(email);
      updateFields.push(`email = $${queryParams.length}`);
    }
    
    // If no fields to update, return early
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    updateQuery += updateFields.join(', ');
    queryParams.push(req.user.id);
    updateQuery += ` WHERE id = $${queryParams.length} RETURNING id, username, email, created_at`;
    
    const result = await pool.query(updateQuery, queryParams);
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

/**
 * Change a user's password with verification of current password
 * Requires authentication middleware to set req.user
 * 
 * @function changePassword
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object set by authentication middleware
 * @param {number} req.user.id - User ID from token
 * @param {Object} req.body - Request body
 * @param {string} req.body.currentPassword - User's current password
 * @param {string} req.body.newPassword - User's desired new password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  
  try {
    // Get user with password
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password change' });
  }
};