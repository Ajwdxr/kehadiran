import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';

const DB_TYPE = process.env.DB_TYPE || 'mysql';

console.log(`🔧 Database Type: ${DB_TYPE}`);

let db = null;

if (DB_TYPE === 'supabase') {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    console.log(`🔧 Supabase URL configured: ${supabaseUrl ? 'Yes' : 'NO - MISSING!'}`);
    console.log(`🔧 Supabase Key configured: ${supabaseKey ? 'Yes' : 'NO - MISSING!'}`);

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ CRITICAL: Supabase credentials not configured!');
        console.error('   Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
    } else {
        // Supabase client
        db = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client created');
    }
} else {
    // MySQL connection pool
    console.log(`🔧 MySQL Host: ${process.env.MYSQL_HOST || 'localhost'}`);
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
    console.log('✅ MySQL pool created');
}

// Test connection
export async function testConnection() {
    try {
        if (!db) {
            throw new Error('Database client not initialized - check environment variables');
        }

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

