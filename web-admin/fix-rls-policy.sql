-- Fix RLS policies untuk auth_sessions
-- Mobile app menggunakan anon role, bukan authenticated

-- Drop semua policy yang ada
DROP POLICY IF EXISTS "Allow anonymous insert to auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "Allow anonymous read auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "Allow authenticated update auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "Allow anon update auth_sessions" ON auth_sessions;

-- Allow web & mobile (anon) to create new sessions
CREATE POLICY "Allow anonymous insert to auth_sessions"
ON auth_sessions FOR INSERT
TO anon
WITH CHECK (true);

-- Allow web & mobile (anon) to read ALL sessions (for realtime)
CREATE POLICY "Allow anonymous read auth_sessions"
ON auth_sessions FOR SELECT
TO anon
USING (true);

-- PENTING: Allow mobile app (anon) to update sessions
CREATE POLICY "Allow anon update auth_sessions"
ON auth_sessions FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
