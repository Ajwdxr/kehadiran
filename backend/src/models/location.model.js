import BaseRepository from './base.repository.js';
import db, { DB_TYPE } from '../config/database.js';

class LocationRepository extends BaseRepository {
    constructor() {
        super('locations');
    }

    // Get all active locations
    async findAllActive() {
        // If db is not initialized, return empty array (skip geofencing)
        if (!db) {
            console.warn('⚠️ Database not initialized, skipping location check');
            return [];
        }

        if (DB_TYPE === 'mysql') {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} WHERE is_active = TRUE ORDER BY name`
            );
            return rows;
        } else {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq('is_active', true)
                .order('name');
            if (error) throw error;
            return data || [];
        }
    }

    // Get location by ID
    async findById(id) {
        if (DB_TYPE === 'mysql') {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} WHERE id = ?`,
                [id]
            );
            return rows[0] || null;
        } else {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        }
    }
}

export const locationRepository = new LocationRepository();
export default locationRepository;

