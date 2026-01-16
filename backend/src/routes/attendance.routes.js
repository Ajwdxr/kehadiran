import { Router } from 'express';
import {
    checkIn,
    checkOut,
    getToday,
    getHistory,
    getAllByDate,
    getMonthlySummary,
    getSchedule
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Schedule info (public for authenticated users)
router.get('/schedule', getSchedule);

// User routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getToday);
router.get('/history', getHistory);
router.get('/summary', getMonthlySummary);

// Admin/Manager routes
router.get('/all', requireManager, getAllByDate);

export default router;
