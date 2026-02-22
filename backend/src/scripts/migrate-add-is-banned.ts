import db from '../config/database';
import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger';


async function runMigration() {
    try {
        logger.info('Running migration: add_is_banned_to_users...');

        const migrationPath = path.join(__dirname, '../../migrations/add_is_banned_to_users.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await db.query(sql);

        logger.info('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
