-- Insert default testimonials
INSERT INTO public.testimonials (client_name_en, client_name_ar, position_en, position_ar, company_en, company_ar, testimonial_en, testimonial_ar, rating, is_active, is_featured)
VALUES 
  ('Ahmed Hassan', 'أحمد حسن', 'CEO', 'الرئيس التنفيذي', 'Tech Solutions', 'حلول تقنية', 'Excellent Odoo implementation service. The team was professional and delivered on time.', 'خدمة تنفيذ أودو ممتازة. كان الفريق محترفاً وسلم في الوقت المحدد.', 5, true, true),
  ('Sara Al-Rashid', 'سارة الراشد', 'Operations Manager', 'مدير العمليات', 'Global Trade Co', 'شركة التجارة العالمية', 'They transformed our business processes with their ERP expertise. Highly recommended!', 'لقد حولوا عملياتنا التجارية بخبرتهم في نظام ERP. موصى به بشدة!', 5, true, true),
  ('Mohammed Al-Faisal', 'محمد الفيصل', 'IT Director', 'مدير تقنية المعلومات', 'Saudi Manufacturing', 'الصناعات السعودية', 'The customization they did for our manufacturing module exceeded our expectations.', 'التخصيص الذي قاموا به لوحدة التصنيع لدينا تجاوز توقعاتنا.', 5, true, true),
  ('Fatima Zahra', 'فاطمة الزهراء', 'Finance Director', 'مدير الشؤون المالية', 'Investment Group', 'مجموعة الاستثمار', 'Great support and training for our finance team. The Odoo accounting module works perfectly.', 'دعم وتدريب رائع لفريقنا المالي. وحدة المحاسبة في أودو تعمل بشكل مثالي.', 4, true, false),
  ('Khalid Omar', 'خالد عمر', 'Supply Chain Manager', 'مدير سلسلة التوريد', 'Logistics Plus', 'لوجستيكس بلس', 'The inventory management solution helped us reduce costs by 30%.', 'ساعدنا حل إدارة المخزون على تقليل التكاليف بنسبة 30%.', 5, true, false);

-- Insert default timeline events
INSERT INTO public.timeline_events (year, title_en, title_ar, description_en, description_ar, sort_order, is_active)
VALUES 
  (2018, 'Company Founded', 'تأسيس الشركة', 'Started our journey as an Odoo implementation partner with a vision to transform businesses.', 'بدأنا رحلتنا كشريك تنفيذ أودو برؤية لتحويل الأعمال.', 1, true),
  (2019, 'First Major Project', 'أول مشروع كبير', 'Successfully implemented Odoo ERP for a major manufacturing company with 500+ users.', 'نفذنا بنجاح نظام أودو ERP لشركة تصنيع كبرى مع أكثر من 500 مستخدم.', 2, true),
  (2020, 'Regional Expansion', 'التوسع الإقليمي', 'Expanded operations to serve clients across the GCC region with dedicated support teams.', 'وسعنا العمليات لخدمة العملاء في جميع أنحاء منطقة الخليج مع فرق دعم مخصصة.', 3, true),
  (2021, 'Official Odoo Partnership', 'شراكة أودو الرسمية', 'Became an official Odoo partner, gaining access to advanced training and resources.', 'أصبحنا شريكاً رسمياً لأودو، مما أتاح لنا الوصول إلى التدريب والموارد المتقدمة.', 4, true),
  (2022, '100+ Implementations', 'أكثر من 100 تنفيذ', 'Reached milestone of 100+ successful Odoo implementations across various industries.', 'وصلنا إلى إنجاز أكثر من 100 تنفيذ ناجح لأودو في مختلف الصناعات.', 5, true),
  (2023, 'Gold Partner Status', 'الشريك الذهبي', 'Achieved Odoo Gold Partner status for exceptional implementation and customer satisfaction.', 'حققنا مرتبة الشريك الذهبي لأودو للتنفيذ الاستثنائي ورضا العملاء.', 6, true),
  (2024, 'Innovation Lab Launch', 'إطلاق مختبر الابتكار', 'Launched our Innovation Lab to develop custom Odoo modules and AI-powered solutions.', 'أطلقنا مختبر الابتكار لتطوير وحدات أودو المخصصة والحلول المدعومة بالذكاء الاصطناعي.', 7, true);