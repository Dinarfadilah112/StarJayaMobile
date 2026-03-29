-- Enable Realtime for auth_sessions table
-- This allows the web to listen for changes in real-time

-- Drop publication if exists
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;

-- Create new publication for realtime
CREATE PUBLICATION supabase_realtime FOR TABLE auth_sessions;

-- Alternative: Recreate if already exists
ALTER PUBLICATION supabase_realtime ADD TABLE auth_sessions;

-- Verify setup
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
