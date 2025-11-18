-- Add pairing_status column to users table
-- This script should be run in Supabase SQL Editor for both production and staging

-- Step 1: Add the column with default value
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pairing_status TEXT NOT NULL DEFAULT 'not_started';

-- Step 2: Add CHECK constraint to ensure only valid values
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_pairing_status_check;

ALTER TABLE users 
ADD CONSTRAINT users_pairing_status_check 
CHECK (pairing_status IN ('not_started', 'awaiting_partner', 'paired'));

-- Step 3: Update existing users based on their partnership status
-- Users with partnerships should be 'paired'
UPDATE users 
SET pairing_status = 'paired' 
WHERE id IN (
  SELECT DISTINCT userid FROM partnerships
  UNION
  SELECT DISTINCT partnerid FROM partnerships
);

-- Step 4: Ensure all remaining users are 'not_started' (should already be default, but just in case)
UPDATE users 
SET pairing_status = 'not_started' 
WHERE pairing_status IS NULL OR pairing_status = '';

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_pairing_status 
ON users(pairing_status);

-- Step 6: Add comment for documentation
COMMENT ON COLUMN users.pairing_status IS 'Partnership status: not_started (User1 before inviting), awaiting_partner (User1 after inviting), paired (both users after partnership created)';

-- Verification query
SELECT 
  pairing_status,
  COUNT(*) as user_count
FROM users
GROUP BY pairing_status
ORDER BY pairing_status;

