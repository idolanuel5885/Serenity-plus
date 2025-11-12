-- Rename weeks table columns to be more descriptive
-- user1sits → inviteeSits (the user who used the invite code)
-- user2sits → inviterSits (the user who created the account and shared the invite code)
-- This makes it clear which user is which based on the partnership creation flow

-- Run this script in both production and staging Supabase SQL Editor

-- Step 1: Rename user1sits to inviteeSits
ALTER TABLE weeks 
  RENAME COLUMN user1sits TO inviteesits;

-- Step 2: Rename user2sits to inviterSits  
ALTER TABLE weeks 
  RENAME COLUMN user2sits TO invitersits;

-- Step 3: Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'weeks' 
AND table_schema = 'public'
AND column_name IN ('inviteesits', 'invitersits')
ORDER BY ordinal_position;

-- Note: The logic remains the same - we're just renaming for clarity
-- inviteeSits = user who used the invite code (was user1sits)
-- inviterSits = user who created account and shared invite code (was user2sits)

