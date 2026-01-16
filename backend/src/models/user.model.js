import { BaseRepository } from './base.repository.js';
import db, { DB_TYPE } from '../config/database.js';

class UserRepository extends BaseRepository {
    constructor() {
        super('users');
    }

    // Find user by email
    async findByEmail(email) {
        return this.findOne('email', email);
    }

    // Find users by role
    async findByRole(roleId) {
        return this.findMany('role_id', roleId);
    }

    // Find active users
    async findActive() {
        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq('status', 'active')
                .order('name');
            if (error) throw error;
            return data;
        } else {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} WHERE status = 'active' ORDER BY name`
            );
            return rows;
        }
    }

    // Get user with role info
    async findWithRole(id) {
        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select(`
          *,
          roles (id, name, permissions)
        `)
                .eq('id', id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            const [rows] = await db.query(`
        SELECT u.*, r.name as role_name, r.permissions
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [id]);
            return rows[0] || null;
        }
    }

    // Get all users with roles
    async findAllWithRoles() {
        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select(`
          *,
          roles (id, name)
        `)
                .order('name');
            if (error) throw error;
            return data;
        } else {
            const [rows] = await db.query(`
        SELECT u.id, u.name, u.email, u.status, u.created_at,
               r.id as role_id, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.name
      `);
            return rows;
        }
    }
}

export const userRepository = new UserRepository();
export default userRepository;
