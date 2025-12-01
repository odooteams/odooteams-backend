
-- Insert 3 default team members with bilingual content
INSERT INTO team_members (name_en, name_ar, position_en, position_ar, bio_en, bio_ar, email, linkedin_url, sort_order, is_active)
VALUES 
  (
    'Ahmed Hassan',
    'أحمد حسن',
    'CEO & Odoo Implementation Specialist',
    'المدير التنفيذي وأخصائي تنفيذ أودو',
    'With over 10 years of experience in ERP systems, Ahmed leads our team in delivering exceptional Odoo solutions to businesses across the region.',
    'مع خبرة تزيد عن 10 سنوات في أنظمة تخطيط موارد المؤسسات، يقود أحمد فريقنا في تقديم حلول أودو استثنائية للشركات في جميع أنحاء المنطقة.',
    'ahmed@example.com',
    'https://linkedin.com/in/ahmed-hassan',
    1,
    true
  ),
  (
    'Sarah Ahmed',
    'سارة أحمد',
    'Senior Odoo Developer',
    'مطورة أودو أول',
    'Sarah specializes in custom module development and system integration, bringing innovative solutions to complex business challenges.',
    'تتخصص سارة في تطوير الوحدات المخصصة وتكامل الأنظمة، وتقدم حلولاً مبتكرة للتحديات التجارية المعقدة.',
    'sarah@example.com',
    'https://linkedin.com/in/sarah-ahmed',
    2,
    true
  ),
  (
    'Mohamed Ali',
    'محمد علي',
    'Odoo Consultant & Trainer',
    'مستشار ومدرب أودو',
    'Mohamed helps clients optimize their Odoo implementations and provides comprehensive training to ensure successful adoption.',
    'يساعد محمد العملاء على تحسين تطبيقات أودو الخاصة بهم ويقدم تدريبًا شاملاً لضمان التبني الناجح.',
    'mohamed@example.com',
    'https://linkedin.com/in/mohamed-ali',
    3,
    true
  );
