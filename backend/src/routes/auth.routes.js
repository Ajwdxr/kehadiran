import { Router } from 'express';
import { login, logout, me, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
