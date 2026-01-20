import { BaseRepository } from './base.repository.js';
import db, { DB_TYPE } from '../config/database.js';
import { getTodayDate, getCurrentTime } from '../config/timezone.js';

class AttendanceRepository extends BaseRepository {
    constructor() {
        super('attendance');
    }

    // Get today's attendance for user
    async findTodayByUser(userId) {
        const today = getTodayDate();

        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq('user_id', userId)
                .eq('date', today)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            const [rows] = await db.query(
                `SELECT * FROM ${this.tableName} WHERE user_id = ? AND date = ?`,
                [userId, today]
            );
            return rows[0] || null;
        }
    }

    // Get attendance history for user
    async findHistoryByUser(userId, options = {}) {
        const { startDate, endDate, limit = 30 } = options;

        if (DB_TYPE === 'supabase') {
            let query = db
                .from(this.tableName)
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .limit(limit);

            if (startDate) query = query.gte('date', startDate);
            if (endDate) query = query.lte('date', endDate);

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } else {
            let sql = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
            const params = [userId];

            if (startDate) {
                sql += ` AND date >= ?`;
                params.push(startDate);
            }
            if (endDate) {
                sql += ` AND date <= ?`;
                params.push(endDate);
            }

            sql += ` ORDER BY date DESC LIMIT ?`;
            params.push(limit);

            const [rows] = await db.query(sql, params);
            return rows;
        }
    }

    // Get all attendance for a date
    async findByDate(date) {
        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select(`
          *,
          users (id, name, email)
        `)
                .eq('date', date)
                .order('check_in');
            if (error) throw error;
            return data;
        } else {
            const [rows] = await db.query(`
        SELECT a.*, u.name as user_name, u.email as user_email
        FROM attendance a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.date = ?
        ORDER BY a.check_in
      `, [date]);
            return rows;
        }
    }

    // Get monthly summary
    async getMonthlySummary(userId, year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        if (DB_TYPE === 'supabase') {
            const { data, error } = await db
                .from(this.tableName)
                .select('*')
                .eq('user_id', userId)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date');
            if (error) throw error;
            return data;
        } else {
            const [rows] = await db.query(`
        SELECT * FROM ${this.tableName}
        WHERE user_id = ? AND date >= ? AND date <= ?
        ORDER BY date
      `, [userId, startDate, endDate]);
            return rows;
        }
    }

    // Check if already checked in today
    async hasCheckedInToday(userId) {
        const record = await this.findTodayByUser(userId);
        return record !== null;
    }

    // Check-in
    async checkIn(userId, data = {}) {
        const today = getTodayDate();
        const now = getCurrentTime();

        return this.create({
            user_id: userId,
            date: today,
            check_in: now,
            status: data.status || 'present',
            source: data.source || 'web',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            device_info: data.device_info || null
        });
    }

    // Check-out
    async checkOut(userId) {
        const today = getTodayDate();
        const now = getCurrentTime();

        const record = await this.findTodayByUser(userId);
        if (!record) {
            throw new Error('No check-in record found for today');
        }

        return this.update(record.id, {
            check_out: now
        });
    }
}

export const attendanceRepository = new AttendanceRepository();
export default attendanceRepository;
