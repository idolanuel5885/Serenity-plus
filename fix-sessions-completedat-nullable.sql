-- Fix sessions table: Make completedat nullable
-- The completedat column should be NULL when session is created, and set when session completes
-- This fixes the error: "null value in column 'completedat' of relation 'sessions' violates not-null constraint"

-- First, check current constraint
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
AND column_name = 'completedat';

-- Make completedat nullable
ALTER TABLE sessions ALTER COLUMN completedat DROP NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND table_schema = 'public'
AND column_name = 'completedat';

