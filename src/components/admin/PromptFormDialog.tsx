import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PromptItem {
  id: string;
  name_en: string;
  name_ar: string;
  category_en: string;
  category_ar: string;
  prompt_text: string;
  description_en: string | null;
  description_ar: string | null;
  image: string | null;
  copies_count: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface PromptFormDialogProps {
  prompt?: PromptItem;
  onSuccess: () => void;
}

export function PromptFormDialog({ prompt, onSuccess }: PromptFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_en: prompt?.name_en || '',
    name_ar: prompt?.name_ar || '',
    category_en: prompt?.category_en || '',
    category_ar: prompt?.category_ar || '',
    prompt_text: prompt?.prompt_text || '',
    description_en: prompt?.description_en || '',
    description_ar: prompt?.description_ar || '',
    image: prompt?.image || '',
    sort_order: prompt?.sort_order ?? 0,
    is_active: prompt?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (prompt) {
        const { error } = await (supabase as any).from('prompts').update(formData).eq('id', prompt.id);
        if (error) throw error;
        toast.success('Prompt updated successfully');
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await (supabase as any)
          .from('prompts')
          .insert({ ...formData, created_by: userData?.user?.id ?? null });
        if (error) throw error;
        toast.success('Prompt created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error saving prompt:', error);
      toast.error(error.message || 'Failed to save prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {prompt ? (
          <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" />Add Prompt</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prompt ? 'Edit Prompt' : 'Add Prompt'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Name (EN)</Label>
              <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} required />
            </div>
            <div>
              <Label>Name (AR)</Label>
              <Input dir="rtl" value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required />
            </div>
            <div>
              <Label>Category (EN)</Label>
              <Input value={formData.category_en} onChange={(e) => setFormData({ ...formData, category_en: e.target.value })} required />
            </div>
            <div>
              <Label>Category (AR)</Label>
              <Input dir="rtl" value={formData.category_ar} onChange={(e) => setFormData({ ...formData, category_ar: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label>Prompt text</Label>
            <Textarea
              rows={8}
              value={formData.prompt_text}
              onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Short description (EN, optional)</Label>
              <Textarea rows={3} value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
            </div>
            <div>
              <Label>Short description (AR, optional)</Label>
              <Textarea dir="rtl" rows={3} value={formData.description_ar} onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Image (optional)</Label>
            <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} folder="prompts" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="prompt-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="prompt-active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
