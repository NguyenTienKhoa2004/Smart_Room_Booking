import db from '../config/database';
import { AuthUtils } from '../utils/auth.utils';

async function createAdmin() {
    try {
        const email = 'admin@example.com';
        const password = 'admin123';
        const fullName = 'Admin User';

        // Check if admin exists
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);

        if (existing.rows.length > 0) {
            console.log('❌ Admin user already exists');
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

        console.log('✅ Admin user created successfully:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('User:', result.rows[0]);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();