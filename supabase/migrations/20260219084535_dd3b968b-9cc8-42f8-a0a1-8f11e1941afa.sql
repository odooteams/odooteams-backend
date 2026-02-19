
-- Fix 1: Restrict profiles - only own profile or admin can view
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role));

-- Allow anon to see profiles for public-facing features (team display etc) but only name
-- Actually, profiles should be restricted. Team members table is separate.

-- Fix 2: Enable leaked password protection (informational - must be done in Supabase dashboard)

-- Fix 3: Add rate limiting concept - add a check to contact_submissions to prevent spam
-- Already has validation, good enough at DB level

-- Fix 4: Ensure website_visitors and page_views cannot be updated/deleted by anyone (already done, confirmed)

-- Fix 5: Restrict audit_logs - ensure only admins can read, authenticated can insert (already done)
-- But let's make the INSERT policy more restrictive - users can only insert their own user_id
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;

CREATE POLICY "Users can insert own audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));
