DROP POLICY IF EXISTS "Anyone can report events" ON public.security_events;
CREATE POLICY "Authenticated users can report events"
  ON public.security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());