import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil } from 'lucide-react';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';

interface ProjectFormDialogProps {
  project?: any;
  onSuccess: () => void;
}

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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean),
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title_en">Title (English)</Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="title_ar">Title (Arabic)</Label>
              <Input
                id="title_ar"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_en">Category (English)</Label>
              <Input
                id="category_en"
                value={formData.category_en}
                onChange={(e) => setFormData({ ...formData, category_en: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category_ar">Category (Arabic)</Label>
              <Input
                id="category_ar"
                value={formData.category_ar}
                onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description_en">Description (English)</Label>
            <Textarea
              id="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="description_ar">Description (Arabic)</Label>
            <Textarea
              id="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="processing_steps_en">Processing Steps (English)</Label>
            <Textarea
              id="processing_steps_en"
              value={formData.processing_steps_en}
              onChange={(e) => setFormData({ ...formData, processing_steps_en: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="processing_steps_ar">Processing Steps (Arabic)</Label>
            <Textarea
              id="processing_steps_ar"
              value={formData.processing_steps_ar}
              onChange={(e) => setFormData({ ...formData, processing_steps_ar: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="completion_date">Completion Date</Label>
              <Input
                id="completion_date"
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="$3500"
              />
            </div>
            <div>
              <Label htmlFor="project_url">Project URL</Label>
              <Input
                id="project_url"
                value={formData.project_url}
                onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="images">Images URLs (comma-separated)</Label>
            <Input
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            />
          </div>

          <div>
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              placeholder="Odoo, Python, JavaScript, PostgreSQL"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {['Odoo', 'Python', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Next.js', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'XML', 'QWeb', 'REST API', 'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Linux', 'Nginx', 'Apache', 'CSS', 'Tailwind CSS', 'SASS', 'HTML', 'Git', 'GitHub Actions', 'CI/CD', 'Supabase', 'Firebase', 'WordPress', 'Shopify', 'Flutter', 'React Native', 'Swift', 'Kotlin', 'Java', '.NET', 'C#', 'PHP', 'Laravel', 'Django', 'FastAPI', 'Go', 'Rust'].map((tech) => (
                <Button
                  key={tech}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => {
                    const current = formData.technologies.split(',').map(t => t.trim()).filter(Boolean);
                    if (!current.includes(tech)) {
                      const updated = [...current, tech].join(', ');
                      setFormData({ ...formData, technologies: updated });
                    }
                  }}
                >
                  + {tech}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
