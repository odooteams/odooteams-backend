import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { contentManagement } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { Partner } from '@/lib/supabase/types';

interface PartnerFormDialogProps {
  partner?: Partner;
  onSuccess: () => void;
}

export function PartnerFormDialog({ partner, onSuccess }: PartnerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_en: partner?.name_en || '',
    name_ar: partner?.name_ar || '',
    logo_url: partner?.logo_url || '',
    website_url: partner?.website_url || '',
    is_active: partner?.is_active ?? true,
    sort_order: partner?.sort_order || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (partner) {
        await contentManagement.updatePartner(partner.id, formData);
        toast.success('Partner updated successfully');
      } else {
        await contentManagement.createPartner(formData);
        toast.success('Partner created successfully');
      }
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Failed to save partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {partner ? (
          <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" />Add Partner</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{partner ? 'Edit Partner' : 'Add Partner'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name (EN)</Label>
              <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} required />
            </div>
            <div>
              <Label>Name (AR)</Label>
              <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label>Logo</Label>
            <p className="text-xs text-muted-foreground mb-2">Upload the partner's logo image</p>
            <ImageUpload
              value={formData.logo_url}
              onChange={(url) => setFormData({ ...formData, logo_url: url })}
              folder="partners"
            />
          </div>

          <div>
            <Label>Website URL (Optional)</Label>
            <Input 
              type="url" 
              placeholder="https://example.com" 
              value={formData.website_url} 
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} 
            />
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
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                id="active"
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
