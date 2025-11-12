-- Script 4: Verify WEEKS and SESSIONS tables match production
-- These tables should already match, but this script ensures they're correct

-- WEEKS table should have:
-- id, partnershipid, weeknumber, weekstart, weekend, inviteesits, invitersits, weeklygoal, goalmet, createdat
-- (No changes needed - staging already matches)

-- SESSIONS table should have:
-- id, createdat, duration, iscompleted, completedat, startedat, userid, partnershipid
-- (No changes needed - staging already matches)

-- This is a verification script - run it to check if any unexpected columns exist
-- If you see any columns listed below that shouldn't be there, you may need to drop them

-- Check WEEKS table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'weeks'
ORDER BY ordinal_position;

-- Check SESSIONS table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

