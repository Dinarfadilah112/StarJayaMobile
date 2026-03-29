-- CRITICAL SECURITY UPDATE
-- This script removes the "Open for Everyone" policies and restricts access.

-- 1. DROP EXISTING OPEN POLICIES
DROP POLICY IF EXISTS "Enable all access for all users" ON public.kategori;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.barang;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.transaksi;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.detail_transaksi;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.auth_sessions;

-- 2. ENABLE RLS (Already enabled in schema, but ensuring it)
ALTER TABLE public.kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;

-- 3. CREATE SECURE POLICIES
-- Only the Service Role (which the Go Backend uses) can do everything.
-- Anonymous users (React Native App without backend) will be blocked by default.

-- Allow SELECT only for some tables if needed (Optional, usually we route everything via backend)
-- For now, we block EVERYTHING from the public API side.
-- The Go Backend connects via "postgres" superuser or service role, so it BYPASSES RLS.
