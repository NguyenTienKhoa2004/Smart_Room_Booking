import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from current directory
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('--- DB Connection Test ---');
console.log('Dotenv loaded:', result.error ? 'Error' : 'Success');
if (result.error) console.error(result.error);

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****** (Set)' : '(Not Set)');

const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function test() {
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('✅ Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Time from DB:', res.rows[0].now);
        await client.end();
    } catch (err: any) {
        console.error('❌ Connection failed:', err.message);
        if (err.code) console.error('Code:', err.code);
        // Print more details if available
        if (err.detail) console.error('Detail:', err.detail);
    }
}

test();
