import userRepository from '../models/user.model.js';
import authService from './auth.service.js';

class UserService {
    // Get all users
    async getAllUsers() {
        return userRepository.findAllWithRoles();
    }

    // Get user by ID
    async getUserById(id) {
        const user = await userRepository.findWithRole(id);
        if (!user) {
            throw new Error('User not found');
        }
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }

    // Create user
    async createUser(data) {
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw new Error('Email already exists');
        }

        const password_hash = await authService.hashPassword(data.password);

        const user = await userRepository.create({
            name: data.name,
            email: data.email,
            password_hash,
            role_id: data.role_id || 3,
            status: data.status || 'active'
        });

        const { password_hash: _, ...safeUser } = user;
        return safeUser;
    }

    // Update user
    async updateUser(id, data) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // If email is being changed, check for duplicates
        if (data.email && data.email !== user.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing) {
                throw new Error('Email already in use');
            }
        }

        const updateData = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.role_id) updateData.role_id = data.role_id;
        if (data.status) updateData.status = data.status;

        // If password is being changed
        if (data.password) {
            updateData.password_hash = await authService.hashPassword(data.password);
        }

        return userRepository.update(id, updateData);
    }

    // Deactivate user (soft delete)
    async deactivateUser(id) {
        return userRepository.update(id, { status: 'inactive' });
    }

    // Activate user
    async activateUser(id) {
        return userRepository.update(id, { status: 'active' });
    }
}

export const userService = new UserService();
export default userService;
