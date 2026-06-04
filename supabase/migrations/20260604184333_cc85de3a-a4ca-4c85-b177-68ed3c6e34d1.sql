
CREATE TABLE public.security_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  target_url TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX security_scans_user_created_idx ON public.security_scans (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_scans TO authenticated;
GRANT ALL ON public.security_scans TO service_role;

ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own security scans"
  ON public.security_scans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert their own security scans"
  ON public.security_scans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update their own security scans"
  ON public.security_scans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete their own security scans"
  ON public.security_scans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));
