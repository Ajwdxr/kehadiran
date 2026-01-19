import db, { DB_TYPE } from '../config/database.js';

// Helper to ensure db is initialized
function ensureDb() {
    if (!db) {
        throw new Error('Database not initialized. Please check environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY)');
    }
    return db;
}

// Repository pattern - abstract database operations
export class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    // Find all records
    async findAll(options = {}) {
        const { limit = 100, offset = 0, orderBy = 'created_at', order = 'DESC' } = options;

        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .order(orderBy, { ascending: order === 'ASC' })
                .range(offset, offset + limit - 1);
            if (error) throw error;
            return data;
        } else {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            return rows;
        }
    }

    // Find by ID
    async findById(id) {
        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} WHERE id = ?`,
                [id]
            );
            return rows[0] || null;
        }
    }

    // Find one by field
    async findOne(field, value) {
        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq(field, value)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} WHERE ${field} = ?`,
                [value]
            );
            return rows[0] || null;
        }
    }

    // Find many by field
    async findMany(field, value, options = {}) {
        const { orderBy = 'created_at', order = 'DESC' } = options;

        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq(field, value)
                .order(orderBy, { ascending: order === 'ASC' });
            if (error) throw error;
            return data;
        } else {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} WHERE ${field} = ? ORDER BY ${orderBy} ${order}`,
                [value]
            );
            return rows;
        }
    }

    // Create record
    async create(data) {
        if (DB_TYPE === 'supabase') {
            const { data: result, error } = await db
                .from(this.tableName)
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return result;
        } else {
            const [result] = await db.query(
                `INSERT INTO ${this.tableName} SET ?`,
                [data]
            );
            return { id: result.insertId, ...data };
        }
    }

    // Update record
    async update(id, data) {
        if (DB_TYPE === 'supabase') {
            const { data: result, error } = await db
                .from(this.tableName)
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result;
        } else {
            await db.query(
                `UPDATE ${this.tableName} SET ? WHERE id = ?`,
                [data, id]
            );
            return { id, ...data };
        }
    }

    // Delete record
    async delete(id) {
        if (DB_TYPE === 'supabase') {
            const { error } = await db
                .from(this.tableName)
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            await db.query(
                `DELETE FROM ${this.tableName} WHERE id = ?`,
                [id]
            );
            return true;
        }
    }

    // Custom query (MySQL only, use with caution)
    async query(sql, params = []) {
        if (DB_TYPE === 'supabase') {
            throw new Error('Custom SQL queries not supported in Supabase mode');
        }
        const [rows] = await db.query(sql, params);
        return rows;
    }
}

export default BaseRepository;
