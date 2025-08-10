import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  registerValidation,
  loginValidation
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;