// Database seed script
import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'kehadiran'
};

async function seed() {
    let connection;

    try {
        connection = await mysql.createConnection(config);

        console.log('🌱 Starting seed...\n');

        // Seed roles
        console.log('📋 Seeding roles...');
        await connection.query(`
      INSERT IGNORE INTO roles (id, name, permissions) VALUES
      (1, 'admin', '{"all": true}'),
      (2, 'manager', '{"view_all": true, "manage_attendance": true}'),
      (3, 'staff', '{"self_attendance": true}')
    `);
        console.log('   ✅ Roles seeded');

        // Seed default shift
        console.log('📋 Seeding shifts...');
        await connection.query(`
      INSERT IGNORE INTO shifts (id, name, start_time, end_time, late_after_minutes) VALUES
      (1, 'Regular', '09:00:00', '18:00:00', 15)
    `);
        console.log('   ✅ Shifts seeded');

        // Seed admin user
        console.log('📋 Seeding admin user...');
        const adminPassword = await bcrypt.hash('admin123', 10);

        await connection.query(`
      INSERT IGNORE INTO users (id, name, email, password_hash, role_id, status) VALUES
      (1, 'Administrator', 'admin@kehadiran.com', ?, 1, 'active')
    `, [adminPassword]);
        console.log('   ✅ Admin user seeded');

        // Seed sample users
        console.log('📋 Seeding sample users...');
        const staffPassword = await bcrypt.hash('staff123', 10);

        await connection.query(`
      INSERT IGNORE INTO users (name, email, password_hash, role_id, status) VALUES
      ('Ahmad bin Ali', 'ahmad@kehadiran.com', ?, 3, 'active'),
      ('Siti binti Hassan', 'siti@kehadiran.com', ?, 3, 'active'),
      ('Muhammad bin Razak', 'muhammad@kehadiran.com', ?, 2, 'active')
    `, [staffPassword, staffPassword, staffPassword]);
        console.log('   ✅ Sample users seeded');

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📝 Default credentials:');
        console.log('   Admin: admin@kehadiran.com / admin123');
        console.log('   Staff: ahmad@kehadiran.com / staff123');

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

seed();
