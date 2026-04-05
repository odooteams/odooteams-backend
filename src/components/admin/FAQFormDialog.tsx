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

interface FAQFormDialogProps {
  faq?: any;
  onSuccess: () => void;
}

export function FAQFormDialog({ faq, onSuccess }: FAQFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_en: faq?.question_en || '',
    question_ar: faq?.question_ar || '',
    answer_en: faq?.answer_en || '',
    answer_ar: faq?.answer_ar || '',
    category_en: faq?.category_en || '',
    category_ar: faq?.category_ar || '',
    sort_order: faq?.sort_order || 0,
    is_active: faq?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (faq) {
        await contentManagement.updateFAQ(faq.id, formData);
        toast.success('FAQ updated successfully');
      } else {
        await contentManagement.createFAQ(formData);
        toast.success('FAQ created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {faq ? (
          <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" />Add FAQ</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{faq ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question_en">Question (English)</Label>
            <Input
              id="question_en"
              value={formData.question_en}
              onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="question_ar">Question (Arabic)</Label>
            <Input
              id="question_ar"
              value={formData.question_ar}
              onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="answer_en">Answer (English)</Label>
            <Textarea
              id="answer_en"
              value={formData.answer_en}
              onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="answer_ar">Answer (Arabic)</Label>
            <Textarea
              id="answer_ar"
              value={formData.answer_ar}
              onChange={(e) => setFormData({ ...formData, answer_ar: e.target.value })}
              required
            />
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
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
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
              {loading ? 'Saving...' : faq ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
