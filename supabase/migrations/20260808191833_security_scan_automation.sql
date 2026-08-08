-- Insert default SMTP settings and Security Scan Automation settings
INSERT INTO public.site_settings (setting_key, setting_type, setting_value)
VALUES
  ('smtp_settings', 'email', '{"host":"smtp.hostinger.com","port":"465","secure":true,"user":"","password":"","fromEmail":"info@odooteams.com"}'),
  ('security_scan_automation', 'security', '{"enabled":false,"emails":"info@odooteams.com"}')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable pg_cron and pg_net extensions if not already enabled (Supabase enables them by default)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Note: The cron job requires the edge function URL and service role key. 
-- In Supabase, you can set this up via the Dashboard (Edge Functions -> Scheduled Functions).
-- Alternatively, if deploying locally or via CLI, you can uncomment and adjust the following:

/*
SELECT cron.schedule(
  'invoke-security-scan-daily',
  '0 0 * * *', -- Every day at midnight UTC
  $$
    SELECT net.http_post(
      url := 'https://' || current_setting('request.jwt.claim.iss', true) || '/functions/v1/security-scan',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_OR_SERVICE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
*/
