import { learnResourcesQueries } from './supabase/queries';

export interface LearnResource {
  id: string;
  slug?: string;
  category_en: string;
  category_ar: string;
  main_header_en: string;
  main_header_ar: string;
  title_en: string;
  title_ar: string;
  contents_en: string;
  contents_ar: string;
  image: string | null;
  author_en: string | null;
  author_ar: string | null;
  published_date: string | null;
  download_url: string | null;
}

export function getResourceSlug(resource: { id?: string; title_en?: string; slug?: string }): string {
  if (resource.slug) return resource.slug;
  if (resource.title_en) {
    const s = resource.title_en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (s) return s;
  }
  return resource.id || '';
}

export const CURATED_OPEN_SOURCE_PROJECTS: LearnResource[] = [
  {
    id: 'zatca-phase2-fatoora-odoo',
    category_en: 'Accounting & Finance',
    category_ar: 'المحاسبة والمالية',
    main_header_en: 'ZATCA Compliance, Phase 2 Cryptographic Stamp, XML Invoice Generation, API Integration, Production Deployment',
    main_header_ar: 'مطابقة الزكاة والضريبة, الختم الرقمي للمرحلة الثانية, إنشاء فواتير XML, الربط البرمجي, النشر في بيئة الإنتاج',
    title_en: 'Odoo Saudi ZATCA E-Invoicing Integration (Phase 2)',
    title_ar: 'تكامل الفاتورة الإلكترونية هيئة الزكاة والضريبة (المرحلة الثانية)',
    contents_en: 'Comprehensive open-source Odoo module for seamless compliance with Saudi Arabia ZATCA (Fatoora) Phase 2 regulations. Features automated cryptographic stamp generation, ECDSA secp256k1 signing, SHA-256 invoice hashing, and real-time clearance and reporting API communication. Includes full UBL 2.1 XML generation for B2B standard and B2C simplified tax invoices.',
    contents_ar: 'موديول أودو متكامل ومفتوح المصدر للربط والتكامل التام مع متطلبات المرحلة الثانية لهيئة الزكاة والضريبة والجمارك (فاتورة) في المملكة العربية السعودية. يدعم التوقيع الرقمي المشفر ECDSA، وحساب التجزئة SHA-256، والربط اللحظي لإصدار واعتماد الفواتير الضريبية القياسية والمبسطة بصيغة UBL 2.1 XML.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800',
    author_en: 'OdooTeams Engineering',
    author_ar: 'فريق هندسة أودوتيمز',
    published_date: '2025-01-15',
    download_url: 'https://github.com/odoo/odoo',
  },
  {
    id: 'whatsapp-cloud-automation-module',
    category_en: 'Sales & CRM',
    category_ar: 'المبيعات وإدارة علاقات العملاء',
    main_header_en: 'Meta Cloud API, Automated Order Notifications, Chatbot Triggers, Multi-agent Inbox, Template Approvals',
    main_header_ar: 'واجهة ميتا السحابية, إشعارات الطلبات التلقائية, روبوت المحادثة, صندوق الوارد متعدد الوكلاء, اعتماد قوالب الرسائل',
    title_en: 'WhatsApp Business Cloud API Automated CRM & Messaging',
    title_ar: 'أتمتة رسائل واتساب للأعمال عبر Meta Cloud API ونظام إدارة العملاء',
    contents_en: 'Open source integration connecting Odoo CRM, Sales, and Invoicing directly with Meta Official WhatsApp Cloud API. Automatically dispatch payment reminders, sales quotes, shipping tracking links, and interactive buttons directly to customer WhatsApp numbers with zero per-message broker markups. Features webhook listeners and multi-agent live chat.',
    contents_ar: 'حل مفتوح المصدر يربط نظام أودو مباشرة مع الواجهة البرمجية الرسمية لواتساب للأعمال من ميتا. يتيح إرسال إشعارات الفواتير، عروض الأسعار، وتحديثات الشحن التلقائية، مع دعم الأزرار التفاعلية ومتابعة المحادثات داخل أودو دون وسيط طرف ثالث.',
    image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=800',
    author_en: 'Ahmad Faizan',
    author_ar: 'أحمد فايزان',
    published_date: '2025-02-01',
    download_url: 'https://github.com/OCA/social',
  },
  {
    id: 'smart-barcode-warehouse-scanner',
    category_en: 'Inventory & Supply Chain',
    category_ar: 'المخزون وسلسلة الإمداد',
    main_header_en: 'Mobile Barcode Scanner, Multi-Warehouse Transfers, Stock Auditing, Serial & Lot Tracking, Offline Scanning',
    main_header_ar: 'قارئ الباركود للجوال, التحويل بين المستودعات, جرد المخزون, تتبع الدفعات والأرقام التسلسلية, المسح دون اتصال',
    title_en: 'Smart Mobile Barcode & Multi-Warehouse Scanner',
    title_ar: 'نظام قارئ الباركود الذكي وتتبع المخزون والمستودعات المتعددة',
    contents_en: 'High-speed Progressive Web App and Odoo native interface for warehouse inventory management. Optimized for mobile cameras and industrial Zebra/Honeywell barcode scanners. Handles picking, packing, internal transfers, receipt validation, and physical inventory auditing with real-time stock reconciliation.',
    contents_ar: 'تطبيق ويب تقدمي وواجهة متطورة لإدارة المستودعات ومسح الباركود بسرعة فائقة عبر كاميرا الهاتف أو أجهزة المسح الصناعية (Zebra و Honeywell). يدعم عمليات الاستلام، الصرف، التحويل الداخلي، والجرد الدوري للمخزون بدقة عالية.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800',
    author_en: 'OdooTeams Tech',
    author_ar: 'فريق أودوتيمز التقني',
    published_date: '2025-02-18',
    download_url: 'https://github.com/OCA/stock-logistics-warehouse',
  },
  {
    id: 'gcc-wps-payroll-hr-module',
    category_en: 'HR & Payroll',
    category_ar: 'الموارد البشرية والرواتب',
    main_header_en: 'WPS SIF File Export, GOSI Calculation, End of Service Gratuity, Leave & Attendance Sync, Saudi Labor Law',
    main_header_ar: 'تصدير ملفات حماية الأجور, حساب التأمينات الاجتماعية, مكافأة نهاية الخدمة, مزامنة الإجازات والبصمة, نظام العمل السعودي',
    title_en: 'GCC HR & Automated Payroll with WPS File Generator',
    title_ar: 'نظام الموارد البشرية والرواتب المعتمد لحماية الأجور ونهاية الخدمة',
    contents_en: 'Open source localized payroll engine tailored for Gulf and Saudi Arabia business compliance. Generates valid Wage Protection System (WPS / SIF) text files for Saudi banks (Al Rajhi, SNB, Riyad Bank, etc.), calculates GOSI contributions automatically, and computes End of Service benefits in strict adherence to the Saudi Labor Law.',
    contents_ar: 'محرك رواتب مفتوح المصدر مخصص لقوانين العمل في المملكة ودول الخليج. يقوم بتوليد ملفات نظام حماية الأجور (WPS / SIF) المعتمدة لدى جميع البنوك السعودية، وحساب استقطاعات التأمينات الاجتماعية تلقائياً، واحتساب مكافأة نهاية الخدمة بدقة وفق نظام العمل.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800',
    author_en: 'HR Solutions Guild',
    author_ar: 'فريق حلول الموارد البشرية',
    published_date: '2025-03-01',
    download_url: 'https://github.com/OCA/payroll',
  },
  {
    id: 'restaurant-pos-kitchen-display-system',
    category_en: 'Point of Sale (POS)',
    category_ar: 'نقاط البيع (POS)',
    main_header_en: 'Kitchen Display Screen (KDS), Table Map Management, Split Bills, Order Modifiers, Thermal Printing',
    main_header_ar: 'شاشة المطبخ KDS, إدارة مخطط الطاولات, تقسيم الفواتير, خيارات وإضافات الطلب, الطابعات الحرارية',
    title_en: 'Interactive Restaurant & Cafe Kitchen Display System (KDS)',
    title_ar: 'شاشة المطبخ التفاعلية (KDS) لنقاط بيع المطاعم والكافيهات',
    contents_en: 'Real-time kitchen order management display for Odoo Point of Sale. Live web sockets broadcast orders instantly from waitstaff tablets to chefs screens with color-coded preparation timers, order modifiers, station routing, and one-tap bump bar actions. Drastically reduces kitchen errors and preparation delays.',
    contents_ar: 'شاشة عرض تفاعلية لإدارة طلبات المطبخ في الوقت الفعلي لنقاط بيع أودو. ترسل الطلبات فورياً من أجهزة النوادل إلى شاشات الطهاة مع مؤقتات لونية لتنبيه وقت التحضير، تقسيم الطلبات حسب الأقسام، وتحديث حالة الطلب بلمسة واحدة.',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800',
    author_en: 'POS Modern Systems',
    author_ar: 'أنظمة نقاط البيع الحديثة',
    published_date: '2025-03-10',
    download_url: 'https://github.com/OCA/pos',
  },
  {
    id: 'mideast-payment-gateway-engine',
    category_en: 'E-Commerce & Website',
    category_ar: 'المتجر الإلكتروني والموقع',
    main_header_en: 'PayTabs & Moyasar Integration, Apple Pay Direct Checkout, Webhook Processing, Tokenized Subscriptions',
    main_header_ar: 'تكامل بيتابس وميسر, الدفع السريع عبر Apple Pay, معالجة Webhooks اللحظية, الاشتراكات المتكررة',
    title_en: 'Omnichannel Payment Gateway: PayTabs, Moyasar & Apple Pay',
    title_ar: 'بوابة الدفع الإلكتروني الشاملة: بيتابس، ميسر، و Apple Pay لأودو',
    contents_en: 'Universal e-commerce payment connector for Odoo 16, 17, and 18. Supports leading payment providers across Saudi Arabia and the Middle East including Moyasar, PayTabs, HyperPay, and Stripe. Provides seamless native 3D Secure verification, one-click Apple Pay checkout, and automated payment status webhooks.',
    contents_ar: 'بوابة دفع إلكتروني موحدة ومفتوحة المصدر لإصدارات أودو 16 و 17 و 18. تدعم كبرى بوابات الدفع في المملكة والشرق الأوسط مثل ميسر وبيتابس وهايبرباي وStripe مع دعم التحقق الآمن 3D Secure والدفع بلمسة واحدة عبر Apple Pay.',
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=800',
    author_en: 'FinTech Odoo Guild',
    author_ar: 'فريق التكنولوجيا المالية',
    published_date: '2025-03-20',
    download_url: 'https://github.com/OCA/e-commerce',
  },
  {
    id: 'b2b-customer-portal-quotation-builder',
    category_en: 'Custom Apps & Addons',
    category_ar: 'تطبيقات وإضافات مخصصة',
    main_header_en: 'B2B Wholesale Portal, Dynamic Price Lists, Instant RFQ Submissions, PDF Quotations, Digital Signature',
    main_header_ar: 'بوابة عملاء الجملة B2B, قوائم الأسعار المخصصة, طلب عروض الأسعار الفوري, عروض PDF تفاعلية, التوقيع الرقمي',
    title_en: 'B2B Wholesale Self-Service Portal & Instant Quotation Builder',
    title_ar: 'بوابة عملاء الجملة B2B وبناء عروض الأسعار التفاعلية الفورية',
    contents_en: 'Dedicated client portal empowering wholesale and B2B customers to browse custom tiered catalog prices, construct multi-item requests for quotation (RFQs), upload bulk CSV orders, track credit limits, and sign sales agreements electronically without calling customer service.',
    contents_ar: 'بوابة عملاء متطورة تتيح لعملاء الجملة والشركات تصفح كتالوج المنتجات بأسعارهم التعاقدية الخاصة، وتقديم طلبات عروض الأسعار بصورة مباشرة، وتتبع رصيد الائتمان، وتوقيع الاتفاقيات إلكترونياً مما يسرع دورة المبيعات.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800',
    author_en: 'OdooTeams Architects',
    author_ar: 'معماريو أودوتيمز',
    published_date: '2025-04-05',
    download_url: 'https://github.com/OCA/sale-workflow',
  },
  {
    id: 'ai-smart-assistant-odoo-copilot',
    category_en: 'Tools & Utilities',
    category_ar: 'أدوات ومساعدات برمجية',
    main_header_en: 'OpenAI GPT-4o Integration, Automatic Product Descriptions, Helpdesk Ticket Summaries, Natural Language SQL',
    main_header_ar: 'التكامل مع نماذج الذكاء الاصطناعي GPT-4o, كتابة وصف المنتجات آلياً, تلخيص تذاكر الدعم الفني, الاستعلام باللغة الطبيعية',
    title_en: 'AI Copilot & Smart Assistant for Odoo ERP Operations',
    title_ar: 'مساعد الذكاء الاصطناعي الذكي لعمليات الدعم والكتالوج في أودو',
    contents_en: 'Embed cutting-edge AI directly within Odoo ERP workflows. Features one-click multilingual SEO product description generation, customer support ticket sentiment analysis and resolution drafting, automated email replies, and natural language business report queries.',
    contents_ar: 'دمج تقنيات الذكاء الاصطناعي الحديثة مباشرة داخل بيئة أودو. يوفر كتابة أوصاف تسويقية احترافية للمنتجات باللغتين العربية والإنجليزية بضغطة زر، وتلخيص تذاكر الدعم الفني، واقتراح الردود الذكية للعملاء تلقائياً.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800',
    author_en: 'AI Innovation Lab',
    author_ar: 'مختبر ابتكارات الذكاء الاصطناعي',
    published_date: '2025-04-18',
    download_url: 'https://github.com/OCA/connector-telephony',
  }
];

export async function fetchLearnResources(): Promise<LearnResource[]> {
  try {
    const data = await learnResourcesQueries.getAll();
    
    // Map database fields to expected format
    const dbResources: LearnResource[] = (data || []).map((item) => ({
      id: item.id,
      slug: getResourceSlug(item),
      category_en: item.category_en,
      category_ar: item.category_ar,
      main_header_en: item.main_header_en,
      main_header_ar: item.main_header_ar,
      title_en: item.title_en,
      title_ar: item.title_ar,
      contents_en: item.contents_en,
      contents_ar: item.contents_ar,
      image: item.image,
      author_en: item.author_en,
      author_ar: item.author_ar,
      published_date: item.published_date,
      download_url: item.download_url,
    }));

    // Merge database resources with curated open-source projects,
    // avoiding duplicates by ID or title
    const combined: LearnResource[] = [...dbResources];
    for (const curated of CURATED_OPEN_SOURCE_PROJECTS) {
      const curatedWithSlug: LearnResource = {
        ...curated,
        slug: getResourceSlug(curated),
      };
      const exists = combined.some(
        item => item.id === curated.id || item.title_en.toLowerCase().trim() === curated.title_en.toLowerCase().trim()
      );
      if (!exists) {
        combined.push(curatedWithSlug);
      }
    }

    return combined;
  } catch (error) {
    console.error('Error fetching learn resources from DB, using curated projects:', error);
    return CURATED_OPEN_SOURCE_PROJECTS;
  }
}
