-- Drop existing table if exists
DROP TABLE IF EXISTS auth_sessions CASCADE;

-- Create auth_sessions table
CREATE TABLE auth_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    device_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous insert to auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "Allow anonymous read auth_sessions" ON auth_sessions;
DROP POLICY IF EXISTS "Allow authenticated update auth_sessions" ON auth_sessions;

-- Allow web to create new sessions (anonymous)
CREATE POLICY "Allow anonymous insert to auth_sessions"
ON auth_sessions FOR INSERT
TO anon
WITH CHECK (true);

-- Allow web to read ALL sessions (for realtime)
CREATE POLICY "Allow anonymous read auth_sessions"
ON auth_sessions FOR SELECT
TO anon
USING (true);

-- Allow mobile app to update sessions
CREATE POLICY "Allow authenticated update auth_sessions"
ON auth_sessions FOR UPDATE
TO authenticated
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_auth_sessions_session_id ON auth_sessions(session_id);
CREATE INDEX idx_auth_sessions_status ON auth_sessions(status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auth_sessions_updated_at
    BEFORE UPDATE ON auth_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
