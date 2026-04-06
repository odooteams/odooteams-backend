import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from './RichTextEditor';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Sparkles, Search, X } from 'lucide-react';

interface BlogFormDialogProps {
  blog?: any;
  onSuccess: () => void;
}

const DEFAULT_TAGS_EN = [
  'Odoo', 'ERP', 'Web Development', 'Digital Transformation', 'Technology',
  'Business Solutions', 'E-Commerce', 'Cloud Computing', 'AI', 'Automation',
  'CRM', 'Accounting', 'HR Management', 'Inventory', 'POS',
  'Mobile Apps', 'SEO', 'Digital Marketing', 'Cybersecurity', 'Data Analytics',
];

const DEFAULT_TAGS_AR = [
  'أودو', 'نظام ERP', 'تطوير الويب', 'التحول الرقمي', 'التكنولوجيا',
  'حلول الأعمال', 'التجارة الإلكترونية', 'الحوسبة السحابية', 'الذكاء الاصطناعي', 'الأتمتة',
  'إدارة علاقات العملاء', 'المحاسبة', 'إدارة الموارد البشرية', 'المخزون', 'نقاط البيع',
  'تطبيقات الجوال', 'تحسين محركات البحث', 'التسويق الرقمي', 'الأمن السيبراني', 'تحليل البيانات',
];

const DEFAULT_KEYWORDS_EN = [
  'Odoo ERP', 'Odoo Implementation', 'Odoo Customization', 'ERP Solutions',
  'Business Automation', 'Digital Transformation', 'Web Development',
  'E-Commerce Solutions', 'Cloud Solutions', 'IT Consulting',
  'Software Development', 'Mobile App Development', 'SEO Services',
  'Digital Marketing', 'UI/UX Design', 'Data Analytics',
  'Project Management', 'CRM System', 'Accounting Software',
  'Inventory Management', 'HR Management System', 'Technical Support',
];

const DEFAULT_KEYWORDS_AR = [
  'نظام أودو', 'تطبيق أودو', 'تخصيص أودو', 'حلول ERP',
  'أتمتة الأعمال', 'التحول الرقمي', 'تطوير المواقع',
  'حلول التجارة الإلكترونية', 'الحلول السحابية', 'استشارات تقنية',
  'تطوير البرمجيات', 'تطوير تطبيقات الجوال', 'خدمات السيو',
  'التسويق الرقمي', 'تصميم واجهات المستخدم', 'تحليل البيانات',
  'إدارة المشاريع', 'نظام إدارة العملاء', 'برنامج المحاسبة',
  'إدارة المخزون', 'نظام إدارة الموارد البشرية', 'الدعم الفني',
];

const SEO_TEMPLATES = [
  {
    name: 'Blog Post - General',
    title_en: '{title} | Expert Insights & Tips',
    title_ar: '{title} | رؤى ونصائح الخبراء',
    desc_en: 'Discover expert insights about {title}. Learn best practices, tips, and strategies for your business growth.',
    desc_ar: 'اكتشف رؤى الخبراء حول {title}. تعلم أفضل الممارسات والنصائح والاستراتيجيات لنمو أعمالك.',
  },
  {
    name: 'Tutorial / How-To',
    title_en: 'How to {title} - Step by Step Guide',
    title_ar: 'كيفية {title} - دليل خطوة بخطوة',
    desc_en: 'Complete step-by-step guide on {title}. Follow our detailed tutorial to achieve the best results.',
    desc_ar: 'دليل شامل خطوة بخطوة حول {title}. اتبع دروسنا التفصيلية لتحقيق أفضل النتائج.',
  },
  {
    name: 'News / Update',
    title_en: '{title} - Latest News & Updates',
    title_ar: '{title} - آخر الأخبار والتحديثات',
    desc_en: 'Stay updated with the latest news about {title}. Get the most recent developments and announcements.',
    desc_ar: 'ابق على اطلاع بآخر الأخبار حول {title}. احصل على أحدث التطورات والإعلانات.',
  },
  {
    name: 'Case Study',
    title_en: '{title} - Case Study & Success Story',
    title_ar: '{title} - دراسة حالة وقصة نجاح',
    desc_en: 'Explore our case study on {title}. Learn how we delivered exceptional results and business value.',
    desc_ar: 'استكشف دراسة الحالة حول {title}. تعرف على كيفية تقديمنا لنتائج استثنائية وقيمة تجارية.',
  },
];

export function BlogFormDialog({ blog, onSuccess }: BlogFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title_en: blog?.title_en || '',
    title_ar: blog?.title_ar || '',
    category_en: blog?.category_en || '',
    category_ar: blog?.category_ar || '',
    excerpt_en: blog?.excerpt_en || '',
    excerpt_ar: blog?.excerpt_ar || '',
    content_en: blog?.content_en || '',
    content_ar: blog?.content_ar || '',
    slug: blog?.slug || '',
    tags: Array.isArray(blog?.tags) ? blog.tags : [],
    tags_ar: Array.isArray(blog?.tags_ar) ? blog.tags_ar : [],
    keywords_en: Array.isArray(blog?.keywords_en) ? blog.keywords_en : [],
    keywords_ar: Array.isArray(blog?.keywords_ar) ? blog.keywords_ar : [],
    image: blog?.image || '',
    is_published: Boolean(blog?.is_published) || false,
    is_featured: Boolean(blog?.is_featured) || false,
    seo_title_en: blog?.seo_title_en || '',
    seo_title_ar: blog?.seo_title_ar || '',
    seo_description_en: blog?.seo_description_en || '',
    seo_description_ar: blog?.seo_description_ar || '',
    seo_keywords_en: blog?.seo_keywords_en || '',
    seo_keywords_ar: blog?.seo_keywords_ar || '',
  });

  const generateSlug = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'tags' | 'tags_ar' | 'keywords_en' | 'keywords_ar', item: string) => {
    setForm(prev => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item] };
    });
  };

  const applySeoTemplate = (template: typeof SEO_TEMPLATES[0]) => {
    const titleEn = form.title_en || 'Your Blog Title';
    const titleAr = form.title_ar || 'عنوان المدونة';
    setForm(prev => ({
      ...prev,
      seo_title_en: template.title_en.replace('{title}', titleEn),
      seo_title_ar: template.title_ar.replace('{title}', titleAr),
      seo_description_en: template.desc_en.replace('{title}', titleEn),
      seo_description_ar: template.desc_ar.replace('{title}', titleAr),
      seo_keywords_en: prev.keywords_en.join(', ') || prev.tags.join(', '),
      seo_keywords_ar: prev.keywords_ar.join(', ') || prev.tags_ar.join(', '),
    }));
    toast.success(`Applied "${template.name}" SEO template`);
  };

  const handleSubmit = async () => {
    if (!form.title_en || !form.title_ar || !form.content_en || !form.content_ar) {
      toast.error('Please fill in required fields (titles and content in EN/AR).');
      return;
    }

    const payload: any = {
      ...form,
      slug: form.slug ? generateSlug(form.slug) : generateSlug(form.title_en),
      tags: form.tags.length > 0 ? form.tags : null,
      tags_ar: form.tags_ar.length > 0 ? form.tags_ar : null,
      keywords_en: form.keywords_en.length > 0 ? form.keywords_en : null,
      keywords_ar: form.keywords_ar.length > 0 ? form.keywords_ar : null,
      image: form.image || null,
      seo_title_en: form.seo_title_en || null,
      seo_title_ar: form.seo_title_ar || null,
      seo_description_en: form.seo_description_en || null,
      seo_description_ar: form.seo_description_ar || null,
      seo_keywords_en: form.seo_keywords_en || null,
      seo_keywords_ar: form.seo_keywords_ar || null,
    };

    setLoading(true);
    try {
      if (blog?.id) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', blog.id);
        if (error) throw error;
        toast.success('Blog updated successfully');
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
        toast.success('Blog created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Blog save error:', error);
      toast.error(error?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {blog ? (
          <Button variant="ghost" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        ) : (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> New Blog
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blog ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="tags">Tags & Keywords</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Title (EN) *</label>
                <Input value={form.title_en} onChange={(e) => handleChange('title_en', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Title (AR) *</label>
                <Input value={form.title_ar} onChange={(e) => handleChange('title_ar', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Category (EN)</label>
                <Input value={form.category_en} onChange={(e) => handleChange('category_en', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Category (AR)</label>
                <Input value={form.category_ar} onChange={(e) => handleChange('category_ar', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Excerpt (EN)</label>
                <Textarea value={form.excerpt_en || ''} onChange={(e) => handleChange('excerpt_en', e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Excerpt (AR)</label>
                <Textarea value={form.excerpt_ar || ''} onChange={(e) => handleChange('excerpt_ar', e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Content (EN) *</label>
                <Textarea value={form.content_en} onChange={(e) => handleChange('content_en', e.target.value)} rows={5} />
              </div>
              <div>
                <label className="text-sm font-medium">Content (AR) *</label>
                <Textarea value={form.content_ar} onChange={(e) => handleChange('content_ar', e.target.value)} rows={5} />
              </div>
            </div>
          </TabsContent>

          {/* Tags & Keywords Tab */}
          <TabsContent value="tags" className="space-y-4 mt-4">
            {/* Tags EN */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                Tags (EN)
                <Badge variant="secondary" className="text-xs">{form.tags.length} selected</Badge>
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-32 overflow-y-auto">
                {DEFAULT_TAGS_EN.map((tag) => (
                  <Badge
                    key={tag}
                    variant={form.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs transition-colors"
                    onClick={() => toggleArrayItem('tags', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags AR */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                Tags (AR)
                <Badge variant="secondary" className="text-xs">{form.tags_ar.length} selected</Badge>
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-32 overflow-y-auto" dir="rtl">
                {DEFAULT_TAGS_AR.map((tag) => (
                  <Badge
                    key={tag}
                    variant={form.tags_ar.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs transition-colors"
                    onClick={() => toggleArrayItem('tags_ar', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Keywords EN */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                Keywords (EN)
                <Badge variant="secondary" className="text-xs">{form.keywords_en.length} selected</Badge>
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-32 overflow-y-auto">
                {DEFAULT_KEYWORDS_EN.map((kw) => (
                  <Badge
                    key={kw}
                    variant={form.keywords_en.includes(kw) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs transition-colors"
                    onClick={() => toggleArrayItem('keywords_en', kw)}
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Keywords AR */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                Keywords (AR)
                <Badge variant="secondary" className="text-xs">{form.keywords_ar.length} selected</Badge>
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-32 overflow-y-auto" dir="rtl">
                {DEFAULT_KEYWORDS_AR.map((kw) => (
                  <Badge
                    key={kw}
                    variant={form.keywords_ar.includes(kw) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs transition-colors"
                    onClick={() => toggleArrayItem('keywords_ar', kw)}
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4 mt-4">
            {/* SEO Templates */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick SEO Templates
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEO_TEMPLATES.map((template) => (
                  <Button
                    key={template.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs h-auto py-2"
                    onClick={() => applySeoTemplate(template)}
                  >
                    <Sparkles className="h-3 w-3 mr-1.5 shrink-0 text-primary" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Google Preview */}
            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Search className="h-3 w-3" /> Google Search Preview (EN)
              </p>
              <div className="space-y-0.5">
                <p className="text-sm text-blue-600 font-medium truncate">
                  {form.seo_title_en || form.title_en || 'Blog Title'}
                </p>
                <p className="text-xs text-green-700 truncate">
                  yoursite.com/blog/{form.slug || generateSlug(form.title_en || 'post')}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {form.seo_description_en || form.excerpt_en || 'Blog description will appear here...'}
                </p>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">
                Title: {(form.seo_title_en || '').length}/60 • Desc: {(form.seo_description_en || '').length}/160
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">SEO Title (EN)</label>
                <Input
                  value={form.seo_title_en}
                  onChange={(e) => handleChange('seo_title_en', e.target.value)}
                  placeholder="SEO optimized title..."
                  maxLength={60}
                />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Title (AR)</label>
                <Input
                  value={form.seo_title_ar}
                  onChange={(e) => handleChange('seo_title_ar', e.target.value)}
                  placeholder="عنوان محسّن لمحركات البحث..."
                  dir="rtl"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Description (EN)</label>
                <Textarea
                  value={form.seo_description_en}
                  onChange={(e) => handleChange('seo_description_en', e.target.value)}
                  placeholder="Meta description for search engines..."
                  rows={2}
                  maxLength={160}
                />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Description (AR)</label>
                <Textarea
                  value={form.seo_description_ar}
                  onChange={(e) => handleChange('seo_description_ar', e.target.value)}
                  placeholder="وصف ميتا لمحركات البحث..."
                  dir="rtl"
                  rows={2}
                  maxLength={160}
                />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Keywords (EN)</label>
                <Input
                  value={form.seo_keywords_en}
                  onChange={(e) => handleChange('seo_keywords_en', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">SEO Keywords (AR)</label>
                <Input
                  value={form.seo_keywords_ar}
                  onChange={(e) => handleChange('seo_keywords_ar', e.target.value)}
                  placeholder="كلمة1، كلمة2، كلمة3..."
                  dir="rtl"
                />
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} placeholder="auto-generated-from-title" />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input value={form.image || ''} onChange={(e) => handleChange('image', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox id="published" checked={form.is_published} onCheckedChange={(v) => handleChange('is_published', Boolean(v))} />
                <label htmlFor="published" className="text-sm">Published</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="featured" checked={form.is_featured} onCheckedChange={(v) => handleChange('is_featured', Boolean(v))} />
                <label htmlFor="featured" className="text-sm">Featured</label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{blog ? 'Save Changes' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
