import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';

const DB_TYPE = process.env.DB_TYPE || 'mysql';

let db;

if (DB_TYPE === 'supabase') {
    // Supabase client
    db = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
    );
} else {
    // MySQL connection pool
    db = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'kehadiran',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

// Test connection
export async function testConnection() {
    try {
        if (DB_TYPE === 'supabase') {
            const { error } = await db.from('users').select('count').limit(1);
            if (error && error.code !== 'PGRST116') throw error;
        } else {
            await db.query('SELECT 1');
        }
        console.log(`✅ Database connected (${DB_TYPE})`);
        return true;
    } catch (error) {
        console.error(`❌ Database connection failed:`, error.message);
        return false;
    }
}

export { db, DB_TYPE };
export default db;
