-- Script 2: Modify USERS table to match production schema
-- This script removes extra columns and constraints that don't exist in production

-- Step 1: Remove UNIQUE constraint on invitecode (if it exists)
-- Production allows duplicate invite codes, so we need to remove the constraint
-- Try common constraint names first
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_invitecode_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_invitecode_unique;

-- Drop any other unique constraints on invitecode using dynamic SQL
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint 
    WHERE conrelid = 'users'::regclass 
    AND contype = 'u'
    AND conname LIKE '%invitecode%'
  ) LOOP
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Step 2: Remove extra columns that don't exist in production
-- Production USERS table only has: id, name, email, weeklytarget, usualsitlength, image, invitecode, createdat
ALTER TABLE users 
  DROP COLUMN IF EXISTS updatedat,
  DROP COLUMN IF EXISTS primarywindow,
  DROP COLUMN IF EXISTS timezone,
  DROP COLUMN IF EXISTS whypractice,
  DROP COLUMN IF EXISTS supportneeds;

-- Step 3: Ensure required columns exist with correct constraints
-- Make sure name is NOT NULL (production has it as NOT NULL based on working_memory)
ALTER TABLE users 
  ALTER COLUMN name SET NOT NULL;

-- Make sure invitecode is NOT NULL (production has it)
ALTER TABLE users 
  ALTER COLUMN invitecode SET NOT NULL;

-- Make sure image has a default value (production has default '/icons/meditation-1.svg')
ALTER TABLE users 
  ALTER COLUMN image SET DEFAULT '/icons/meditation-1.svg';

-- Note: email already has UNIQUE constraint which matches production
-- Note: weeklytarget and usualsitlength already have defaults which match production

