
-- IP blacklist (auto + manual blocks)
CREATE TABLE public.ip_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'manual',
  attempts INT NOT NULL DEFAULT 1,
  auto BOOLEAN NOT NULL DEFAULT false,
  severity TEXT NOT NULL DEFAULT 'medium',
  last_route TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ip_blacklist TO authenticated;
GRANT ALL ON public.ip_blacklist TO service_role;
ALTER TABLE public.ip_blacklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage blacklist" ON public.ip_blacklist FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_ip_blacklist_updated BEFORE UPDATE ON public.ip_blacklist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ip_blacklist_ip ON public.ip_blacklist(ip);

-- IP whitelist (never blocked)
CREATE TABLE public.ip_whitelist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL UNIQUE,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ip_whitelist TO authenticated;
GRANT ALL ON public.ip_whitelist TO service_role;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage whitelist" ON public.ip_whitelist FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_ip_whitelist_updated BEFORE UPDATE ON public.ip_whitelist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security events log (attack attempts, fed by client/edge functions)
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT,
  user_id UUID,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  route TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.security_events TO authenticated;
GRANT SELECT, INSERT ON public.security_events TO anon;
GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report events" ON public.security_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read events" ON public.security_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete events" ON public.security_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_security_events_created ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_ip ON public.security_events(ip);

-- Auto-blacklist trigger: 5+ high/medium events from same IP in 10min -> blacklist
CREATE OR REPLACE FUNCTION public.auto_blacklist_ip()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count INT;
BEGIN
  IF NEW.ip IS NULL OR NEW.severity NOT IN ('medium','high','critical') THEN
    RETURN NEW;
  END IF;
  -- skip whitelisted
  IF EXISTS (SELECT 1 FROM public.ip_whitelist WHERE ip = NEW.ip) THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO v_count FROM public.security_events
    WHERE ip = NEW.ip AND created_at > now() - interval '10 minutes'
      AND severity IN ('medium','high','critical');
  IF v_count >= 5 THEN
    INSERT INTO public.ip_blacklist (ip, reason, attempts, auto, severity, last_route)
      VALUES (NEW.ip, 'Auto: ' || NEW.event_type, v_count, true,
        CASE WHEN NEW.severity = 'critical' THEN 'critical' ELSE 'high' END, NEW.route)
      ON CONFLICT (ip) DO UPDATE
        SET attempts = ip_blacklist.attempts + 1,
            last_route = EXCLUDED.last_route,
            updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_blacklist AFTER INSERT ON public.security_events
  FOR EACH ROW EXECUTE FUNCTION public.auto_blacklist_ip();
