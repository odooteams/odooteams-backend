import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Building2, Phone, Share2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      
      const settingsMap: any = {};
      data?.forEach(item => {
        settingsMap[item.setting_key] = item.setting_value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Admin • Settings" description="Manage site settings" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Settings</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <SettingsIcon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>Site Settings</CardTitle>
                        <CardDescription>Manage company information, contact details, and social media</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading settings...</p>
                    ) : (
                      <Tabs defaultValue="company" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="company">
                            <Building2 className="h-4 w-4 mr-2" />
                            Company
                          </TabsTrigger>
                          <TabsTrigger value="contact">
                            <Phone className="h-4 w-4 mr-2" />
                            Contact
                          </TabsTrigger>
                          <TabsTrigger value="social">
                            <Share2 className="h-4 w-4 mr-2" />
                            Social Media
                          </TabsTrigger>
                          <TabsTrigger value="team">
                            <Users className="h-4 w-4 mr-2" />
                            Team
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="company" className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">Company Information</h3>
                            <p className="text-sm text-muted-foreground">Configure company details and branding</p>
                            <pre className="p-4 bg-muted rounded-lg overflow-auto">
                              {JSON.stringify(settings.company_info || {}, null, 2)}
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="contact" className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">Contact Information</h3>
                            <p className="text-sm text-muted-foreground">Manage contact details and addresses</p>
                            <pre className="p-4 bg-muted rounded-lg overflow-auto">
                              {JSON.stringify(settings.contact_info || {}, null, 2)}
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="social" className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">Social Media Links</h3>
                            <p className="text-sm text-muted-foreground">Configure social media profiles</p>
                            <pre className="p-4 bg-muted rounded-lg overflow-auto">
                              {JSON.stringify(settings.social_media || {}, null, 2)}
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="team" className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">Team Management</h3>
                            <p className="text-sm text-muted-foreground">View team members (managed in database)</p>
                            <p className="text-sm text-muted-foreground">Team members are stored in the team_members table</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
