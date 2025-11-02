import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';

interface SettingFormDialogProps {
  setting?: any;
  onSuccess?: () => void;
}

export function SettingFormDialog({ setting, onSuccess }: SettingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    setting_key: setting?.setting_key || '',
    setting_type: setting?.setting_type || 'company_info',
    setting_value: setting?.setting_value ? JSON.stringify(setting.setting_value, null, 2) : '{}',
    is_active: setting?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse JSON value
      let parsedValue;
      try {
        parsedValue = JSON.parse(formData.setting_value);
      } catch (error) {
        toast.error('Invalid JSON format');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (setting) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            setting_value: parsedValue,
            setting_type: formData.setting_type,
            is_active: formData.is_active,
            updated_by: user?.id
          })
          .eq('id', setting.id);
        
        if (error) throw error;
        toast.success('Setting updated successfully');
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            setting_key: formData.setting_key,
            setting_type: formData.setting_type,
            setting_value: parsedValue,
            is_active: formData.is_active,
            updated_by: user?.id
          });
        
        if (error) throw error;
        toast.success('Setting created successfully');
      }
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving setting:', error);
      toast.error(error.message || 'Failed to save setting');
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
        {setting ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Setting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{setting ? 'Edit Setting' : 'Create New Setting'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setting_key">Setting Key</Label>
            <Input
              id="setting_key"
              value={formData.setting_key}
              onChange={(e) => handleChange('setting_key', e.target.value)}
              disabled={!!setting}
              placeholder="e.g., company_info, contact_info"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting_type">Setting Type</Label>
            <Select value={formData.setting_type} onValueChange={(value) => handleChange('setting_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_info">Company Info</SelectItem>
                <SelectItem value="contact_info">Contact Info</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting_value">Setting Value (JSON)</Label>
            <Textarea
              id="setting_value"
              value={formData.setting_value}
              onChange={(e) => handleChange('setting_value', e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder='{"name": "Company Name", "email": "contact@example.com"}'
              required
            />
            <p className="text-xs text-muted-foreground">Enter valid JSON format</p>
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
                {loading ? 'Saving...' : setting ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
