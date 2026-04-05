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

interface ResourceFormDialogProps {
  resource?: any;
  onSuccess: () => void;
}

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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (resource) {
        await contentManagement.updateLearnResource(resource.id, formData);
        toast.success('Resource updated successfully');
      } else {
        await contentManagement.createLearnResource(formData);
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="main_header_en">Main Header (English)</Label>
              <Input
                id="main_header_en"
                value={formData.main_header_en}
                onChange={(e) => setFormData({ ...formData, main_header_en: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="main_header_ar">Main Header (Arabic)</Label>
              <Input
                id="main_header_ar"
                value={formData.main_header_ar}
                onChange={(e) => setFormData({ ...formData, main_header_ar: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author_en">Author (English)</Label>
              <Input
                id="author_en"
                value={formData.author_en}
                onChange={(e) => setFormData({ ...formData, author_en: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="author_ar">Author (Arabic)</Label>
              <Input
                id="author_ar"
                value={formData.author_ar}
                onChange={(e) => setFormData({ ...formData, author_ar: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contents_en">Contents (English)</Label>
            <Textarea
              id="contents_en"
              value={formData.contents_en}
              onChange={(e) => setFormData({ ...formData, contents_en: e.target.value })}
              required
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="contents_ar">Contents (Arabic)</Label>
            <Textarea
              id="contents_ar"
              value={formData.contents_ar}
              onChange={(e) => setFormData({ ...formData, contents_ar: e.target.value })}
              required
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="download_url">Download URL</Label>
              <Input
                id="download_url"
                value={formData.download_url}
                onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="published_date">Published Date</Label>
              <Input
                id="published_date"
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : resource ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
