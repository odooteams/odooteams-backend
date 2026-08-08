-- Create website_visitors table for detailed visitor tracking
CREATE TABLE public.website_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  device_type TEXT DEFAULT 'desktop',
  country TEXT,
  city TEXT,
  page_url TEXT NOT NULL,
  referrer_url TEXT,
  session_id TEXT,
  user_id UUID,
  visit_duration INTEGER DEFAULT 0,
  is_new_visitor BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_visitors ENABLE ROW LEVEL SECURITY;

-- Admins can view all visitors
CREATE POLICY "Admins can view all visitors"
ON public.website_visitors
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert visitor data with valid page_url
CREATE POLICY "Anyone can insert visitor data"
ON public.website_visitors
FOR INSERT
WITH CHECK (page_url IS NOT NULL AND page_url <> '');

-- Create indexes for performance
CREATE INDEX idx_visitors_created_at ON public.website_visitors(created_at);
CREATE INDEX idx_visitors_ip ON public.website_visitors(ip_address);
CREATE INDEX idx_visitors_session ON public.website_visitors(session_id);