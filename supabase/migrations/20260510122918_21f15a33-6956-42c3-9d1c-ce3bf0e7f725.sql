
-- 1. Hide team_members.email from anonymous (public) viewers; keep available to authenticated admins via app code
REVOKE SELECT (email) ON public.team_members FROM anon;

-- 2. Allow public submission_rate_limits inserts so the rate limiter actually works for anon submissions
DROP POLICY IF EXISTS "Public can insert rate limit attempts" ON public.submission_rate_limits;
CREATE POLICY "Public can insert rate limit attempts"
ON public.submission_rate_limits
FOR INSERT
TO anon, authenticated
WITH CHECK (
  ip_address IS NOT NULL
  AND submission_type IS NOT NULL
  AND dedupe_hash IS NOT NULL
);

-- 3. Profiles: add INSERT policy so users (and the handle_new_user trigger) can create only their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Lock down SECURITY DEFINER helper functions: revoke direct EXECUTE from anon/authenticated.
--    They are still callable from RLS policies (which run as the policy owner), so RLS keeps working.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text, text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text, text) TO service_role;

-- 5. Realtime channel authorization: enable RLS on realtime.messages and deny by default.
--    No app code currently relies on Realtime broadcasts; admins/service role bypass.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all realtime channel access by default" ON realtime.messages;
CREATE POLICY "Deny all realtime channel access by default"
ON realtime.messages
FOR SELECT
TO anon, authenticated
USING (false);
DROP POLICY IF EXISTS "Deny all realtime sends by default" ON realtime.messages;
CREATE POLICY "Deny all realtime sends by default"
ON realtime.messages
FOR INSERT
TO anon, authenticated
WITH CHECK (false);
