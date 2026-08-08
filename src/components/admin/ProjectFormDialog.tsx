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
import { MultiImageUpload } from './MultiImageUpload';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';

interface ProjectFormDialogProps {
  project?: any;
  onSuccess: () => void;
}

const DEFAULT_KEYWORDS_EN = [
  'Odoo ERP', 'ERP Implementation', 'Web Development', 'E-Commerce',
  'Business Automation', 'Digital Transformation', 'Custom Software',
  'Cloud Solutions', 'Mobile App', 'IT Consulting',
  'Database Management', 'API Integration', 'UI/UX Design',
  'Project Management', 'CRM System', 'Inventory Management',
];

const DEFAULT_KEYWORDS_AR = [
  'نظام أودو', 'تطبيق ERP', 'تطوير المواقع', 'التجارة الإلكترونية',
  'أتمتة الأعمال', 'التحول الرقمي', 'برمجيات مخصصة',
  'الحلول السحابية', 'تطبيقات الجوال', 'استشارات تقنية',
  'إدارة قواعد البيانات', 'تكامل API', 'تصميم واجهات',
  'إدارة المشاريع', 'نظام إدارة العملاء', 'إدارة المخزون',
];

const SEO_TEMPLATES = [
  {
    name: 'Project Showcase',
    title_en: '{title} | Project Case Study',
    title_ar: '{title} | دراسة حالة مشروع',
    desc_en: 'Explore our {title} project. See how we delivered exceptional results using cutting-edge technology.',
    desc_ar: 'استكشف مشروع {title}. تعرف على كيف قدمنا نتائج استثنائية باستخدام أحدث التقنيات.',
  },
  {
    name: 'Client Success Story',
    title_en: '{title} - Client Success Story',
    title_ar: '{title} - قصة نجاح عميل',
    desc_en: 'Discover how {title} transformed business operations. A detailed look at our implementation approach and results.',
    desc_ar: 'اكتشف كيف حوّل {title} عمليات الأعمال. نظرة تفصيلية على نهج التنفيذ والنتائج.',
  },
  {
    name: 'Technical Portfolio',
    title_en: '{title} - Technical Implementation',
    title_ar: '{title} - التنفيذ التقني',
    desc_en: 'Technical deep-dive into {title}. Learn about the technologies, architecture, and solutions we implemented.',
    desc_ar: 'تعمق تقني في {title}. تعرف على التقنيات والبنية والحلول التي نفذناها.',
  },
];

export function ProjectFormDialog({ project, onSuccess }: ProjectFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: project?.title_en || '',
    title_ar: project?.title_ar || '',
    category_en: project?.category_en || '',
    category_ar: project?.category_ar || '',
    description_en: project?.description_en || '',
    description_ar: project?.description_ar || '',
    processing_steps_en: project?.processing_steps_en || '',
    processing_steps_ar: project?.processing_steps_ar || '',
    client_name: project?.client_name || '',
    images: project?.images?.join(', ') || '',
    technologies: project?.technologies?.join(', ') || '',
    completion_date: project?.completion_date || '',
    cost: project?.cost || '',
    project_url: project?.project_url || '',
    is_active: project?.is_active ?? true,
    is_featured: project?.is_featured ?? false,
    seo_title_en: project?.seo_title_en || '',
    seo_title_ar: project?.seo_title_ar || '',
    seo_description_en: project?.seo_description_en || '',
    seo_description_ar: project?.seo_description_ar || '',
    seo_keywords_en: project?.seo_keywords_en || '',
    seo_keywords_ar: project?.seo_keywords_ar || '',
  });

  const [selectedKeywordsEn, setSelectedKeywordsEn] = useState<string[]>([]);
  const [selectedKeywordsAr, setSelectedKeywordsAr] = useState<string[]>([]);

  const toggleKeyword = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  const applySeoTemplate = (template: typeof SEO_TEMPLATES[0]) => {
    const titleEn = formData.title_en || 'Project Title';
    const titleAr = formData.title_ar || 'عنوان المشروع';
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
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean),
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
        seo_title_en: formData.seo_title_en || null,
        seo_title_ar: formData.seo_title_ar || null,
        seo_description_en: formData.seo_description_en || null,
        seo_description_ar: formData.seo_description_ar || null,
        seo_keywords_en: formData.seo_keywords_en || null,
        seo_keywords_ar: formData.seo_keywords_ar || null,
      };
      
      if (project) {
        await contentManagement.updateProject(project.id, submitData);
        toast.success('Project updated successfully');
      } else {
        await contentManagement.createProject(submitData);
        toast.success('Project created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {project ? (
          <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" />Add Project</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
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
                <div>
                  <Label>Title (EN)</Label>
                  <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} required />
                </div>
                <div>
                  <Label>Title (AR)</Label>
                  <Input value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} required />
                </div>
                <div>
                  <Label>Category (EN)</Label>
                  <Input value={formData.category_en} onChange={(e) => setFormData({ ...formData, category_en: e.target.value })} required />
                </div>
                <div>
                  <Label>Category (AR)</Label>
                  <Input value={formData.category_ar} onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })} required />
                </div>
                <div className="col-span-2">
                  <Label>Description (EN)</Label>
                  <RichTextEditor value={formData.description_en} onChange={(val) => setFormData({ ...formData, description_en: val })} placeholder="Write the project description in English..." />
                </div>
                <div className="col-span-2">
                  <Label>Description (AR)</Label>
                  <RichTextEditor value={formData.description_ar} onChange={(val) => setFormData({ ...formData, description_ar: val })} placeholder="اكتب وصف المشروع بالعربية..." dir="rtl" />
                </div>
                <div>
                  <Label>Processing Steps (EN)</Label>
                  <Textarea value={formData.processing_steps_en} onChange={(e) => setFormData({ ...formData, processing_steps_en: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label>Processing Steps (AR)</Label>
                  <Textarea value={formData.processing_steps_ar} onChange={(e) => setFormData({ ...formData, processing_steps_ar: e.target.value })} rows={2} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                </div>
                <div>
                  <Label>Completion Date</Label>
                  <Input type="date" value={formData.completion_date} onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })} />
                </div>
                <div>
                  <Label>Cost</Label>
                  <Input value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} placeholder="$3500" />
                </div>
                <div>
                  <Label>Project URL</Label>
                  <Input value={formData.project_url} onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Project Images</Label>
                <p className="text-xs text-muted-foreground mb-2">Upload up to 5 images (or paste comma-separated URLs below)</p>
                <MultiImageUpload
                  value={formData.images.split(',').map((s: string) => s.trim()).filter(Boolean)}
                  onChange={(urls) => setFormData({ ...formData, images: urls.join(', ') })}
                  folder="projects"
                  maxFiles={5}
                />
                <Input className="mt-4" value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="https://example.com/img1.jpg, ..." />
              </div>

              <div>
                <Label>Technologies (comma-separated)</Label>
                <Input value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} placeholder="Odoo, Python, ..." />
                <div className="flex flex-wrap gap-1 mt-2">
                  {['Odoo', 'Python', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Next.js', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'XML', 'QWeb', 'REST API', 'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Linux', 'Nginx', 'CSS', 'Tailwind CSS', 'SASS', 'HTML', 'Git', 'Supabase', 'Firebase', 'WordPress', 'Shopify', 'Flutter', 'React Native', 'PHP', 'Laravel', 'Django', 'FastAPI', 'Go', 'Rust'].map((tech) => (
                    <Button key={tech} type="button" variant="outline" size="sm" className="text-xs h-6 px-2"
                      onClick={() => {
                        const current = formData.technologies.split(',').map(t => t.trim()).filter(Boolean);
                        if (!current.includes(tech)) {
                          setFormData({ ...formData, technologies: [...current, tech].join(', ') });
                        }
                      }}
                    >+ {tech}</Button>
                  ))}
                </div>
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
              <p className="text-sm text-[hsl(var(--primary))] font-medium truncate">{formData.seo_title_en || formData.title_en || 'Project Title'}</p>
              <p className="text-xs text-muted-foreground truncate">yoursite.com/projects/{generateSlug(formData.title_en || 'project')}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{formData.seo_description_en || formData.description_en || 'Project description...'}</p>
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
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={(e) => handleSubmit(e as any)} disabled={loading}>{loading ? 'Saving...' : project ? 'Update' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
