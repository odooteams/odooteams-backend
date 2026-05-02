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
import { Plus, Edit, Trash2 } from 'lucide-react';

interface SettingFormDialogProps {
  setting?: any;
  onSuccess?: () => void;
}

type FieldType = 'string' | 'number' | 'boolean' | 'textarea';

interface FieldRow {
  key: string;
  value: string;
  type: FieldType;
}

const isLongText = (k: string, v: any) =>
  typeof v === 'string' && (v.length > 80 || /description|content|bio|address|hours/i.test(k));

const inferType = (v: any): FieldType => {
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') return 'number';
  return 'string';
};

const valueToObject = (rows: FieldRow[]): Record<string, any> => {
  const obj: Record<string, any> = {};
  for (const r of rows) {
    if (!r.key.trim()) continue;
    if (r.type === 'number') {
      const n = r.value === '' ? null : Number(r.value);
      obj[r.key] = Number.isNaN(n as number) ? r.value : n;
    } else if (r.type === 'boolean') {
      obj[r.key] = r.value === 'true';
    } else {
      obj[r.key] = r.value;
    }
  }
  return obj;
};

const objectToRows = (val: any): FieldRow[] => {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return [];
  return Object.entries(val).map(([k, v]) => ({
    key: k,
    value: typeof v === 'boolean' ? String(v) : v == null ? '' : String(v),
    type: isLongText(k, v) ? 'textarea' : inferType(v),
  }));
};

export function SettingFormDialog({ setting, onSuccess }: SettingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingKey, setSettingKey] = useState(setting?.setting_key || '');
  const [settingType, setSettingType] = useState(setting?.setting_type || 'company_info');
  const [isActive, setIsActive] = useState<boolean>(setting?.is_active ?? true);
  const [rows, setRows] = useState<FieldRow[]>(objectToRows(setting?.setting_value));

  const updateRow = (i: number, patch: Partial<FieldRow>) => {
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addRow = (type: FieldType = 'string') => {
    setRows(prev => [...prev, { key: '', value: type === 'boolean' ? 'false' : '', type }]);
  };

  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedValue = valueToObject(rows);
      const { data: { user } } = await supabase.auth.getUser();

      if (setting) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            setting_value: parsedValue,
            setting_type: settingType,
            is_active: isActive,
            updated_by: user?.id,
          })
          .eq('id', setting.id);
        if (error) throw error;
        toast.success('Setting updated successfully');
      } else {
        const { error } = await supabase.from('site_settings').insert({
          setting_key: settingKey,
          setting_type: settingType,
          setting_value: parsedValue,
          is_active: isActive,
          updated_by: user?.id,
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{setting ? 'Edit Setting' : 'Create New Setting'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setting_key">Setting Key</Label>
              <Input
                id="setting_key"
                value={settingKey}
                onChange={(e) => setSettingKey(e.target.value)}
                disabled={!!setting}
                placeholder="e.g., company_info"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting_type">Setting Type</Label>
              <Select value={settingType} onValueChange={setSettingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_info">Company Info</SelectItem>
                  <SelectItem value="contact">Contact Info</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => addRow('string')}>
                  <Plus className="h-3 w-3 mr-1" /> Text
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addRow('textarea')}>
                  <Plus className="h-3 w-3 mr-1" /> Long text
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addRow('number')}>
                  <Plus className="h-3 w-3 mr-1" /> Number
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addRow('boolean')}>
                  <Plus className="h-3 w-3 mr-1" /> Boolean
                </Button>
              </div>
            </div>

            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground border rounded-md p-4 text-center">
                No fields yet. Add a field to get started.
              </p>
            )}

            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start border rounded-md p-3">
                  <div className="col-span-12 md:col-span-4 space-y-1">
                    <Label className="text-xs">Field name</Label>
                    <Input
                      value={row.key}
                      onChange={(e) => updateRow(i, { key: e.target.value })}
                      placeholder="e.g., name_en"
                    />
                  </div>
                  <div className="col-span-7 md:col-span-6 space-y-1">
                    <Label className="text-xs">Value</Label>
                    {row.type === 'textarea' ? (
                      <Textarea
                        value={row.value}
                        onChange={(e) => updateRow(i, { value: e.target.value })}
                        rows={3}
                      />
                    ) : row.type === 'boolean' ? (
                      <Select value={row.value} onValueChange={(v) => updateRow(i, { value: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={row.type === 'number' ? 'number' : 'text'}
                        value={row.value}
                        onChange={(e) => updateRow(i, { value: e.target.value })}
                      />
                    )}
                  </div>
                  <div className="col-span-3 md:col-span-1 space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={row.type}
                      onValueChange={(v: FieldType) => updateRow(i, { type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">Text</SelectItem>
                        <SelectItem value="textarea">Long</SelectItem>
                        <SelectItem value="number">Num</SelectItem>
                        <SelectItem value="boolean">Bool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-end justify-end h-full">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(i)}
                      aria-label="Remove field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
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
