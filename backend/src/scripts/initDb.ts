import fs from 'fs';
import path from 'path';
import db from '../config/database';
import { logger } from '../config/logger';


async function initDb() {
    try {
        // Assume running from project root (backend/)
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        logger.info('🔄 Running schema migration...');
        await db.query(schema);
        logger.info('✅ Schema migration completed successfully');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error running schema migration:', error);
        process.exit(1);
    }
}

initDb();
