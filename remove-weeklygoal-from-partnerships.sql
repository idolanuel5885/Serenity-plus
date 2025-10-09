-- Remove weeklygoal column from partnerships table
-- Weekly goals should only be stored in the weeks table

-- First, let's see what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'partnerships' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Remove the weeklygoal column from partnerships table
ALTER TABLE partnerships DROP COLUMN IF EXISTS weeklygoal;

-- Verify the column was removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'partnerships' 
AND table_schema = 'public'
ORDER BY ordinal_position;

