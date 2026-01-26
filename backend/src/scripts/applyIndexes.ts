
import db from '../config/database';

async function applyIndexes() {
    console.log('🔄 Applying database indexes...');

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        console.log('1️⃣ Creating index: idx_bookings_availability...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_availability 
            ON bookings (room_id, start_time, end_time);
        `);

        console.log('2️⃣ Creating index: idx_bookings_user_id...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_user_id 
            ON bookings (user_id);
        `);

        await client.query('COMMIT');
        console.log('✅ All indexes applied successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to apply indexes:', error);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

applyIndexes();
