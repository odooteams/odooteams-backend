import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';

interface BlogFormDialogProps {
  blog?: any;
  onSuccess: () => void;
}

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
    tags: Array.isArray(blog?.tags) ? blog.tags.join(',') : blog?.tags || '',
    image: blog?.image || '',
    is_published: Boolean(blog?.is_published) || false,
    is_featured: Boolean(blog?.is_featured) || false,
  });

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!form.title_en || !form.title_ar || !form.content_en || !form.content_ar) {
      toast.error('Please fill in required fields (titles and content in EN/AR).');
      return;
    }

    const payload: any = {
      ...form,
      slug: form.slug ? generateSlug(form.slug) : generateSlug(form.title_en),
      tags: form.tags
        ? String(form.tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : null,
      image: form.image || null,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{blog ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Title (EN)</label>
            <Input value={form.title_en} onChange={(e) => handleChange('title_en', e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Title (AR)</label>
            <Input value={form.title_ar} onChange={(e) => handleChange('title_ar', e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Category (EN)</label>
            <Input value={form.category_en} onChange={(e) => handleChange('category_en', e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Category (AR)</label>
            <Input value={form.category_ar} onChange={(e) => handleChange('category_ar', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Excerpt (EN)</label>
            <Textarea value={form.excerpt_en || ''} onChange={(e) => handleChange('excerpt_en', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Excerpt (AR)</label>
            <Textarea value={form.excerpt_ar || ''} onChange={(e) => handleChange('excerpt_ar', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Content (EN)</label>
            <Textarea value={form.content_en} onChange={(e) => handleChange('content_en', e.target.value)} rows={5} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Content (AR)</label>
            <Textarea value={form.content_ar} onChange={(e) => handleChange('content_ar', e.target.value)} rows={5} />
          </div>
          <div>
            <label className="text-sm">Slug</label>
            <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Tags (comma separated)</label>
            <Input value={form.tags || ''} onChange={(e) => handleChange('tags', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Image URL</label>
            <Input value={form.image || ''} onChange={(e) => handleChange('image', e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="published" checked={form.is_published} onCheckedChange={(v) => handleChange('is_published', Boolean(v))} />
            <label htmlFor="published" className="text-sm">Published</label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="featured" checked={form.is_featured} onCheckedChange={(v) => handleChange('is_featured', Boolean(v))} />
            <label htmlFor="featured" className="text-sm">Featured</label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{blog ? 'Save Changes' : 'Create'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
