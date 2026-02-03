-- Create Admin Account SQL Script (CORRECTED)
-- Copy and paste this into pgAdmin Query Tool

-- Account Details:
-- Email: admin@example.com
-- Password: admin123
-- Full Name: Admin User
-- Role: admin

-- Ensure we clean up any old record first to avoid salt mismatches
DELETE FROM users WHERE email = 'admin@example.com';

INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
    'admin@example.com', 
    '$2b$10$7euR.hQmh9Nar4O4mFjIbuQbjOxqV43jj12twRFK7V5tocmWxipUC', -- Corrected Bcrypt hash for 'admin123'
    'Admin User', 
    'admin'
);

-- Verification
SELECT id, email, full_name, role FROM users WHERE email = 'admin@example.com';
