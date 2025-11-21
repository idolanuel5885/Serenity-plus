-- Add return_token column to users table for email-based identity recovery
-- This allows users to return to their account via magic link

-- Add return_token column (nullable initially for existing users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS return_token TEXT;

-- Create unique index on return_token for fast lookups
-- Note: NULL values are allowed (for existing users without tokens yet)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_return_token 
ON users(return_token) 
WHERE return_token IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.return_token IS 'Secret token for email-based account recovery. Sent via magic link email. Long-lived, can be rotated.';

-- Verification query (optional, for manual check)
-- SELECT id, name, email, return_token IS NOT NULL as has_token FROM users LIMIT 10;

