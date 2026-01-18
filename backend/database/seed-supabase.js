// Database seed script for Supabase
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
    try {
        console.log('🌱 Starting Supabase seed...\n');

        // First, check if tables exist by trying a simple query
        console.log('📋 Checking tables...');
        const { error: checkError } = await supabase.from('roles').select('count').limit(1);

        if (checkError && checkError.code === '42P01') {
            console.log('❌ Tables do not exist! Please run the SQL migration in Supabase first.');
            console.log('\nGo to: https://supabase.com/dashboard/project/ukwomiemtzlnnvzhmxno');
            console.log('Navigate to: SQL Editor → New query');
            console.log('Then paste and run the migration SQL.\n');
            process.exit(1);
        }

        // Seed roles
        console.log('📋 Seeding roles...');
        const { error: rolesError } = await supabase
            .from('roles')
            .upsert([
                { id: 1, name: 'admin', permissions: { all: true } },
                { id: 2, name: 'manager', permissions: { view_all: true, manage_attendance: true } },
                { id: 3, name: 'staff', permissions: { self_attendance: true } }
            ], { onConflict: 'name' });

        if (rolesError) {
            console.log('   ⚠️ Roles may already exist:', rolesError.message);
        } else {
            console.log('   ✅ Roles seeded');
        }

        // Seed default shift
        console.log('📋 Seeding shifts...');
        const { error: shiftsError } = await supabase
            .from('shifts')
            .upsert([
                { id: 1, name: 'Regular', start_time: '09:00:00', end_time: '18:00:00', late_after_minutes: 15 }
            ], { onConflict: 'id' });

        if (shiftsError) {
            console.log('   ⚠️ Shifts may already exist:', shiftsError.message);
        } else {
            console.log('   ✅ Shifts seeded');
        }

        // Seed admin user
        console.log('📋 Seeding admin user...');
        const adminPassword = await bcrypt.hash('admin123', 10);

        const { error: adminError } = await supabase
            .from('users')
            .upsert([
                {
                    id: 1,
                    name: 'Administrator',
                    email: 'admin@kehadiran.com',
                    password_hash: adminPassword,
                    role_id: 1,
                    status: 'active'
                }
            ], { onConflict: 'email' });

        if (adminError) {
            console.log('   ⚠️ Admin may already exist:', adminError.message);
        } else {
            console.log('   ✅ Admin user seeded');
        }

        // Seed sample users
        console.log('📋 Seeding sample users...');
        const staffPassword = await bcrypt.hash('staff123', 10);

        const { error: usersError } = await supabase
            .from('users')
            .upsert([
                { name: 'Ahmad bin Ali', email: 'ahmad@kehadiran.com', password_hash: staffPassword, role_id: 3, status: 'active' },
                { name: 'Siti binti Hassan', email: 'siti@kehadiran.com', password_hash: staffPassword, role_id: 3, status: 'active' },
                { name: 'Muhammad bin Razak', email: 'muhammad@kehadiran.com', password_hash: staffPassword, role_id: 2, status: 'active' }
            ], { onConflict: 'email' });

        if (usersError) {
            console.log('   ⚠️ Users may already exist:', usersError.message);
        } else {
            console.log('   ✅ Sample users seeded');
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📝 Default credentials:');
        console.log('   Admin: admin@kehadiran.com / admin123');
        console.log('   Staff: ahmad@kehadiran.com / staff123');

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seed();
