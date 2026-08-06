import { useState, useEffect } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';

interface Testimonial {
  id: string;
  client_name_en: string;
  client_name_ar: string;
  position_en: string | null;
  position_ar: string | null;
  company_en: string | null;
  company_ar: string | null;
  testimonial_en: string;
  testimonial_ar: string;
  image: string | null;
  rating: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
}

interface TestimonialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: Testimonial | null;
  onSuccess: () => void;
}

export function TestimonialFormDialog({ open, onOpenChange, testimonial, onSuccess }: TestimonialFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name_en: '',
    client_name_ar: '',
    position_en: '',
    position_ar: '',
    company_en: '',
    company_ar: '',
    testimonial_en: '',
    testimonial_ar: '',
    image: '',
    rating: 5,
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        client_name_en: testimonial.client_name_en,
        client_name_ar: testimonial.client_name_ar,
        position_en: testimonial.position_en || '',
        position_ar: testimonial.position_ar || '',
        company_en: testimonial.company_en || '',
        company_ar: testimonial.company_ar || '',
        testimonial_en: testimonial.testimonial_en,
        testimonial_ar: testimonial.testimonial_ar,
        image: testimonial.image || '',
        rating: testimonial.rating || 5,
        is_active: testimonial.is_active ?? true,
        is_featured: testimonial.is_featured ?? false,
      });
    } else {
      setFormData({
        client_name_en: '',
        client_name_ar: '',
        position_en: '',
        position_ar: '',
        company_en: '',
        company_ar: '',
        testimonial_en: '',
        testimonial_ar: '',
        image: '',
        rating: 5,
        is_active: true,
        is_featured: false,
      });
    }
  }, [testimonial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        client_name_en: formData.client_name_en,
        client_name_ar: formData.client_name_ar,
        position_en: formData.position_en || null,
        position_ar: formData.position_ar || null,
        company_en: formData.company_en || null,
        company_ar: formData.company_ar || null,
        testimonial_en: formData.testimonial_en,
        testimonial_ar: formData.testimonial_ar,
        image: formData.image || null,
        rating: formData.rating,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      };

      if (testimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(data)
          .eq('id', testimonial.id);
        if (error) throw error;
        toast.success('Testimonial updated');
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(data);
        if (error) throw error;
        toast.success('Testimonial created');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{testimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name_en">Client Name (English)</Label>
              <Input
                id="client_name_en"
                value={formData.client_name_en}
                onChange={(e) => setFormData({ ...formData, client_name_en: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_name_ar">Client Name (Arabic)</Label>
              <Input
                id="client_name_ar"
                value={formData.client_name_ar}
                onChange={(e) => setFormData({ ...formData, client_name_ar: e.target.value })}
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position_en">Position (English)</Label>
              <Input
                id="position_en"
                value={formData.position_en}
                onChange={(e) => setFormData({ ...formData, position_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_ar">Position (Arabic)</Label>
              <Input
                id="position_ar"
                value={formData.position_ar}
                onChange={(e) => setFormData({ ...formData, position_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_en">Company (English)</Label>
              <Input
                id="company_en"
                value={formData.company_en}
                onChange={(e) => setFormData({ ...formData, company_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_ar">Company (Arabic)</Label>
              <Input
                id="company_ar"
                value={formData.company_ar}
                onChange={(e) => setFormData({ ...formData, company_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testimonial_en">Testimonial (English)</Label>
              <RichTextEditor
                value={formData.testimonial_en}
                onChange={(val) => setFormData({ ...formData, testimonial_en: val })}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testimonial_ar">Testimonial (Arabic)</Label>
              <RichTextEditor
                value={formData.testimonial_ar}
                onChange={(val) => setFormData({ ...formData, testimonial_ar: val })}
                rows={4}
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} folder="testimonials" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : testimonial ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
