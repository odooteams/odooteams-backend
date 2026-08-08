
CREATE TABLE public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  page_path text NOT NULL,
  title_en text,
  title_ar text,
  description_en text,
  description_ar text,
  keywords_en text,
  keywords_ar text,
  og_image text,
  robots text DEFAULT 'index, follow',
  canonical_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page SEO viewable by everyone"
  ON public.page_seo FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert page SEO"
  ON public.page_seo FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update page SEO"
  ON public.page_seo FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page SEO"
  ON public.page_seo FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_page_seo_updated_at
  BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.page_seo (page_key, page_path, title_en, title_ar, description_en, description_ar) VALUES
  ('home', '/', 'OdooTeams - Professional Odoo ERP Implementation Services', 'OdooTeams - خدمات تنفيذ نظام Odoo ERP الاحترافية', 'Transform your business with expert Odoo ERP implementation, customization, training and development services worldwide.', 'حوّل أعمالك مع خدمات تنفيذ Odoo ERP الاحترافية والتخصيص والتدريب والتطوير.'),
  ('about', '/about', 'About OdooTeams', 'عن OdooTeams', 'Learn about OdooTeams and our mission to deliver world-class Odoo ERP solutions.', 'تعرف على OdooTeams ومهمتنا في تقديم حلول Odoo ERP عالمية المستوى.'),
  ('services', '/services', 'Odoo Services - Professional ERP Implementation', 'خدمات Odoo - تنفيذ ERP احترافي', 'Explore our comprehensive Odoo ERP services.', 'اكتشف خدمات Odoo ERP الشاملة.'),
  ('projects', '/projects', 'Odoo Projects Portfolio', 'معرض مشاريع Odoo', 'View our successful Odoo project implementations.', 'شاهد تنفيذات مشاريع Odoo الناجحة.'),
  ('contact', '/contact', 'Contact OdooTeams', 'تواصل مع OdooTeams', 'Get in touch with our Odoo experts.', 'تواصل مع خبراء Odoo لدينا.'),
  ('faqs', '/faqs', 'Frequently Asked Questions', 'الأسئلة الشائعة', 'Find answers to common questions about Odoo ERP.', 'إجابات على الأسئلة الشائعة حول Odoo ERP.'),
  ('learn-odoo', '/learn-odoo', 'Learn Odoo - Resources & Guides', 'تعلم Odoo - موارد وأدلة', 'Free resources and guides to learn Odoo ERP.', 'موارد وأدلة مجانية لتعلم Odoo ERP.');
