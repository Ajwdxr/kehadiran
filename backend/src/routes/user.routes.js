import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deactivateUser,
    activateUser
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin, requireManager } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Manager routes (view only)
router.get('/', requireManager, getAllUsers);
router.get('/:id', requireManager, getUserById);

// Admin routes (full CRUD)
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.patch('/:id/deactivate', requireAdmin, deactivateUser);
router.patch('/:id/activate', requireAdmin, activateUser);

export default router;
