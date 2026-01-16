import userService from '../services/user.service.js';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(parseInt(id));

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

// Create user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role_id, status } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email and password are required'
            });
        }

        const user = await userService.createUser({
            name,
            email,
            password,
            role_id,
            status
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role_id, status } = req.body;

        const user = await userService.updateUser(parseInt(id), {
            name,
            email,
            password,
            role_id,
            status
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Deactivate user
export const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deactivateUser(parseInt(id));

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Activate user
export const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.activateUser(parseInt(id));

        res.json({
            success: true,
            message: 'User activated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
