import { useState, useEffect } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Sparkles, Search, Loader2 } from 'lucide-react';
import { contentManagement } from '@/lib/supabase/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';

interface ResourceFormDialogProps {
  resource?: any;
  onSuccess: () => void;
}

const DEFAULT_CATEGORIES: { en: string; ar: string }[] = [
  { en: 'ERP Modules', ar: 'وحدات ERP' },
  { en: 'Accounting & Finance', ar: 'المحاسبة والمالية' },
  { en: 'Sales & CRM', ar: 'المبيعات وإدارة علاقات العملاء' },
  { en: 'Inventory & Supply Chain', ar: 'المخزون وسلسلة الإمداد' },
  { en: 'HR & Payroll', ar: 'الموارد البشرية والرواتب' },
  { en: 'Point of Sale (POS)', ar: 'نقاط البيع (POS)' },
  { en: 'E-Commerce & Website', ar: 'المتجر الإلكتروني والموقع' },
  { en: 'Manufacturing (MRP)', ar: 'التصنيع والتخطيط (MRP)' },
  { en: 'Purchase & Procurement', ar: 'المشتريات والتوريد' },
  { en: 'Project Management', ar: 'إدارة المشاريع' },
  { en: 'Helpdesk & Support', ar: 'الدعم الفني والمساعدة' },
  { en: 'API & Integrations', ar: 'الواجهات البرمجية والتكامل' },
  { en: 'Custom Apps & Addons', ar: 'تطبيقات وإضافات مخصصة' },
  { en: 'Tools & Utilities', ar: 'أدوات ومساعدات برمجية' },
  { en: 'Themes & UI Components', ar: 'القوالب وواجهات المستخدم' },
  { en: 'Security & Permissions', ar: 'الأمان والصلاحيات' },
  { en: 'Reports & Dashboards', ar: 'التقارير ولوحات التحكم' },
  { en: 'Getting Started', ar: 'البداية والأساسيات' },
  { en: 'Tutorials & Guides', ar: 'شروحات وأدلة إرشادية' },
];

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
  const [categoryOptions, setCategoryOptions] = useState<{ en: string; ar: string }[]>(DEFAULT_CATEGORIES);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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

  // Load existing categories from DB and sync form on open/resource change
  useEffect(() => {
    if (!open) return;

    if (resource) {
      setFormData({
        title_en: resource.title_en || '',
        title_ar: resource.title_ar || '',
        category_en: resource.category_en || '',
        category_ar: resource.category_ar || '',
        main_header_en: resource.main_header_en || '',
        main_header_ar: resource.main_header_ar || '',
        contents_en: resource.contents_en || '',
        contents_ar: resource.contents_ar || '',
        author_en: resource.author_en || '',
        author_ar: resource.author_ar || '',
        image: resource.image || '',
        download_url: resource.download_url || '',
        published_date: resource.published_date || new Date().toISOString().split('T')[0],
        is_active: resource.is_active ?? true,
        seo_title_en: resource.seo_title_en || '',
        seo_title_ar: resource.seo_title_ar || '',
        seo_description_en: resource.seo_description_en || '',
        seo_description_ar: resource.seo_description_ar || '',
        seo_keywords_en: resource.seo_keywords_en || '',
        seo_keywords_ar: resource.seo_keywords_ar || '',
      });
      setIsCustomCategory(false);

      const initEn = (resource.seo_keywords_en || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      setSelectedKeywordsEn(initEn);
      setKeywordsEnList(prev => {
        const merged = [...DEFAULT_KEYWORDS_EN];
        initEn.forEach((k: string) => {
          if (!merged.includes(k)) merged.push(k);
        });
        return merged;
      });

      const initAr = (resource.seo_keywords_ar || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      setSelectedKeywordsAr(initAr);
      setKeywordsArList(prev => {
        const merged = [...DEFAULT_KEYWORDS_AR];
        initAr.forEach((k: string) => {
          if (!merged.includes(k)) merged.push(k);
        });
        return merged;
      });
    } else {
      setFormData({
        title_en: '',
        title_ar: '',
        category_en: '',
        category_ar: '',
        main_header_en: '',
        main_header_ar: '',
        contents_en: '',
        contents_ar: '',
        author_en: '',
        author_ar: '',
        image: '',
        download_url: '',
        published_date: new Date().toISOString().split('T')[0],
        is_active: true,
        seo_title_en: '',
        seo_title_ar: '',
        seo_description_en: '',
        seo_description_ar: '',
        seo_keywords_en: '',
        seo_keywords_ar: '',
      });
      setIsCustomCategory(false);
      setSelectedKeywordsEn([]);
      setSelectedKeywordsAr([]);
      setKeywordsEnList(DEFAULT_KEYWORDS_EN);
      setKeywordsArList(DEFAULT_KEYWORDS_AR);
    }

    const loadExistingCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('learn_resources')
          .select('category_en, category_ar');

        const merged = [...DEFAULT_CATEGORIES];

        if (resource?.category_en) {
          const exists = merged.some(
            c => c.en.toLowerCase().trim() === resource.category_en.toLowerCase().trim()
          );
          if (!exists) {
            merged.push({ en: resource.category_en.trim(), ar: resource.category_ar?.trim() || '' });
          }
        }

        if (!error && data) {
          data.forEach(item => {
            if (item.category_en && item.category_en.trim()) {
              const exists = merged.some(
                m => m.en.toLowerCase().trim() === item.category_en.toLowerCase().trim()
              );
              if (!exists) {
                merged.push({ en: item.category_en.trim(), ar: item.category_ar?.trim() || '' });
              }
            }
          });
        }
        setCategoryOptions(merged);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    };

    loadExistingCategories();
  }, [open, resource]);

  const handleCategorySelect = (selectedEn: string) => {
    if (selectedEn === '__ADD_NEW__') {
      setIsCustomCategory(true);
      setFormData(prev => ({
        ...prev,
        category_en: '',
        category_ar: '',
      }));
      return;
    }

    const found = categoryOptions.find(c => c.en === selectedEn);
    if (found) {
      setIsCustomCategory(false);
      setFormData(prev => ({
        ...prev,
        category_en: found.en,
        category_ar: found.ar || prev.category_ar,
      }));
    }
  };

  const fetchArabicTranslation = async (textEn: string) => {
    const trimmed = textEn.trim();
    if (!trimmed) return;

    // Check existing dictionary/options first (instant)
    const match = categoryOptions.find(
      c => c.en.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (match && match.ar) {
      setFormData(prev => ({ ...prev, category_ar: match.ar }));
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|ar`
      );
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && !translated.toLowerCase().includes('my memory')) {
        setFormData(prev => ({ ...prev, category_ar: translated }));
        toast.success(`Arabic translation fetched: "${translated}"`);
      }
    } catch (err) {
      console.error('Failed to fetch Arabic translation:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const [keywordsEnList, setKeywordsEnList] = useState<string[]>(DEFAULT_KEYWORDS_EN);
  const [keywordsArList, setKeywordsArList] = useState<string[]>(DEFAULT_KEYWORDS_AR);
  const [newKeywordEn, setNewKeywordEn] = useState('');
  const [newKeywordAr, setNewKeywordAr] = useState('');
  const [selectedKeywordsEn, setSelectedKeywordsEn] = useState<string[]>([]);
  const [selectedKeywordsAr, setSelectedKeywordsAr] = useState<string[]>([]);

  const toggleKeywordEn = (kw: string) => {
    const updated = selectedKeywordsEn.includes(kw)
      ? selectedKeywordsEn.filter(i => i !== kw)
      : [...selectedKeywordsEn, kw];
    setSelectedKeywordsEn(updated);
    setFormData(prev => ({
      ...prev,
      seo_keywords_en: updated.join(', '),
    }));
  };

  const toggleKeywordAr = (kw: string) => {
    const updated = selectedKeywordsAr.includes(kw)
      ? selectedKeywordsAr.filter(i => i !== kw)
      : [...selectedKeywordsAr, kw];
    setSelectedKeywordsAr(updated);
    setFormData(prev => ({
      ...prev,
      seo_keywords_ar: updated.join(', '),
    }));
  };

  const handleAddKeywordEn = async () => {
    const trimmed = newKeywordEn.trim();
    if (!trimmed) return;

    if (!keywordsEnList.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      setKeywordsEnList(prev => [trimmed, ...prev]);
    }

    if (!selectedKeywordsEn.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...selectedKeywordsEn, trimmed];
      setSelectedKeywordsEn(updated);
      setFormData(prev => ({
        ...prev,
        seo_keywords_en: updated.join(', '),
      }));
    }

    setNewKeywordEn('');
    toast.success(`Added keyword: "${trimmed}"`);

    // Auto-fetch Arabic translation
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|ar`
      );
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && !translated.toLowerCase().includes('my memory')) {
        if (!keywordsArList.some(k => k.toLowerCase() === translated.toLowerCase())) {
          setKeywordsArList(prev => [translated, ...prev]);
        }
        if (!selectedKeywordsAr.some(k => k.toLowerCase() === translated.toLowerCase())) {
          const updatedAr = [...selectedKeywordsAr, translated];
          setSelectedKeywordsAr(updatedAr);
          setFormData(prev => ({
            ...prev,
            seo_keywords_ar: updatedAr.join(', '),
          }));
          toast.info(`Auto-added Arabic keyword: "${translated}"`);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleAddKeywordAr = () => {
    const trimmed = newKeywordAr.trim();
    if (!trimmed) return;

    if (!keywordsArList.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      setKeywordsArList(prev => [trimmed, ...prev]);
    }

    if (!selectedKeywordsAr.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...selectedKeywordsAr, trimmed];
      setSelectedKeywordsAr(updated);
      setFormData(prev => ({
        ...prev,
        seo_keywords_ar: updated.join(', '),
      }));
    }

    setNewKeywordAr('');
    toast.success(`تمت إضافة الكلمة الدلالية: "${trimmed}"`);
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
          <Button><Plus className="h-4 w-4 mr-2" />Add Open Source Project</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[94vw] max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit Open Source Project' : 'Create Open Source Project'}</DialogTitle>
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
                {/* Category (EN) with Dropdown & Add New Option */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Category (EN)</Label>
                    {!isCustomCategory ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary hover:text-primary/80 font-medium"
                        onClick={() => {
                          setIsCustomCategory(true);
                          setFormData(prev => ({ ...prev, category_en: '', category_ar: '' }));
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add New Option
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground font-medium"
                        onClick={() => {
                          setIsCustomCategory(false);
                          if (categoryOptions.length > 0) {
                            handleCategorySelect(categoryOptions[0].en);
                          }
                        }}
                      >
                        ← Choose from list
                      </Button>
                    )}
                  </div>

                  {!isCustomCategory ? (
                    <Select
                      value={formData.category_en || ''}
                      onValueChange={handleCategorySelect}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem
                          value="__ADD_NEW__"
                          className="font-semibold text-primary focus:text-primary focus:bg-primary/10 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            + Add New Option (Custom)
                          </span>
                        </SelectItem>
                        <SelectSeparator />
                        {categoryOptions.map((cat, idx) => (
                          <SelectItem key={idx} value={cat.en} className="cursor-pointer">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{cat.en}</span>
                              {cat.ar && (
                                <span className="text-xs text-muted-foreground" dir="rtl">
                                  {cat.ar}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={formData.category_en}
                      onChange={(e) => setFormData({ ...formData, category_en: e.target.value })}
                      onBlur={() => {
                        if (formData.category_en.trim() && !formData.category_ar.trim()) {
                          fetchArabicTranslation(formData.category_en);
                        }
                      }}
                      placeholder="Enter new category name..."
                      required
                    />
                  )}
                </div>

                {/* Category (AR) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Category (AR)</Label>
                    {isCustomCategory && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary hover:text-primary/80 gap-1 font-medium"
                        disabled={isTranslating || !formData.category_en.trim()}
                        onClick={() => fetchArabicTranslation(formData.category_en)}
                        title="Fetch Arabic translation"
                      >
                        {isTranslating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span>{isTranslating ? 'Translating...' : 'Fetch Arabic'}</span>
                      </Button>
                    )}
                  </div>
                  <Input
                    dir="rtl"
                    value={formData.category_ar}
                    onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })}
                    placeholder="الفئة بالعربية (يتم جلبها تلقائياً)"
                    required
                  />
                </div>
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Keywords (EN) <Badge variant="secondary" className="text-xs">{selectedKeywordsEn.length} selected</Badge>
                </label>
                {selectedKeywordsEn.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSelectedKeywordsEn([]);
                      setFormData(prev => ({ ...prev, seo_keywords_en: '' }));
                    }}
                  >
                    Clear selection
                  </Button>
                )}
              </div>

              {/* Add New Keyword (EN) Input */}
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add new English keyword (press Enter)..."
                  value={newKeywordEn}
                  onChange={(e) => setNewKeywordEn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeywordEn();
                    }
                  }}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10 shrink-0 font-medium"
                  onClick={handleAddKeywordEn}
                  disabled={!newKeywordEn.trim()}
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-32 overflow-y-auto">
                {keywordsEnList.map((kw) => {
                  const isSelected = selectedKeywordsEn.includes(kw);
                  return (
                    <Badge
                      key={kw}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer text-xs transition-all ${
                        isSelected
                          ? 'bg-odoo-purple hover:bg-odoo-purple/90 text-white shadow-sm'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleKeywordEn(kw)}
                    >
                      {isSelected && <span className="mr-1">✓</span>}
                      {kw}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Keywords (AR) <Badge variant="secondary" className="text-xs">{selectedKeywordsAr.length} selected</Badge>
                </label>
                {selectedKeywordsAr.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSelectedKeywordsAr([]);
                      setFormData(prev => ({ ...prev, seo_keywords_ar: '' }));
                    }}
                  >
                    مسح التحديد
                  </Button>
                )}
              </div>

              {/* Add New Keyword (AR) Input */}
              <div className="flex gap-2 mb-2" dir="rtl">
                <Input
                  dir="rtl"
                  placeholder="أضف كلمة دلالية جديدة بالعربية (اضغط Enter)..."
                  value={newKeywordAr}
                  onChange={(e) => setNewKeywordAr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeywordAr();
                    }
                  }}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10 shrink-0 font-medium"
                  onClick={handleAddKeywordAr}
                  disabled={!newKeywordAr.trim()}
                >
                  <Plus className="h-3.5 w-3.5" /> إضافة
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/30 max-h-32 overflow-y-auto" dir="rtl">
                {keywordsArList.map((kw) => {
                  const isSelected = selectedKeywordsAr.includes(kw);
                  return (
                    <Badge
                      key={kw}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer text-xs transition-all ${
                        isSelected
                          ? 'bg-odoo-purple hover:bg-odoo-purple/90 text-white shadow-sm'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => toggleKeywordAr(kw)}
                    >
                      {isSelected && <span className="ml-1">✓</span>}
                      {kw}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>SEO Title (EN)</Label><Input value={formData.seo_title_en} onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })} maxLength={60} /></div>
              <div><Label>SEO Title (AR)</Label><Input value={formData.seo_title_ar} onChange={(e) => setFormData({ ...formData, seo_title_ar: e.target.value })} dir="rtl" maxLength={60} /></div>
              <div><Label>SEO Description (EN)</Label><Textarea value={formData.seo_description_en} onChange={(e) => setFormData({ ...formData, seo_description_en: e.target.value })} rows={2} maxLength={160} /></div>
              <div><Label>SEO Description (AR)</Label><Textarea value={formData.seo_description_ar} onChange={(e) => setFormData({ ...formData, seo_description_ar: e.target.value })} dir="rtl" rows={2} maxLength={160} /></div>
              <div>
                <Label>SEO Keywords (EN)</Label>
                <Input 
                  value={formData.seo_keywords_en} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, seo_keywords_en: val });
                    const parsed = val.split(',').map(s => s.trim()).filter(Boolean);
                    setSelectedKeywordsEn(parsed);
                  }} 
                  placeholder="Comma separated keywords..." 
                />
              </div>
              <div>
                <Label>SEO Keywords (AR)</Label>
                <Input 
                  value={formData.seo_keywords_ar} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, seo_keywords_ar: val });
                    const parsed = val.split(',').map(s => s.trim()).filter(Boolean);
                    setSelectedKeywordsAr(parsed);
                  }} 
                  dir="rtl" 
                  placeholder="كلمات مفصولة بفواصل..." 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Image</Label><ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} folder="resources" /></div>
              <div><Label>Code Repository / Download URL</Label><Input placeholder="https://github.com/... or download link" value={formData.download_url} onChange={(e) => setFormData({ ...formData, download_url: e.target.value })} /></div>
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
