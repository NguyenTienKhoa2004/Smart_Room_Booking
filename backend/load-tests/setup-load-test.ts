/**
 * Setup Script for Load Testing
 * 
 * This script helps you prepare your database for load testing by:
 * 1. Creating a test user account
 * 2. Verifying room availability
 * 3. Providing configuration values for artillery.yml
 */

import db from '../src/config/database';
import bcrypt from 'bcryptjs';

async function setupLoadTesting() {
    console.log('🔧 Setting up load testing environment...\n');

    try {
        // 1. Create or verify test user
        const testEmail = 'loadtest@example.com';
        const testPassword = 'LoadTest123!';

        console.log('👤 Checking for test user...');
        const existingUser = await db.query(
            'SELECT id, email FROM users WHERE email = $1',
            [testEmail]
        );

        let testUserId: number;

        if (existingUser.rows.length > 0) {
            testUserId = existingUser.rows[0].id;
            console.log(`✅ Test user already exists: ${testEmail} (ID: ${testUserId})`);
        } else {
            const hashedPassword = await bcrypt.hash(testPassword, 10);
            const newUser = await db.query(
                `INSERT INTO users (email, password_hash, role, full_name) 
         VALUES ($1, $2, 'user', $3) 
         RETURNING id, email`,
                [testEmail, hashedPassword, 'Load Test User']
            );
            testUserId = newUser.rows[0].id;
            console.log(`✅ Created test user: ${testEmail} (ID: ${testUserId})`);
        }

        // 2. Get available rooms
        console.log('\n🏢 Available rooms:');
        const rooms = await db.query(
            "SELECT id, name, capacity FROM rooms WHERE status = 'available' ORDER BY id LIMIT 10"
        );

        if (rooms.rows.length === 0) {
            console.log('❌ No rooms found! Please run: npm run seed:rooms');
            process.exit(1);
        }

        rooms.rows.forEach(room => {
            console.log(`   - Room ID ${room.id}: ${room.name} (Capacity: ${room.capacity})`);
        });

        const testRoomId = rooms.rows[0].id;

        // 3. Clean up old test bookings
        console.log('\n🧹 Cleaning up old test bookings...');
        const deleteResult = await db.query(
            `DELETE FROM bookings 
       WHERE user_id = $1 
       AND (title LIKE 'Load Test%' OR title LIKE '%Load Test%')`,
            [testUserId]
        );
        console.log(`✅ Deleted ${deleteResult.rowCount} old test bookings`);

        // 4. Provide configuration
        console.log('\n' + '='.repeat(70));
        console.log('📋 LOAD TESTING CONFIGURATION');
        console.log('='.repeat(70));
        console.log('\n1️⃣  Update load-tests/artillery.yml with these values:\n');
        console.log('   variables:');
        console.log(`     testRoomId: ${testRoomId}`);
        console.log('\n   In the login section, use:');
        console.log(`     email: "${testEmail}"`);
        console.log(`     password: "${testPassword}"`);
        console.log('\n2️⃣  Start your backend server:');
        console.log('   npm run dev');
        console.log('\n3️⃣  Run the load test (in a new terminal):');
        console.log('   npm run load:test');
        console.log('\n4️⃣  Or generate an HTML report:');
        console.log('   npm run load:report');
        console.log('\n' + '='.repeat(70));
        console.log('\n✅ Setup complete! You\'re ready to run load tests.\n');

    } catch (error) {
        console.error('❌ Error during setup:', error);
        process.exit(1);
    } finally {
        await db.end();
    }
}

setupLoadTesting();
