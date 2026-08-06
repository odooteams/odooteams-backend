import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';

interface PolicyFormDialogProps {
  policy?: any;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function PolicyFormDialog({ policy, onSuccess, trigger }: PolicyFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: policy?.title_en || '',
    title_ar: policy?.title_ar || '',
    content_en: policy?.content_en || '',
    content_ar: policy?.content_ar || '',
    policy_type: policy?.policy_type || 'privacy',
    slug: policy?.slug || '',
    version: policy?.version || '1.0',
    effective_date: policy?.effective_date || new Date().toISOString().split('T')[0],
    is_active: policy?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (policy) {
        await contentManagement.updatePolicy(policy.id, formData);
        toast.success('Policy updated successfully');
      } else {
        await contentManagement.createPolicy(formData);
        toast.success('Policy created successfully');
      }
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving policy:', error);
      toast.error(error.message || 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          policy ? (
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English)</Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => handleChange('title_en', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_ar">Title (Arabic)</Label>
              <Input
                id="title_ar"
                value={formData.title_ar}
                onChange={(e) => handleChange('title_ar', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy_type">Policy Type</Label>
              <Select value={formData.policy_type} onValueChange={(value) => handleChange('policy_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privacy">Privacy Policy</SelectItem>
                  <SelectItem value="terms">Terms of Service</SelectItem>
                  <SelectItem value="cookie">Cookie Policy</SelectItem>
                  <SelectItem value="refund">Refund Policy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) => handleChange('effective_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_en">Content (English)</Label>
            <Textarea
              id="content_en"
              value={formData.content_en}
              onChange={(e) => handleChange('content_en', e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_ar">Content (Arabic)</Label>
            <Textarea
              id="content_ar"
              value={formData.content_ar}
              onChange={(e) => handleChange('content_ar', e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : policy ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
