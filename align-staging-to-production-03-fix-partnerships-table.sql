-- Script 3: Modify PARTNERSHIPS table to match production schema
-- This script adds missing partner fields and removes extra fields

-- Step 1: Add missing partner fields that exist in production
-- Production has: partnername, partneremail, partnerimage, partnerweeklytarget
ALTER TABLE partnerships 
  ADD COLUMN IF NOT EXISTS partnername TEXT,
  ADD COLUMN IF NOT EXISTS partneremail TEXT,
  ADD COLUMN IF NOT EXISTS partnerimage TEXT,
  ADD COLUMN IF NOT EXISTS partnerweeklytarget INTEGER;

-- Step 2: Remove extra columns that don't exist in production
-- Production PARTNERSHIPS table does NOT have: updatedat, isactive, currentweeknumber, currentstreak, longeststreak, totalweeks
ALTER TABLE partnerships 
  DROP COLUMN IF EXISTS updatedat,
  DROP COLUMN IF EXISTS isactive,
  DROP COLUMN IF EXISTS currentweeknumber,
  DROP COLUMN IF EXISTS currentstreak,
  DROP COLUMN IF EXISTS longeststreak,
  DROP COLUMN IF EXISTS totalweeks;

-- Note: The UNIQUE(userid, partnerid) constraint should remain as it exists in production
-- Note: All other columns (id, userid, partnerid, usersits, partnersits, weeklygoal, score, currentweekstart, createdat) should remain

