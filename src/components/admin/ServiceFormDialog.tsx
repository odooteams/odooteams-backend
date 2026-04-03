import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Search, Sparkles } from 'lucide-react';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ServiceFormDialogProps {
  service?: any;
  onSuccess: () => void;
}

const DEFAULT_KEYWORDS_EN = [
  'Odoo ERP', 'Odoo Implementation', 'Odoo Customization', 'Odoo Development',
  'ERP Solutions', 'Business Automation', 'Digital Transformation',
  'Web Development', 'Mobile App Development', 'E-Commerce Solutions',
  'CRM System', 'Accounting Software', 'Inventory Management',
  'HR Management', 'Project Management', 'POS System',
  'API Integration', 'Cloud Solutions', 'IT Consulting',
  'Software Development', 'Database Management', 'SEO Services',
  'Digital Marketing', 'UI/UX Design', 'Cybersecurity',
  'Data Analytics', 'Technical Support', 'System Migration',
];

const DEFAULT_KEYWORDS_AR = [
  'نظام أودو', 'تطبيق أودو', 'تخصيص أودو', 'تطوير أودو',
  'حلول تخطيط موارد المؤسسات', 'أتمتة الأعمال', 'التحول الرقمي',
  'تطوير المواقع', 'تطوير تطبيقات الجوال', 'حلول التجارة الإلكترونية',
  'نظام إدارة العملاء', 'برنامج المحاسبة', 'إدارة المخزون',
  'إدارة الموارد البشرية', 'إدارة المشاريع', 'نظام نقاط البيع',
  'تكامل واجهة برمجة التطبيقات', 'حلول سحابية', 'استشارات تقنية',
  'تطوير البرمجيات', 'إدارة قواعد البيانات', 'خدمات تحسين محركات البحث',
  'التسويق الرقمي', 'تصميم واجهات المستخدم', 'الأمن السيبراني',
  'تحليل البيانات', 'الدعم الفني', 'ترحيل الأنظمة',
];

const SEO_TEMPLATES = [
  {
    name: 'Odoo Service',
    title_en: '{service_name} - Professional Odoo Solutions | Your Company',
    title_ar: '{service_name} - حلول أودو احترافية | شركتك',
    desc_en: 'Get expert {service_name} services. We provide professional Odoo ERP solutions including implementation, customization, and support. Contact us for a free consultation.',
    desc_ar: 'احصل على خدمات {service_name} الاحترافية. نقدم حلول أودو المتكاملة بما في ذلك التطبيق والتخصيص والدعم الفني. تواصل معنا للحصول على استشارة مجانية.',
    keywords_en: 'Odoo, ERP, {service_name}, business solutions, implementation',
    keywords_ar: 'أودو, تخطيط موارد المؤسسات, {service_name}, حلول الأعمال, تطبيق',
  },
  {
    name: 'Web Development',
    title_en: '{service_name} - Custom Web Development Services | Your Company',
    title_ar: '{service_name} - خدمات تطوير المواقع المخصصة | شركتك',
    desc_en: 'Professional {service_name} services. We build responsive, high-performance websites and web applications using modern technologies. Get your free quote today.',
    desc_ar: 'خدمات {service_name} الاحترافية. نبني مواقع وتطبيقات ويب متجاوبة وعالية الأداء باستخدام أحدث التقنيات. احصل على عرض أسعار مجاني اليوم.',
    keywords_en: 'web development, responsive design, {service_name}, React, modern websites',
    keywords_ar: 'تطوير المواقع, تصميم متجاوب, {service_name}, ريأكت, مواقع حديثة',
  },
  {
    name: 'Digital Marketing',
    title_en: '{service_name} - Digital Marketing & SEO | Your Company',
    title_ar: '{service_name} - التسويق الرقمي وتحسين محركات البحث | شركتك',
    desc_en: 'Boost your online presence with our {service_name} services. Expert SEO, social media marketing, and digital advertising to grow your business.',
    desc_ar: 'عزز تواجدك الرقمي مع خدمات {service_name}. خبراء في تحسين محركات البحث والتسويق عبر وسائل التواصل الاجتماعي والإعلانات الرقمية لتنمية أعمالك.',
    keywords_en: 'digital marketing, SEO, social media, {service_name}, online advertising',
    keywords_ar: 'التسويق الرقمي, تحسين محركات البحث, وسائل التواصل, {service_name}, إعلانات إلكترونية',
  },
  {
    name: 'IT Consulting',
    title_en: '{service_name} - Expert IT Consulting Services | Your Company',
    title_ar: '{service_name} - خدمات الاستشارات التقنية المتخصصة | شركتك',
    desc_en: 'Transform your business with our {service_name} consulting services. Expert guidance on IT strategy, system architecture, and digital transformation.',
    desc_ar: 'حوّل أعمالك مع خدمات {service_name} الاستشارية. إرشاد متخصص في استراتيجية تكنولوجيا المعلومات وهندسة الأنظمة والتحول الرقمي.',
    keywords_en: 'IT consulting, technology strategy, {service_name}, digital transformation, system architecture',
    keywords_ar: 'استشارات تقنية, استراتيجية تكنولوجيا المعلومات, {service_name}, التحول الرقمي, هندسة الأنظمة',
  },
  {
    name: 'Mobile App',
    title_en: '{service_name} - Mobile App Development | Your Company',
    title_ar: '{service_name} - تطوير تطبيقات الجوال | شركتك',
    desc_en: 'Build powerful mobile applications with our {service_name} services. iOS, Android, and cross-platform development with modern frameworks.',
    desc_ar: 'ابنِ تطبيقات جوال قوية مع خدمات {service_name}. تطوير لأنظمة iOS وAndroid والمنصات المتعددة بأحدث الأطر البرمجية.',
    keywords_en: 'mobile app development, iOS, Android, {service_name}, cross-platform, Flutter, React Native',
    keywords_ar: 'تطوير تطبيقات الجوال, آي أو إس, أندرويد, {service_name}, فلاتر, ريأكت نيتيف',
  },
];

export function ServiceFormDialog({ service, onSuccess }: ServiceFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: service?.title_en || '',
    title_ar: service?.title_ar || '',
    category_en: service?.category_en || '',
    category_ar: service?.category_ar || '',
    details_en: service?.details_en || '',
    details_ar: service?.details_ar || '',
    processing_steps_en: service?.processing_steps_en || '',
    processing_steps_ar: service?.processing_steps_ar || '',
    image: service?.image || '',
    price: service?.price || '',
    duration: service?.duration || '',
    keywords: service?.keywords?.join(', ') || '',
    is_active: service?.is_active ?? true,
    is_featured: service?.is_featured ?? false,
    seo_title_en: service?.seo_title_en || '',
    seo_title_ar: service?.seo_title_ar || '',
    seo_description_en: service?.seo_description_en || '',
    seo_description_ar: service?.seo_description_ar || '',
    seo_keywords_en: service?.seo_keywords_en || '',
    seo_keywords_ar: service?.seo_keywords_ar || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      };
      
      if (service) {
        await contentManagement.updateService(service.id, submitData);
        toast.success('Service updated successfully');
      } else {
        await contentManagement.createService(submitData);
        toast.success('Service created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = (keyword: string) => {
    const current = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    if (!current.includes(keyword)) {
      const updated = [...current, keyword].join(', ');
      setFormData({ ...formData, keywords: updated });
    }
  };

  const applySeoTemplate = (templateIndex: string) => {
    const template = SEO_TEMPLATES[parseInt(templateIndex)];
    if (!template) return;
    const serviceName = formData.title_en || 'Service';
    const serviceNameAr = formData.title_ar || 'الخدمة';
    setFormData({
      ...formData,
      seo_title_en: template.title_en.replace(/{service_name}/g, serviceName),
      seo_title_ar: template.title_ar.replace(/{service_name}/g, serviceNameAr),
      seo_description_en: template.desc_en.replace(/{service_name}/g, serviceName),
      seo_description_ar: template.desc_ar.replace(/{service_name}/g, serviceNameAr),
      seo_keywords_en: template.keywords_en.replace(/{service_name}/g, serviceName),
      seo_keywords_ar: template.keywords_ar.replace(/{service_name}/g, serviceNameAr),
    });
    toast.success('SEO template applied!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {service ? (
          <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" />Add Service</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'Create Service'}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-1">
              <Search className="h-3 w-3" /> SEO
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title_en">Title (English)</Label>
                  <Input id="title_en" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="title_ar">Title (Arabic)</Label>
                  <Input id="title_ar" value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_en">Category (English)</Label>
                  <Input id="category_en" value={formData.category_en} onChange={(e) => setFormData({ ...formData, category_en: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="category_ar">Category (Arabic)</Label>
                  <Input id="category_ar" value={formData.category_ar} onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })} required />
                </div>
              </div>

              <div>
                <Label htmlFor="details_en">Details (English)</Label>
                <Textarea id="details_en" value={formData.details_en} onChange={(e) => setFormData({ ...formData, details_en: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="details_ar">Details (Arabic)</Label>
                <Textarea id="details_ar" value={formData.details_ar} onChange={(e) => setFormData({ ...formData, details_ar: e.target.value })} required />
              </div>

              <div>
                <Label htmlFor="processing_steps_en">Processing Steps (English)</Label>
                <Textarea id="processing_steps_en" value={formData.processing_steps_en} onChange={(e) => setFormData({ ...formData, processing_steps_en: e.target.value })} rows={3} />
              </div>
              <div>
                <Label htmlFor="processing_steps_ar">Processing Steps (Arabic)</Label>
                <Textarea id="processing_steps_ar" value={formData.processing_steps_ar} onChange={(e) => setFormData({ ...formData, processing_steps_ar: e.target.value })} rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4 mt-0">
              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="odoo, erp, consulting, أودو, تخطيط موارد المؤسسات"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Quick Add — English Keywords</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {DEFAULT_KEYWORDS_EN.map((kw) => (
                    <Button key={kw} type="button" variant="outline" size="sm" className="text-xs h-6 px-2" onClick={() => addKeyword(kw)}>
                      + {kw}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Quick Add — Arabic Keywords (كلمات مفتاحية)</Label>
                <div className="flex flex-wrap gap-1 mt-2" dir="rtl">
                  {DEFAULT_KEYWORDS_AR.map((kw) => (
                    <Button key={kw} type="button" variant="outline" size="sm" className="text-xs h-6 px-2" onClick={() => addKeyword(kw)}>
                      + {kw}
                    </Button>
                  ))}
                </div>
              </div>

              {formData.keywords && (
                <div>
                  <Label className="text-sm font-medium">Current Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.keywords.split(',').map(k => k.trim()).filter(Boolean).map((kw, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs cursor-pointer" onClick={() => {
                        const updated = formData.keywords.split(',').map(k => k.trim()).filter(k => k && k !== kw).join(', ');
                        setFormData({ ...formData, keywords: updated });
                      }}>
                        {kw} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-0">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">SEO Template</Label>
                </div>
                <p className="text-xs text-muted-foreground">Select a ready-made SEO template to auto-fill meta tags. Fill in the service title first for best results.</p>
                <Select onValueChange={applySeoTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SEO_TEMPLATES.map((t, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seo_title_en">Meta Title (English)</Label>
                  <Input id="seo_title_en" value={formData.seo_title_en} onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })} placeholder="Max 60 characters for best SEO" maxLength={70} />
                  <p className="text-xs text-muted-foreground mt-1">{formData.seo_title_en.length}/60 chars</p>
                </div>
                <div>
                  <Label htmlFor="seo_title_ar">Meta Title (Arabic)</Label>
                  <Input id="seo_title_ar" value={formData.seo_title_ar} onChange={(e) => setFormData({ ...formData, seo_title_ar: e.target.value })} placeholder="الحد الأقصى 60 حرفاً" maxLength={70} dir="rtl" />
                  <p className="text-xs text-muted-foreground mt-1">{formData.seo_title_ar.length}/60 chars</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seo_description_en">Meta Description (English)</Label>
                  <Textarea id="seo_description_en" value={formData.seo_description_en} onChange={(e) => setFormData({ ...formData, seo_description_en: e.target.value })} placeholder="Max 160 characters for best SEO" maxLength={170} rows={3} />
                  <p className="text-xs text-muted-foreground mt-1">{formData.seo_description_en.length}/160 chars</p>
                </div>
                <div>
                  <Label htmlFor="seo_description_ar">Meta Description (Arabic)</Label>
                  <Textarea id="seo_description_ar" value={formData.seo_description_ar} onChange={(e) => setFormData({ ...formData, seo_description_ar: e.target.value })} placeholder="الحد الأقصى 160 حرفاً" maxLength={170} rows={3} dir="rtl" />
                  <p className="text-xs text-muted-foreground mt-1">{formData.seo_description_ar.length}/160 chars</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seo_keywords_en">SEO Keywords (English)</Label>
                  <Textarea id="seo_keywords_en" value={formData.seo_keywords_en} onChange={(e) => setFormData({ ...formData, seo_keywords_en: e.target.value })} placeholder="keyword1, keyword2, keyword3" rows={2} />
                </div>
                <div>
                  <Label htmlFor="seo_keywords_ar">SEO Keywords (Arabic)</Label>
                  <Textarea id="seo_keywords_ar" value={formData.seo_keywords_ar} onChange={(e) => setFormData({ ...formData, seo_keywords_ar: e.target.value })} placeholder="كلمة1, كلمة2, كلمة3" rows={2} dir="rtl" />
                </div>
              </div>

              {/* SEO Preview */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <Label className="text-sm font-semibold text-primary">Google Preview</Label>
                <div className="space-y-1">
                  <p className="text-lg text-blue-600 font-medium truncate">
                    {formData.seo_title_en || formData.title_en || 'Service Title'}
                  </p>
                  <p className="text-sm text-green-700 truncate">
                    yoursite.com/services/{(formData.title_en || 'service').toLowerCase().replace(/\s+/g, '-')}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.seo_description_en || formData.details_en?.substring(0, 160) || 'Service description will appear here...'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : service ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
