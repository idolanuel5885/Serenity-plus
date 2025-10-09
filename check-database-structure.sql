-- Check what tables actually exist in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if invites table exists with different name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%invite%'
ORDER BY table_name;

-- Check the structure of any invite-related tables
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%invite%'
ORDER BY table_name, ordinal_position;

