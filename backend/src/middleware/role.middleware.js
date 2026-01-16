// Role-based access control middleware
// Roles: 1 = admin, 2 = manager, 3 = staff

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const userRole = req.user.role_id;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

// Convenience middlewares
export const requireAdmin = requireRole(1);
export const requireManager = requireRole(1, 2);
export const requireStaff = requireRole(1, 2, 3);

export default requireRole;
