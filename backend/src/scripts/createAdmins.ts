import db from '../config/database';
import { AuthUtils } from '../utils/auth.utils';
import { logger } from '../config/logger';


async function createAdmin() {
    try {
        const email = 'admin@example.com';
        const password = 'admin123';
        const fullName = 'Admin User';

        // Check if admin exists
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);

        if (existing.rows.length > 0) {
            logger.info('❌ Admin user already exists');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await AuthUtils.hashPassword(password);

        // Create admin
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, full_name, role`,
            [email, hashedPassword, fullName, 'admin']
        );

        logger.info('✅ Admin user created successfully:');
        logger.info('Email:', email);
        logger.info('Password:', password);
        logger.info('User:', result.rows[0]);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();