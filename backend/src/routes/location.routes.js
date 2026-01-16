import { Router } from 'express';
import {
    getAllLocations,
    getActiveLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    checkLocation
} from '../controllers/location.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// Public route to check location (for attendance)
router.get('/check', authenticate, checkLocation);

// Get active locations (for all authenticated users)
router.get('/active', authenticate, getActiveLocations);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllLocations);
router.get('/:id', authenticate, requireAdmin, getLocation);
router.post('/', authenticate, requireAdmin, createLocation);
router.put('/:id', authenticate, requireAdmin, updateLocation);
router.delete('/:id', authenticate, requireAdmin, deleteLocation);

export default router;
