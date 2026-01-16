import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/auth.js';
import userRepository from '../models/user.model.js';

class AuthService {
    // Generate JWT token
    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role_id: user.role_id
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, config.jwt.secret);
        } catch (error) {
            return null;
        }
    }

    // Hash password
    async hashPassword(password) {
        return bcrypt.hash(password, config.bcrypt.saltRounds);
    }

    // Compare password
    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    // Login
    async login(email, password) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (user.status !== 'active') {
            throw new Error('Account is inactive');
        }

        const isValid = await this.comparePassword(password, user.password_hash);

        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        const token = this.generateToken(user);

        // Remove sensitive data
        const { password_hash, ...safeUser } = user;

        return {
            user: safeUser,
            token
        };
    }

    // Register new user
    async register(userData) {
        const existing = await userRepository.findByEmail(userData.email);

        if (existing) {
            throw new Error('Email already registered');
        }

        const password_hash = await this.hashPassword(userData.password);

        const user = await userRepository.create({
            name: userData.name,
            email: userData.email,
            password_hash,
            role_id: userData.role_id || 3, // Default to staff role
            status: 'active'
        });

        const { password_hash: _, ...safeUser } = user;
        const token = this.generateToken(user);

        return {
            user: safeUser,
            token
        };
    }

    // Get current user
    async getCurrentUser(userId) {
        const user = await userRepository.findWithRole(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
}

export const authService = new AuthService();
export default authService;
