import express from 'express';
import * as authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import { wrapAuthenticatedHandler } from '../types';

const router = express.Router();

// Public authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Add route for getting user data (for authentication tests)
router.get('/user', authMiddleware, wrapAuthenticatedHandler(authController.getUserData));

// Protected authentication routes these will be implemented in a profile management page later
// router.get('/profile', authMiddleware, wrapAuthenticatedHandler(authController.getProfile));
// router.put('/profile', authMiddleware, wrapAuthenticatedHandler(authController.updateProfile));
// router.put('/change-password', authMiddleware, wrapAuthenticatedHandler(authController.changePassword));

export default router;