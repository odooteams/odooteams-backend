-- Seed realistic Open Source Odoo Projects and Modules
INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'Odoo Saudi ZATCA E-Invoicing Integration (Phase 2)',
  'تكامل الفاتورة الإلكترونية هيئة الزكاة والضريبة (المرحلة الثانية)',
  'Accounting & Finance',
  'المحاسبة والمالية',
  'ZATCA Compliance, Phase 2 Cryptographic Stamp, XML Invoice Generation, API Integration, Production Deployment',
  'مطابقة الزكاة والضريبة, الختم الرقمي للمرحلة الثانية, إنشاء فواتير XML, الربط البرمجي, النشر في بيئة الإنتاج',
  'Comprehensive open-source Odoo module for seamless compliance with Saudi Arabia ZATCA (Fatoora) Phase 2 regulations. Features automated cryptographic stamp generation, ECDSA secp256k1 signing, SHA-256 invoice hashing, and real-time clearance and reporting API communication. Includes full UBL 2.1 XML generation for B2B standard and B2C simplified tax invoices.',
  'موديول أودو متكامل ومفتوح المصدر للربط والتكامل التام مع متطلبات المرحلة الثانية لهيئة الزكاة والضريبة والجمارك (فاتورة) في المملكة العربية السعودية. يدعم التوقيع الرقمي المشفر ECDSA، وحساب التجزئة SHA-256، والربط اللحظي لإصدار واعتماد الفواتير الضريبية القياسية والمبسطة بصيغة UBL 2.1 XML.',
  'OdooTeams Engineering',
  'فريق هندسة أودوتيمز',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800',
  'https://github.com/odoo/odoo',
  '2025-01-15'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'Odoo Saudi ZATCA E-Invoicing Integration (Phase 2)'
);

INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'WhatsApp Business Cloud API Automated CRM & Messaging',
  'أتمتة رسائل واتساب للأعمال عبر Meta Cloud API ونظام إدارة العملاء',
  'Sales & CRM',
  'المبيعات وإدارة علاقات العملاء',
  'Meta Cloud API, Automated Order Notifications, Chatbot Triggers, Multi-agent Inbox, Template Approvals',
  'واجهة ميتا السحابية, إشعارات الطلبات التلقائية, روبوت المحادثة, صندوق الوارد متعدد الوكلاء, اعتماد قوالب الرسائل',
  'Open source integration connecting Odoo CRM, Sales, and Invoicing directly with Meta Official WhatsApp Cloud API. Automatically dispatch payment reminders, sales quotes, shipping tracking links, and interactive buttons directly to customer WhatsApp numbers with zero per-message broker markups. Features webhook listeners and multi-agent live chat.',
  'حل مفتوح المصدر يربط نظام أودو مباشرة مع الواجهة البرمجية الرسمية لواتساب للأعمال من ميتا. يتيح إرسال إشعارات الفواتير، عروض الأسعار، وتحديثات الشحن التلقائية، مع دعم الأزرار التفاعلية ومتابعة المحادثات داخل أودو دون وسيط طرف ثالث.',
  'Ahmad Faizan',
  'أحمد فايزان',
  'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=800',
  'https://github.com/OCA/social',
  '2025-02-01'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'WhatsApp Business Cloud API Automated CRM & Messaging'
);

INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'Smart Mobile Barcode & Multi-Warehouse Scanner',
  'نظام قارئ الباركود الذكي وتتبع المخزون والمستودعات المتعددة',
  'Inventory & Supply Chain',
  'المخزون وسلسلة الإمداد',
  'Mobile Barcode Scanner, Multi-Warehouse Transfers, Stock Auditing, Serial & Lot Tracking, Offline Scanning',
  'قارئ الباركود للجوال, التحويل بين المستودعات, جرد المخزون, تتبع الدفعات والأرقام التسلسلية, المسح دون اتصال',
  'High-speed Progressive Web App and Odoo native interface for warehouse inventory management. Optimized for mobile cameras and industrial Zebra/Honeywell barcode scanners. Handles picking, packing, internal transfers, receipt validation, and physical inventory auditing with real-time stock reconciliation.',
  'تطبيق ويب تقدمي وواجهة متطورة لإدارة المستودعات ومسح الباركود بسرعة فائقة عبر كاميرا الهاتف أو أجهزة المسح الصناعية (Zebra و Honeywell). يدعم عمليات الاستلام، الصرف، التحويل الداخلي، والجرد الدوري للمخزون بدقة عالية.',
  'OdooTeams Tech',
  'فريق أودوتيمز التقني',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800',
  'https://github.com/OCA/stock-logistics-warehouse',
  '2025-02-18'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'Smart Mobile Barcode & Multi-Warehouse Scanner'
);

INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'GCC HR & Automated Payroll with WPS File Generator',
  'نظام الموارد البشرية والرواتب المعتمد لحماية الأجور ونهاية الخدمة',
  'HR & Payroll',
  'الموارد البشرية والرواتب',
  'WPS SIF File Export, GOSI Calculation, End of Service Gratuity, Leave & Attendance Sync, Saudi Labor Law',
  'تصدير ملفات حماية الأجور, حساب التأمينات الاجتماعية, مكافأة نهاية الخدمة, مزامنة الإجازات والبصمة, نظام العمل السعودي',
  'Open source localized payroll engine tailored for Gulf and Saudi Arabia business compliance. Generates valid Wage Protection System (WPS / SIF) text files for Saudi banks (Al Rajhi, SNB, Riyad Bank, etc.), calculates GOSI contributions automatically, and computes End of Service benefits in strict adherence to the Saudi Labor Law.',
  'محرك رواتب مفتوح المصدر مخصص لقوانين العمل في المملكة ودول الخليج. يقوم بتوليد ملفات نظام حماية الأجور (WPS / SIF) المعتمدة لدى جميع البنوك السعودية، وحساب استقطاعات التأمينات الاجتماعية تلقائياً، واحتساب مكافأة نهاية الخدمة بدقة وفق نظام العمل.',
  'HR Solutions Guild',
  'فريق حلول الموارد البشرية',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800',
  'https://github.com/OCA/payroll',
  '2025-03-01'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'GCC HR & Automated Payroll with WPS File Generator'
);

INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'Interactive Restaurant & Cafe Kitchen Display System (KDS)',
  'شاشة المطبخ التفاعلية (KDS) لنقاط بيع المطاعم والكافيهات',
  'Point of Sale (POS)',
  'نقاط البيع (POS)',
  'Kitchen Display Screen (KDS), Table Map Management, Split Bills, Order Modifiers, Thermal Printing',
  'شاشة المطبخ KDS, إدارة مخطط الطاولات, تقسيم الفواتير, خيارات وإضافات الطلب, الطابعات الحرارية',
  'Real-time kitchen order management display for Odoo Point of Sale. Live web sockets broadcast orders instantly from waitstaff tablets to chefs screens with color-coded preparation timers, order modifiers, station routing, and one-tap bump bar actions. Drastically reduces kitchen errors and preparation delays.',
  'شاشة عرض تفاعلية لإدارة طلبات المطبخ في الوقت الفعلي لنقاط بيع أودو. ترسل الطلبات فورياً من أجهزة النوادل إلى شاشات الطهاة مع مؤقتات لونية لتنبيه وقت التحضير، تقسيم الطلبات حسب الأقسام، وتحديث حالة الطلب بلمسة واحدة.',
  'POS Modern Systems',
  'أنظمة نقاط البيع الحديثة',
  'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800',
  'https://github.com/OCA/pos',
  '2025-03-10'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'Interactive Restaurant & Cafe Kitchen Display System (KDS)'
);

INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'Omnichannel Payment Gateway: PayTabs, Moyasar & Apple Pay',
  'بوابة الدفع الإلكتروني الشاملة: بيتابس، ميسر، و Apple Pay لأودو',
  'E-Commerce & Website',
  'المتجر الإلكتروني والموقع',
  'PayTabs & Moyasar Integration, Apple Pay Direct Checkout, Webhook Processing, Tokenized Subscriptions',
  'تكامل بيتابس وميسر, الدفع السريع عبر Apple Pay, معالجة Webhooks اللحظية, الاشتراكات المتكررة',
  'Universal e-commerce payment connector for Odoo 16, 17, and 18. Supports leading payment providers across Saudi Arabia and the Middle East including Moyasar, PayTabs, HyperPay, and Stripe. Provides seamless native 3D Secure verification, one-click Apple Pay checkout, and automated payment status webhooks.',
  'بوابة دفع إلكتروني موحدة ومفتوحة المصدر لإصدارات أودو 16 و 17 و 18. تدعم كبرى بوابات الدفع في المملكة والشرق الأوسط مثل ميسر وبيتابس وهايبرباي وStripe مع دعم التحقق الآمن 3D Secure والدفع بلمسة واحدة عبر Apple Pay.',
  'FinTech Odoo Guild',
  'فريق التكنولوجيا المالية',
  'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=800',
  'https://github.com/OCA/e-commerce',
  '2025-03-20'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'Omnichannel Payment Gateway: PayTabs, Moyasar & Apple Pay'
);

INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'B2B Wholesale Self-Service Portal & Instant Quotation Builder',
  'بوابة عملاء الجملة B2B وبناء عروض الأسعار التفاعلية الفورية',
  'Custom Apps & Addons',
  'تطبيقات وإضافات مخصصة',
  'B2B Wholesale Portal, Dynamic Price Lists, Instant RFQ Submissions, PDF Quotations, Digital Signature',
  'بوابة عملاء الجملة B2B, قوائم الأسعار المخصصة, طلب عروض الأسعار الفوري, عروض PDF تفاعلية, التوقيع الرقمي',
  'Dedicated client portal empowering wholesale and B2B customers to browse custom tiered catalog prices, construct multi-item requests for quotation (RFQs), upload bulk CSV orders, track credit limits, and sign sales agreements electronically without calling customer service.',
  'بوابة عملاء متطورة تتيح لعملاء الجملة والشركات تصفح كتالوج المنتجات بأسعارهم التعاقدية الخاصة، وتقديم طلبات عروض الأسعار بصورة مباشرة، وتتبع رصيد الائتمان، وتوقيع الاتفاقيات إلكترونياً مما يسرع دورة المبيعات.',
  'OdooTeams Architects',
  'معماريو أودوتيمز',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800',
  'https://github.com/OCA/sale-workflow',
  '2025-04-05'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'B2B Wholesale Self-Service Portal & Instant Quotation Builder'
);

INSERT INTO public.learn_resources (
  title_en, title_ar,
  category_en, category_ar,
  main_header_en, main_header_ar,
  contents_en, contents_ar,
  author_en, author_ar,
  image, download_url,
  published_date, is_active
)
SELECT 
  'AI Copilot & Smart Assistant for Odoo ERP Operations',
  'مساعد الذكاء الاصطناعي الذكي لعمليات الدعم والكتالوج في أودو',
  'Tools & Utilities',
  'أدوات ومساعدات برمجية',
  'OpenAI GPT-4o Integration, Automatic Product Descriptions, Helpdesk Ticket Summaries, Natural Language SQL',
  'التكامل مع نماذج الذكاء الاصطناعي GPT-4o, كتابة وصف المنتجات آلياً, تلخيص تذاكر الدعم الفني, الاستعلام باللغة الطبيعية',
  'Embed cutting-edge AI directly within Odoo ERP workflows. Features one-click multilingual SEO product description generation, customer support ticket sentiment analysis and resolution drafting, automated email replies, and natural language business report queries.',
  'دمج تقنيات الذكاء الاصطناعي الحديثة مباشرة داخل بيئة أودو. يوفر كتابة أوصاف تسويقية احترافية للمنتجات باللغتين العربية والإنجليزية بضغطة زر، وتلخيص تذاكر الدعم الفني، واقتراح الردود الذكية للعملاء تلقائياً.',
  'AI Innovation Lab',
  'مختبر ابتكارات الذكاء الاصطناعي',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800',
  'https://github.com/OCA/connector-telephony',
  '2025-04-18'::date,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.learn_resources WHERE title_en = 'AI Copilot & Smart Assistant for Odoo ERP Operations'
);
