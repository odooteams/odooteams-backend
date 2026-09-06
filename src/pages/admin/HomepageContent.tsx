import { useEffect, useState } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_CONTENT_KEY,
  HomepageContent,
  fetchHomepageContent,
} from '@/hooks/useHomepageContent';

type Field = keyof HomepageContent;

export default function AdminHomepageContent() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    fetchHomepageContent()
      .then(setContent)
      .catch(() => toast.error('Failed to load homepage content'))
      .finally(() => setLoading(false));
  }, []);

  const set = (field: Field, value: string) =>
    setContent((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await (supabase as any)
        .from('site_settings')
        .select('id')
        .eq('setting_key', HOMEPAGE_CONTENT_KEY)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await (supabase as any)
          .from('site_settings')
          .update({ setting_value: content, is_active: true })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('site_settings').insert({
          setting_key: HOMEPAGE_CONTENT_KEY,
          setting_value: content,
          setting_type: 'json',
          is_active: true,
        });
        if (error) throw error;
      }
      toast.success('Homepage content saved');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const pair = (label: string, en: Field, ar: Field, multiline = false) => (
    <div className="grid gap-3 md:grid-cols-2" key={en as string}>
      <div className="space-y-1.5">
        <Label>{label} (EN)</Label>
        {multiline ? (
          <Textarea value={content[en]} onChange={(e) => set(en, e.target.value)} rows={3} />
        ) : (
          <Input value={content[en]} onChange={(e) => set(en, e.target.value)} />
        )}
      </div>
      <div className="space-y-1.5">
        <Label>{label} (AR)</Label>
        {multiline ? (
          <Textarea dir="rtl" value={content[ar]} onChange={(e) => set(ar, e.target.value)} rows={3} />
        ) : (
          <Input dir="rtl" value={content[ar]} onChange={(e) => set(ar, e.target.value)} />
        )}
      </div>
    </div>
  );

  const pick = (en: Field, ar: Field) => (previewLang === 'ar' ? content[ar] : content[en]);

  return (
    <>
      <SEOHead title="Admin • Homepage Content" description="Edit homepage and footer text" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">Homepage Content</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-6 xl:grid-cols-2 max-w-[1400px] mx-auto">
                  {/* Editor */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Hero section</CardTitle>
                        <CardDescription>Headline highlight and call-to-action buttons</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {pair('Headline highlight', 'hero_highlight_en', 'hero_highlight_ar')}
                        {pair('Primary button', 'hero_cta_primary_en', 'hero_cta_primary_ar')}
                        <div className="space-y-1.5">
                          <Label>Primary button link</Label>
                          <Input
                            value={content.hero_cta_primary_link}
                            onChange={(e) => set('hero_cta_primary_link', e.target.value)}
                          />
                        </div>
                        {pair('Secondary button', 'hero_cta_secondary_en', 'hero_cta_secondary_ar')}
                        <div className="space-y-1.5">
                          <Label>Secondary button link</Label>
                          <Input
                            value={content.hero_cta_secondary_link}
                            onChange={(e) => set('hero_cta_secondary_link', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Highlight numbers</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label>Projects number</Label>
                          <Input value={content.stat_projects_value} onChange={(e) => set('stat_projects_value', e.target.value)} />
                        </div>
                        {pair('Projects label', 'stat_projects_en', 'stat_projects_ar')}
                        <div className="space-y-1.5">
                          <Label>Clients number</Label>
                          <Input value={content.stat_clients_value} onChange={(e) => set('stat_clients_value', e.target.value)} />
                        </div>
                        {pair('Clients label', 'stat_clients_en', 'stat_clients_ar')}
                        <div className="space-y-1.5">
                          <Label>Years number</Label>
                          <Input value={content.stat_years_value} onChange={(e) => set('stat_years_value', e.target.value)} />
                        </div>
                        {pair('Years label', 'stat_years_en', 'stat_years_ar')}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Footer</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {pair('Tagline', 'footer_tagline_en', 'footer_tagline_ar', true)}
                        {pair('Company name', 'footer_copyright_en', 'footer_copyright_ar')}
                      </CardContent>
                    </Card>

                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span className="ml-2">Save changes</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setContent(DEFAULT_HOMEPAGE_CONTENT)}
                        disabled={saving}
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span className="ml-2">Reset to defaults</span>
                      </Button>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="xl:sticky xl:top-6 xl:self-start space-y-4">
                    <Tabs value={previewLang} onValueChange={(v) => setPreviewLang(v as 'en' | 'ar')}>
                      <TabsList>
                        <TabsTrigger value="en">English preview</TabsTrigger>
                        <TabsTrigger value="ar">معاينة عربية</TabsTrigger>
                      </TabsList>
                      <TabsContent value={previewLang} className="mt-4">
                        <div dir={previewLang === 'ar' ? 'rtl' : 'ltr'} className="rounded-xl overflow-hidden border">
                          <div className="bg-gradient-hero p-8 text-white space-y-6">
                            <h2 className="text-3xl font-bold leading-tight">
                              <span className="block">
                                {previewLang === 'ar' ? 'حول عملك' : 'Transform Your Business'}
                              </span>
                              <span className="text-odoo-gold">{pick('hero_highlight_en', 'hero_highlight_ar')}</span>
                            </h2>
                            <div className="flex flex-wrap gap-3">
                              <span className="bg-odoo-gold text-odoo-purple font-bold py-3 px-6 rounded-xl">
                                {pick('hero_cta_primary_en', 'hero_cta_primary_ar')}
                              </span>
                              <span className="border-2 border-white/40 font-bold py-3 px-6 rounded-xl">
                                {pick('hero_cta_secondary_en', 'hero_cta_secondary_ar')}
                              </span>
                            </div>
                            <div className="flex gap-8 pt-2">
                              <div>
                                <div className="text-2xl font-bold text-odoo-gold">{content.stat_projects_value}</div>
                                <div className="text-xs text-white/70">{pick('stat_projects_en', 'stat_projects_ar')}</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-odoo-gold">{content.stat_clients_value}</div>
                                <div className="text-xs text-white/70">{pick('stat_clients_en', 'stat_clients_ar')}</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-odoo-gold">{content.stat_years_value}</div>
                                <div className="text-xs text-white/70">{pick('stat_years_en', 'stat_years_ar')}</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-odoo-purple text-white p-6 space-y-3">
                            <div className="text-xl font-bold">
                              Odoo<span className="text-odoo-gold">Teams</span>
                            </div>
                            <p className="text-sm text-gray-200">{pick('footer_tagline_en', 'footer_tagline_ar')}</p>
                            <p className="text-xs text-gray-300 border-t border-white/20 pt-3">
                              © {new Date().getFullYear()} {pick('footer_copyright_en', 'footer_copyright_ar')}.{' '}
                              {previewLang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
