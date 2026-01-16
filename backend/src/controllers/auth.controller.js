import authService from '../services/auth.service.js';

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await authService.login(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

// Logout
export const logout = async (req, res) => {
    // For JWT-based auth, logout is handled client-side by removing the token
    // Here we just acknowledge the request
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Get current user
export const me = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
};

// Register (optional - admin only in production)
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email and password are required'
            });
        }

        const result = await authService.register({ name, email, password });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
