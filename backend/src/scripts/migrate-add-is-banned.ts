import db from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        console.log('Running migration: add_is_banned_to_users...');

        const migrationPath = path.join(__dirname, '../../migrations/add_is_banned_to_users.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await db.query(sql);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
