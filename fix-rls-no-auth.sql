-- RLS Fix for Supabase Database WITHOUT Authentication
-- Your app uses Supabase as database only, not for auth
-- This disables RLS or creates policies that work without auth.uid()

-- Option 1: DISABLE RLS COMPLETELY (Simplest solution)
-- This allows all operations without authentication
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, use these permissive policies
-- (Uncomment the lines below and comment out the DISABLE lines above)

-- ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
-- DROP POLICY IF EXISTS "Users can view weeks for their partnerships" ON weeks;
-- DROP POLICY IF EXISTS "Users can insert weeks for their partnerships" ON weeks;
-- DROP POLICY IF EXISTS "Users can update weeks for their partnerships" ON weeks;
-- DROP POLICY IF EXISTS "Users can delete weeks for their partnerships" ON weeks;

-- DROP POLICY IF EXISTS "Users can view their own partnerships" ON partnerships;
-- DROP POLICY IF EXISTS "Users can insert partnerships" ON partnerships;
-- DROP POLICY IF EXISTS "Users can update their own partnerships" ON partnerships;

-- DROP POLICY IF EXISTS "Users can view their own profile" ON users;
-- DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
-- DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
-- DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;

-- DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;
-- DROP POLICY IF EXISTS "Users can insert invitations" ON invitations;
-- DROP POLICY IF EXISTS "Users can update their own invitations" ON invitations;

-- DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
-- DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
-- DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Create permissive policies that allow all operations
-- CREATE POLICY "Allow all operations on weeks" ON weeks FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on partnerships" ON partnerships FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on invitations" ON invitations FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

