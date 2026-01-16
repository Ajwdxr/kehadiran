import BaseRepository from './base.repository.js';

class LocationRepository extends BaseRepository {
    constructor() {
        super('locations');
    }

    // Get all active locations
    async findAllActive() {
        if (this.dbType === 'mysql') {
            const [rows] = await this.db.query(
                `SELECT * FROM ${this.tableName} WHERE is_active = TRUE ORDER BY name`
            );
            return rows;
        } else {
            const { data, error } = await this.db
                .from(this.tableName)
                .select('*')
                .eq('is_active', true)
                .order('name');
            if (error) throw error;
            return data;
        }
    }

    // Get location by ID
    async findById(id) {
        if (this.dbType === 'mysql') {
            const [rows] = await this.db.query(
                `SELECT * FROM ${this.tableName} WHERE id = ?`,
                [id]
            );
            return rows[0] || null;
        } else {
            const { data, error } = await this.db
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        }
    }
}

export const locationRepository = new LocationRepository();
export default locationRepository;
