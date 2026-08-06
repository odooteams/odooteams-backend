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

interface TimelineEvent {
  id: string;
  year: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

interface TimelineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TimelineEvent | null;
  onSuccess: () => void;
}

export function TimelineFormDialog({ open, onOpenChange, event, onSuccess }: TimelineFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    image: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        year: event.year,
        title_en: event.title_en,
        title_ar: event.title_ar,
        description_en: event.description_en,
        description_ar: event.description_ar,
        image: event.image || '',
        sort_order: event.sort_order || 0,
        is_active: event.is_active ?? true,
      });
    } else {
      setFormData({
        year: new Date().getFullYear(),
        title_en: '',
        title_ar: '',
        description_en: '',
        description_ar: '',
        image: '',
        sort_order: 0,
        is_active: true,
      });
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        year: formData.year,
        title_en: formData.title_en,
        title_ar: formData.title_ar,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        image: formData.image || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      };

      if (event) {
        const { error } = await supabase
          .from('timeline_events')
          .update(data)
          .eq('id', event.id);
        if (error) throw error;
        toast.success('Timeline event updated');
      } else {
        const { error } = await supabase
          .from('timeline_events')
          .insert(data);
        if (error) throw error;
        toast.success('Timeline event created');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving timeline event:', error);
      toast.error('Failed to save timeline event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Timeline Event' : 'Add Timeline Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English)</Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_ar">Title (Arabic)</Label>
              <Input
                id="title_ar"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_ar">Description (Arabic)</Label>
              <Textarea
                id="description_ar"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : event ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
