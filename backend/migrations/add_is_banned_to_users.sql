-- Add is_banned column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Create index for faster queries on banned users
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users (is_banned);

-- Update existing users to not be banned by default
UPDATE users SET is_banned = false WHERE is_banned IS NULL;
