-- 1. team_members.email — revoke column-level read from anon and authenticated
REVOKE SELECT (email) ON public.team_members FROM anon, authenticated;

-- 2. profiles update policy: restrict to authenticated role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. submission_rate_limits — add admin-only INSERT policy (service role bypasses RLS)
CREATE POLICY "Admins can insert rate limits"
  ON public.submission_rate_limits
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Remove sensitive tables from Realtime publication
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['contact_submissions','audit_logs','user_permissions','user_roles','profiles','page_views']
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;