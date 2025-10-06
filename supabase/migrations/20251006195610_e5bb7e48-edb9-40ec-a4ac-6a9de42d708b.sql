-- ============================================
-- ODOOTEAMS DATABASE SCHEMA
-- ============================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ============================================
-- USER MANAGEMENT TABLES
-- ============================================

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CONTENT TABLES
-- ============================================

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  category_en TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  details_en TEXT NOT NULL,
  details_ar TEXT NOT NULL,
  image TEXT,
  price DECIMAL(10,2),
  duration TEXT,
  keywords TEXT[],
  processing_steps_en TEXT,
  processing_steps_ar TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  category_en TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  client_name TEXT,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  processing_steps_en TEXT,
  processing_steps_ar TEXT,
  technologies TEXT[],
  images TEXT[],
  completion_date DATE,
  cost TEXT,
  project_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Learn resources table
CREATE TABLE public.learn_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_en TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  main_header_en TEXT NOT NULL,
  main_header_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  contents_en TEXT NOT NULL,
  contents_ar TEXT NOT NULL,
  image TEXT,
  author_en TEXT,
  author_ar TEXT,
  published_date DATE,
  download_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.learn_resources ENABLE ROW LEVEL SECURITY;

-- FAQs table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_en TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Chatbot responses table
CREATE TABLE public.chatbot_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  keywords TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.chatbot_responses ENABLE ROW LEVEL SECURITY;

-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  position_en TEXT NOT NULL,
  position_ar TEXT NOT NULL,
  bio_en TEXT,
  bio_ar TEXT,
  image TEXT,
  email TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Testimonials/Reviews table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name_en TEXT NOT NULL,
  client_name_ar TEXT NOT NULL,
  company_en TEXT,
  company_ar TEXT,
  position_en TEXT,
  position_ar TEXT,
  testimonial_en TEXT NOT NULL,
  testimonial_ar TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Timeline events table
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  image TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ANALYTICS & TRACKING TABLES
-- ============================================

-- Page views analytics
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- UPDATE TIMESTAMP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply update timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learn_resources_updated_at BEFORE UPDATE ON public.learn_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chatbot_responses_updated_at BEFORE UPDATE ON public.chatbot_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON public.timeline_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "User roles viewable by user themselves" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Services policies
CREATE POLICY "Active services viewable by everyone" ON public.services FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Projects policies
CREATE POLICY "Active projects viewable by everyone" ON public.projects FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Learn resources policies
CREATE POLICY "Active resources viewable by everyone" ON public.learn_resources FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert resources" ON public.learn_resources FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update resources" ON public.learn_resources FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete resources" ON public.learn_resources FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- FAQs policies
CREATE POLICY "Active FAQs viewable by everyone" ON public.faqs FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert FAQs" ON public.faqs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update FAQs" ON public.faqs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete FAQs" ON public.faqs FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Chatbot responses policies
CREATE POLICY "Active chatbot responses viewable by everyone" ON public.chatbot_responses FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert chatbot responses" ON public.chatbot_responses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update chatbot responses" ON public.chatbot_responses FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete chatbot responses" ON public.chatbot_responses FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Team members policies
CREATE POLICY "Active team members viewable by everyone" ON public.team_members FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert team members" ON public.team_members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete team members" ON public.team_members FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all submissions" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update submissions" ON public.contact_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete submissions" ON public.contact_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Testimonials policies
CREATE POLICY "Active testimonials viewable by everyone" ON public.testimonials FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Timeline events policies
CREATE POLICY "Active timeline events viewable by everyone" ON public.timeline_events FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert timeline events" ON public.timeline_events FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update timeline events" ON public.timeline_events FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete timeline events" ON public.timeline_events FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Page views policies
CREATE POLICY "Users can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON public.page_views FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_featured ON public.services(is_featured);
CREATE INDEX idx_services_category_en ON public.services(category_en);
CREATE INDEX idx_projects_active ON public.projects(is_active);
CREATE INDEX idx_projects_featured ON public.projects(is_featured);
CREATE INDEX idx_projects_category_en ON public.projects(category_en);
CREATE INDEX idx_learn_resources_active ON public.learn_resources(is_active);
CREATE INDEX idx_learn_resources_category_en ON public.learn_resources(category_en);
CREATE INDEX idx_faqs_category_en ON public.faqs(category_en);
CREATE INDEX idx_faqs_active ON public.faqs(is_active);
CREATE INDEX idx_chatbot_active ON public.chatbot_responses(is_active);
CREATE INDEX idx_team_members_active ON public.team_members(is_active);
CREATE INDEX idx_contact_status ON public.contact_submissions(status);
CREATE INDEX idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX idx_timeline_year ON public.timeline_events(year);
CREATE INDEX idx_page_views_created ON public.page_views(created_at);
CREATE INDEX idx_page_views_path ON public.page_views(page_path);