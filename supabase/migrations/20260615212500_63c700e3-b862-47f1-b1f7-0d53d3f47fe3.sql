
-- Admin notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,                -- 'scan_finding' | 'blacklist' | 'security_event'
  severity text NOT NULL DEFAULT 'medium', -- info|low|medium|high|critical
  title text NOT NULL,
  message text,
  link text,                          -- in-app route, e.g. /admin/security
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read notifications"
  ON public.admin_notifications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notifications"
  ON public.admin_notifications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert notifications"
  ON public.admin_notifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread
  ON public.admin_notifications (created_at DESC) WHERE read_at IS NULL;

-- Trigger: notify admins when an IP is auto-blacklisted
CREATE OR REPLACE FUNCTION public.notify_admin_on_blacklist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, severity, title, message, link, metadata)
  VALUES (
    'blacklist',
    COALESCE(NEW.severity, 'high'),
    CASE WHEN NEW.auto THEN 'IP auto-blacklisted' ELSE 'IP blacklisted' END,
    'IP ' || NEW.ip::text || ' — ' || COALESCE(NEW.reason, 'no reason'),
    '/admin/security',
    jsonb_build_object('ip', NEW.ip::text, 'attempts', NEW.attempts, 'route', NEW.last_route, 'auto', NEW.auto)
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_admin_on_blacklist() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_admin_blacklist ON public.ip_blacklist;
CREATE TRIGGER trg_notify_admin_blacklist
  AFTER INSERT ON public.ip_blacklist
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_blacklist();
