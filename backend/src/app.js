import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import userRoutes from './routes/user.routes.js';
import locationRoutes from './routes/location.routes.js';
import { TIMEZONE, getMalaysiaTime, getTodayDate, getCurrentTime, getDebugTimeInfo } from './config/timezone.js';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Health check with timezone debug
app.get('/api/health', (req, res) => {
    const debugInfo = getDebugTimeInfo();
    res.json({
        status: 'ok',
        timezone: TIMEZONE,
        database: process.env.DB_TYPE || 'mysql',
        time: debugInfo
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;
