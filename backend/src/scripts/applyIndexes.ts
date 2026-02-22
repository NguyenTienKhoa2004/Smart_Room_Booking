
import db from '../config/database';
import { logger } from '../config/logger';


async function applyIndexes() {
    logger.info('🔄 Applying database indexes...');

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        logger.info('1️⃣ Creating index: idx_bookings_availability...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_availability 
            ON bookings (room_id, start_time, end_time);
        `);

        logger.info('2️⃣ Creating index: idx_bookings_user_id...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_user_id 
            ON bookings (user_id);
        `);

        await client.query('COMMIT');
        logger.info('✅ All indexes applied successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('❌ Failed to apply indexes:', error);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

applyIndexes();
