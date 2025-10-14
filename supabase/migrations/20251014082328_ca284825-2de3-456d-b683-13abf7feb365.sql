-- Create blogs table (can also use existing learn_resources if preferred)
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_ar TEXT,
  image TEXT,
  author_id UUID REFERENCES auth.users(id),
  category_en TEXT,
  category_ar TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID
);

-- Create policies table
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  policy_type TEXT NOT NULL, -- 'privacy', 'terms', 'refund', etc.
  version TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID
);

-- Create site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL, -- 'company_info', 'contact', 'social_media', 'seo', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blogs
CREATE POLICY "Published blogs viewable by everyone" ON public.blogs
  FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blogs" ON public.blogs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blogs" ON public.blogs
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blogs" ON public.blogs
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for policies
CREATE POLICY "Active policies viewable by everyone" ON public.policies
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert policies" ON public.policies
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update policies" ON public.policies
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete policies" ON public.policies
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for site_settings
CREATE POLICY "Settings viewable by everyone" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
  ('company_info', '{"name_en": "", "name_ar": "", "description_en": "", "description_ar": "", "founded_year": null}', 'company_info'),
  ('contact_info', '{"email": "", "phone": "", "address_en": "", "address_ar": "", "working_hours_en": "", "working_hours_ar": ""}', 'contact'),
  ('social_media', '{"facebook": "", "twitter": "", "linkedin": "", "instagram": "", "youtube": "", "whatsapp": ""}', 'social_media')
ON CONFLICT (setting_key) DO NOTHING;