
-- Rate limit / idempotency tracking table
CREATE TABLE IF NOT EXISTS public.submission_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  submission_type text NOT NULL,
  dedupe_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_srl_ip_type_time
  ON public.submission_rate_limits (ip_address, submission_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_srl_hash_time
  ON public.submission_rate_limits (dedupe_hash, created_at DESC);

ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limits"
  ON public.submission_rate_limits FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete rate limits"
  ON public.submission_rate_limits FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add dedupe column to contact submissions
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS dedupe_hash text;

CREATE INDEX IF NOT EXISTS idx_contact_dedupe_time
  ON public.contact_submissions (dedupe_hash, created_at DESC);
