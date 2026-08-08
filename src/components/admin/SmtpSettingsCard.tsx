import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Save, RefreshCw } from 'lucide-react';

export function SmtpSettingsCard() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    host: 'smtp.hostinger.com',
    port: '465',
    secure: true,
    user: '',
    password: '',
    fromEmail: 'info@odooteams.com',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'smtp_settings')
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.setting_value) {
        setId(data.id);
        setFormData({
          ...formData,
          ...(data.setting_value as any)
        });
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      toast.error('Failed to load SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: formData as any })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            setting_key: 'smtp_settings',
            setting_type: 'email',
            setting_value: formData as any,
          });
        if (error) throw error;
      }
      toast.success('SMTP settings saved successfully');
      loadSettings();
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error('Failed to save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>SMTP Settings</CardTitle>
            <CardDescription>Configure outgoing email server (Hostinger by default)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input 
                value={formData.host} 
                onChange={(e) => setFormData({ ...formData, host: e.target.value })} 
                placeholder="smtp.hostinger.com" 
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input 
                value={formData.port} 
                onChange={(e) => setFormData({ ...formData, port: e.target.value })} 
                placeholder="465" 
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Username / Email</Label>
              <Input 
                value={formData.user} 
                onChange={(e) => setFormData({ ...formData, user: e.target.value })} 
                placeholder="info@odooteams.com" 
              />
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                placeholder="••••••••" 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>From Email Address</Label>
              <Input 
                value={formData.fromEmail} 
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })} 
                placeholder="info@odooteams.com" 
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end border-t pt-4 mt-4">
        <Button onClick={handleSave} disabled={loading || saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save SMTP Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
