import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Sparkles, Search } from 'lucide-react';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';

interface ResourceFormDialogProps {
  resource?: any;
  onSuccess: () => void;
}

const DEFAULT_KEYWORDS_EN = [
  'Odoo Tutorial', 'Odoo Guide', 'ERP Learning', 'Odoo Modules',
  'Odoo Configuration', 'Odoo Development', 'Business Process',
  'Accounting Guide', 'Inventory Tutorial', 'CRM Setup',
  'HR Management', 'Point of Sale', 'E-Commerce Setup',
  'Odoo Customization', 'Technical Documentation', 'Best Practices',
];

const DEFAULT_KEYWORDS_AR = [
  'شرح أودو', 'دليل أودو', 'تعلم ERP', 'وحدات أودو',
  'إعداد أودو', 'تطوير أودو', 'عمليات الأعمال',
  'دليل المحاسبة', 'شرح المخزون', 'إعداد CRM',
  'إدارة الموارد البشرية', 'نقاط البيع', 'إعداد التجارة الإلكترونية',
  'تخصيص أودو', 'التوثيق التقني', 'أفضل الممارسات',
];

const SEO_TEMPLATES = [
  {
    name: 'Learning Resource',
    title_en: '{title} | Learn & Master',
    title_ar: '{title} | تعلم وأتقن',
    desc_en: 'Learn everything about {title}. Comprehensive guide with step-by-step instructions and best practices.',
    desc_ar: 'تعلم كل شيء عن {title}. دليل شامل مع تعليمات خطوة بخطوة وأفضل الممارسات.',
  },
  {
    name: 'Tutorial Guide',
    title_en: '{title} - Complete Tutorial',
    title_ar: '{title} - دليل تعليمي شامل',
    desc_en: 'Complete tutorial on {title}. Follow our expert guide to get started quickly and efficiently.',
    desc_ar: 'دليل تعليمي كامل حول {title}. اتبع دليل الخبراء لتبدأ بسرعة وكفاءة.',
  },
  {
    name: 'Documentation',
    title_en: '{title} - Documentation & Reference',
    title_ar: '{title} - التوثيق والمرجع',
    desc_en: 'Official documentation for {title}. Find detailed technical reference and implementation guides.',
    desc_ar: 'التوثيق الرسمي لـ {title}. اعثر على المرجع التقني التفصيلي وأدلة التنفيذ.',
  },
];

export function ResourceFormDialog({ resource, onSuccess }: ResourceFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: resource?.title_en || '',
    title_ar: resource?.title_ar || '',
    category_en: resource?.category_en || '',
    category_ar: resource?.category_ar || '',
    main_header_en: resource?.main_header_en || '',
    main_header_ar: resource?.main_header_ar || '',
    contents_en: resource?.contents_en || '',
    contents_ar: resource?.contents_ar || '',
    author_en: resource?.author_en || '',
    author_ar: resource?.author_ar || '',
    image: resource?.image || '',
    download_url: resource?.download_url || '',
    published_date: resource?.published_date || new Date().toISOString().split('T')[0],
    is_active: resource?.is_active ?? true,
    seo_title_en: resource?.seo_title_en || '',
    seo_title_ar: resource?.seo_title_ar || '',
    seo_description_en: resource?.seo_description_en || '',
    seo_description_ar: resource?.seo_description_ar || '',
    seo_keywords_en: resource?.seo_keywords_en || '',
    seo_keywords_ar: resource?.seo_keywords_ar || '',
  });

  const [selectedKeywordsEn, setSelectedKeywordsEn] = useState<string[]>([]);
  const [selectedKeywordsAr, setSelectedKeywordsAr] = useState<string[]>([]);

  const toggleKeyword = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  const applySeoTemplate = (template: typeof SEO_TEMPLATES[0]) => {
    const titleEn = formData.title_en || 'Resource Title';
    const titleAr = formData.title_ar || 'عنوان المورد';
    setFormData(prev => ({
      ...prev,
      seo_title_en: template.title_en.replace('{title}', titleEn),
      seo_title_ar: template.title_ar.replace('{title}', titleAr),
      seo_description_en: template.desc_en.replace('{title}', titleEn),
      seo_description_ar: template.desc_ar.replace('{title}', titleAr),
      seo_keywords_en: selectedKeywordsEn.join(', '),
      seo_keywords_ar: selectedKeywordsAr.join(', '),
    }));
    toast.success(`Applied "${template.name}" SEO template`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        seo_title_en: formData.seo_title_en || null,
        seo_title_ar: formData.seo_title_ar || null,
        seo_description_en: formData.seo_description_en || null,
        seo_description_ar: formData.seo_description_ar || null,
        seo_keywords_en: formData.seo_keywords_en || null,
        seo_keywords_ar: formData.seo_keywords_ar || null,
      };

      if (resource) {
        await contentManagement.updateLearnResource(resource.id, submitData);
        toast.success('Resource updated successfully');
      } else {
        await contentManagement.createLearnResource(submitData);
        toast.success('Resource created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {resource ? (
          <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" />Add Resource</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit Resource' : 'Create Resource'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO & Keywords</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Title (EN)</Label><Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} required /></div>
                <div><Label>Title (AR)</Label><Input value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} required /></div>
                <div><Label>Category (EN)</Label><Input value={formData.category_en} onChange={(e) => setFormData({ ...formData, category_en: e.target.value })} required /></div>
                <div><Label>Category (AR)</Label><Input value={formData.category_ar} onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })} required /></div>
                <div><Label>Main Header (EN)</Label><Input value={formData.main_header_en} onChange={(e) => setFormData({ ...formData, main_header_en: e.target.value })} required /></div>
                <div><Label>Main Header (AR)</Label><Input value={formData.main_header_ar} onChange={(e) => setFormData({ ...formData, main_header_ar: e.target.value })} required /></div>
                <div><Label>Author (EN)</Label><Input value={formData.author_en} onChange={(e) => setFormData({ ...formData, author_en: e.target.value })} /></div>
                <div><Label>Author (AR)</Label><Input value={formData.author_ar} onChange={(e) => setFormData({ ...formData, author_ar: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Contents (EN)</Label><RichTextEditor value={formData.contents_en} onChange={(val) => setFormData({ ...formData, contents_en: val })} placeholder="Write the resource content in English..." /></div>
                <div><Label>Contents (AR)</Label><RichTextEditor value={formData.contents_ar} onChange={(val) => setFormData({ ...formData, contents_ar: val })} placeholder="اكتب محتوى المورد بالعربية..." dir="rtl" /></div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" /> Quick SEO Templates
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SEO_TEMPLATES.map((t) => (
                  <Button key={t.name} type="button" variant="outline" size="sm" className="justify-start text-xs h-auto py-2" onClick={() => applySeoTemplate(t)}>
                    <Sparkles className="h-3 w-3 mr-1.5 shrink-0 text-primary" />{t.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Search className="h-3 w-3" /> Google Search Preview (EN)
              </p>
              <p className="text-sm text-[hsl(var(--primary))] font-medium truncate">{formData.seo_title_en || formData.title_en || 'Resource Title'}</p>
              <p className="text-xs text-muted-foreground truncate">yoursite.com/learn/{generateSlug(formData.title_en || 'resource')}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{formData.seo_description_en || 'Resource description...'}</p>
              <p className="text-xs mt-1 text-muted-foreground">Title: {(formData.seo_title_en || '').length}/60 • Desc: {(formData.seo_description_en || '').length}/160</p>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">Keywords (EN) <Badge variant="secondary" className="text-xs">{selectedKeywordsEn.length} selected</Badge></label>
              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-28 overflow-y-auto">
                {DEFAULT_KEYWORDS_EN.map((kw) => (
                  <Badge key={kw} variant={selectedKeywordsEn.includes(kw) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleKeyword(selectedKeywordsEn, setSelectedKeywordsEn, kw)}>{kw}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">Keywords (AR) <Badge variant="secondary" className="text-xs">{selectedKeywordsAr.length} selected</Badge></label>
              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-28 overflow-y-auto" dir="rtl">
                {DEFAULT_KEYWORDS_AR.map((kw) => (
                  <Badge key={kw} variant={selectedKeywordsAr.includes(kw) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleKeyword(selectedKeywordsAr, setSelectedKeywordsAr, kw)}>{kw}</Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>SEO Title (EN)</Label><Input value={formData.seo_title_en} onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })} maxLength={60} /></div>
              <div><Label>SEO Title (AR)</Label><Input value={formData.seo_title_ar} onChange={(e) => setFormData({ ...formData, seo_title_ar: e.target.value })} dir="rtl" maxLength={60} /></div>
              <div><Label>SEO Description (EN)</Label><Textarea value={formData.seo_description_en} onChange={(e) => setFormData({ ...formData, seo_description_en: e.target.value })} rows={2} maxLength={160} /></div>
              <div><Label>SEO Description (AR)</Label><Textarea value={formData.seo_description_ar} onChange={(e) => setFormData({ ...formData, seo_description_ar: e.target.value })} dir="rtl" rows={2} maxLength={160} /></div>
              <div><Label>SEO Keywords (EN)</Label><Input value={formData.seo_keywords_en} onChange={(e) => setFormData({ ...formData, seo_keywords_en: e.target.value })} /></div>
              <div><Label>SEO Keywords (AR)</Label><Input value={formData.seo_keywords_ar} onChange={(e) => setFormData({ ...formData, seo_keywords_ar: e.target.value })} dir="rtl" /></div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Image</Label><ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} folder="resources" /></div>
              <div><Label>Download URL</Label><Input value={formData.download_url} onChange={(e) => setFormData({ ...formData, download_url: e.target.value })} /></div>
              <div><Label>Published Date</Label><Input type="date" value={formData.published_date} onChange={(e) => setFormData({ ...formData, published_date: e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-8">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={(e) => handleSubmit(e as any)} disabled={loading}>{loading ? 'Saving...' : resource ? 'Update' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
