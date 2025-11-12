-- Simplify Partnerships Table Schema
-- This script removes redundant fields from the partnerships table
-- Run this in BOTH production and staging Supabase SQL Editor
--
-- Final schema will be: id, userid, partnerid, createdat, score
--
-- Fields being removed:
-- - Partner fields (already in users table): partnername, partneremail, partnerimage, partnerweeklytarget
-- - Week-specific fields (already in weeks table): weeklygoal, usersits, partnersits, currentweekstart

-- Step 1: Remove partner fields (these are redundant - fetch from users table instead)
ALTER TABLE partnerships 
  DROP COLUMN IF EXISTS partnername,
  DROP COLUMN IF EXISTS partneremail,
  DROP COLUMN IF EXISTS partnerimage,
  DROP COLUMN IF EXISTS partnerweeklytarget;

-- Step 2: Remove week-specific fields (these belong in weeks table)
ALTER TABLE partnerships 
  DROP COLUMN IF EXISTS weeklygoal,
  DROP COLUMN IF EXISTS usersits,
  DROP COLUMN IF EXISTS partnersits,
  DROP COLUMN IF EXISTS currentweekstart;

-- Step 3: Verify final schema
-- The partnerships table should now only have:
-- - id (UUID, PRIMARY KEY)
-- - userid (UUID, NOT NULL, REFERENCES users(id))
-- - partnerid (UUID, NOT NULL, REFERENCES users(id))
-- - createdat (TIMESTAMP WITH TIME ZONE)
-- - score (INTEGER, DEFAULT 0)
-- - UNIQUE(userid, partnerid) constraint

-- Display final schema for verification
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'partnerships'
ORDER BY ordinal_position;

