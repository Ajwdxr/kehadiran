import attendanceService from '../services/attendance.service.js';
import { getMalaysiaTime, getTodayDate } from '../config/timezone.js';

// Check in
export const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const { source, latitude, longitude, device_info, note } = req.body;

        const attendance = await attendanceService.checkIn(userId, {
            source: source || 'web',
            latitude,
            longitude,
            device_info,
            note
        });

        res.status(201).json({
            success: true,
            message: attendance.is_late
                ? 'Check-in berjaya (Lewat)'
                : 'Check-in berjaya',
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Check out
export const checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const { note } = req.body;

        const attendance = await attendanceService.checkOut(userId, { note });

        res.json({
            success: true,
            message: attendance.is_early_leave
                ? 'Check-out berjaya (Awal)'
                : 'Check-out berjaya',
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get today's attendance
export const getToday = async (req, res) => {
    try {
        const userId = req.user.id;
        const attendance = await attendanceService.getToday(userId);

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get attendance history
export const getHistory = async (req, res) => {
    try {
        const userId = req.query.user_id || req.user.id;
        const { start_date, end_date, limit } = req.query;

        const history = await attendanceService.getHistory(userId, {
            startDate: start_date,
            endDate: end_date,
            limit: limit ? parseInt(limit) : 30
        });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all attendance for a date (admin)
export const getAllByDate = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || getTodayDate();

        const attendances = await attendanceService.getAllByDate(targetDate);

        res.json({
            success: true,
            data: attendances
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get monthly summary
export const getMonthlySummary = async (req, res) => {
    try {
        const userId = req.query.user_id || req.user.id;
        const now = getMalaysiaTime();
        const year = parseInt(req.query.year) || now.getFullYear();
        const month = parseInt(req.query.month) || (now.getMonth() + 1);

        const summary = await attendanceService.getMonthlySummary(userId, year, month);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get work schedule info
export const getSchedule = async (req, res) => {
    try {
        const schedule = attendanceService.getScheduleInfo();

        res.json({
            success: true,
            data: schedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
