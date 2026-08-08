import { useState, useEffect } from 'react';
import SEOHead from '@/components/seo/SEOHead';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Search, Globe, FileText, Activity, Download, RefreshCw, Plus, Edit, Save, Link as LinkIcon, ExternalLink, Network as NetworkIcon, Copy, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEODashboard from '@/components/seo/SEODashboard';
import SerpPreview from '@/components/seo/SerpPreview';
import RouteMapper from '@/components/seo/RouteMapper';
import { analyzeInternalLinks, type InternalLinkReport } from '@/lib/seo/internalLinks';
import { BACKLINK_PROSPECTS, OUTREACH_TEMPLATES, OFF_PAGE_CHECKLIST } from '@/lib/seo/offPage';
import ContentSeoTab from '@/components/admin/seo/ContentSeoTab';
import SitemapRobotsPanel from '@/components/admin/seo/SitemapRobotsPanel';

// ---------- Global SEO Settings Tab ----------
function GlobalSeoTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState<string | null>(null);
  const [data, setData] = useState({
    site_name: 'OdooTeams',
    title_template: '%s | OdooTeams',
    default_description: '',
    default_og_image: '',
    google_analytics_id: '',
    google_tag_manager_id: '',
    google_site_verification: '',
    twitter_handle: '@odooteams',
    default_robots: 'index, follow',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await (supabase as any)
      .from('site_settings')
      .select('*')
      .eq('setting_key', 'global_seo')
      .maybeSingle();
    if (rows) {
      setSettingId(rows.id);
      setData({ ...data, ...(rows.setting_value || {}) });
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (settingId) {
        const { error } = await (supabase as any)
          .from('site_settings')
          .update({ setting_value: data, is_active: true })
          .eq('id', settingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('site_settings')
          .insert({ setting_key: 'global_seo', setting_type: 'seo', setting_value: data, is_active: true });
        if (error) throw error;
      }
      toast.success('Global SEO settings saved');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global SEO Settings</CardTitle>
        <CardDescription>Site-wide defaults applied to every page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input value={data.site_name} onChange={e => setData({ ...data, site_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Title Template (%s = page title)</Label>
            <Input value={data.title_template} onChange={e => setData({ ...data, title_template: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Default Meta Description</Label>
          <Textarea rows={3} maxLength={160} value={data.default_description} onChange={e => setData({ ...data, default_description: e.target.value })} />
          <p className="text-xs text-muted-foreground">{data.default_description.length}/160</p>
        </div>
        <div className="space-y-2">
          <Label>Default Open Graph Image URL</Label>
          <Input value={data.default_og_image} onChange={e => setData({ ...data, default_og_image: e.target.value })} placeholder="https://..." />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Google Analytics ID</Label>
            <Input value={data.google_analytics_id} onChange={e => setData({ ...data, google_analytics_id: e.target.value })} placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label>Google Tag Manager ID</Label>
            <Input value={data.google_tag_manager_id} onChange={e => setData({ ...data, google_tag_manager_id: e.target.value })} placeholder="GTM-XXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label>Google Site Verification</Label>
            <Input value={data.google_site_verification} onChange={e => setData({ ...data, google_site_verification: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Twitter Handle</Label>
            <Input value={data.twitter_handle} onChange={e => setData({ ...data, twitter_handle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Default Robots Directive</Label>
            <Input value={data.default_robots} onChange={e => setData({ ...data, default_robots: e.target.value })} />
          </div>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- Per-Page SEO Tab ----------
interface PageSeoRow {
  id: string;
  page_key: string;
  page_path: string;
  title_en: string | null;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  keywords_en: string | null;
  keywords_ar: string | null;
  og_image: string | null;
  robots: string | null;
  canonical_url: string | null;
  is_active: boolean;
}

function PageSeoEditor({ row, onSaved }: { row?: PageSeoRow; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<PageSeoRow>>(row || { is_active: true, robots: 'index, follow' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.page_key || !form.page_path) {
      toast.error('Page key and path are required');
      return;
    }
    setSaving(true);
    try {
      if (row?.id) {
        const { error } = await (supabase as any).from('page_seo').update(form).eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('page_seo').insert(form);
        if (error) throw error;
      }
      toast.success('Page SEO saved');
      setOpen(false);
      onSaved();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {row ? (
          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" /> Add Page</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{row ? 'Edit' : 'Add'} Page SEO</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page Key *</Label>
              <Input value={form.page_key || ''} onChange={e => setForm({ ...form, page_key: e.target.value })} placeholder="home" />
            </div>
            <div className="space-y-2">
              <Label>Page Path *</Label>
              <Input value={form.page_path || ''} onChange={e => setForm({ ...form, page_path: e.target.value })} placeholder="/" />
            </div>
          </div>
          <RouteMapper
            pagePath={form.page_path || ''}
            canonicalUrl={form.canonical_url || ''}
            onChange={({ page_path, canonical_url }) => setForm({ ...form, page_path, canonical_url })}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (EN) — {(form.title_en || '').length}/60</Label>
              <Input maxLength={70} value={form.title_en || ''} onChange={e => setForm({ ...form, title_en: e.target.value })} />
            </div>
            <div className="space-y-2" dir="rtl">
              <Label>Title (AR) — {(form.title_ar || '').length}/60</Label>
              <Input maxLength={70} value={form.title_ar || ''} onChange={e => setForm({ ...form, title_ar: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description (EN) — {(form.description_en || '').length}/160</Label>
              <Textarea rows={3} maxLength={170} value={form.description_en || ''} onChange={e => setForm({ ...form, description_en: e.target.value })} />
            </div>
            <div className="space-y-2" dir="rtl">
              <Label>Description (AR) — {(form.description_ar || '').length}/160</Label>
              <Textarea rows={3} maxLength={170} value={form.description_ar || ''} onChange={e => setForm({ ...form, description_ar: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Keywords (EN, comma-separated)</Label>
              <Input value={form.keywords_en || ''} onChange={e => setForm({ ...form, keywords_en: e.target.value })} />
            </div>
            <div className="space-y-2" dir="rtl">
              <Label>Keywords (AR)</Label>
              <Input value={form.keywords_ar || ''} onChange={e => setForm({ ...form, keywords_ar: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Open Graph Image URL</Label>
            <Input value={form.og_image || ''} onChange={e => setForm({ ...form, og_image: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Robots</Label>
              <Input value={form.robots || ''} onChange={e => setForm({ ...form, robots: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Canonical URL (optional)</Label>
              <Input value={form.canonical_url || ''} onChange={e => setForm({ ...form, canonical_url: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={!!form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
            <Label>Active</Label>
          </div>

        </div>
        <DialogFooter>
          <SerpPreview data={form as any} />
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PerPageSeoTab() {
  const [rows, setRows] = useState<PageSeoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('page_seo').select('*').order('page_path');
    setRows((data as PageSeoRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.page_key.toLowerCase().includes(search.toLowerCase()) ||
    r.page_path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Per-Page SEO</CardTitle>
            <CardDescription>Manage SEO metadata for each page (bilingual)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 w-64" placeholder="Search pages..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <PageSeoEditor onSaved={load} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.page_key}</TableCell>
                  <TableCell className="font-mono text-xs">{r.page_path}</TableCell>
                  <TableCell className="max-w-xs truncate">{r.title_en}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_active ? 'default' : 'secondary'}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PageSeoEditor row={r} onSaved={load} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Sitemap & Robots Tab ----------
function SitemapTab() {
  const [stats, setStats] = useState({ pages: 0, services: 0, projects: 0, blogs: 0, resources: 0 });
  const [robotsContent, setRobotsContent] = useState(`User-agent: *
Allow: /

Disallow: /admin/
Disallow: /dashboard/

Sitemap: https://odooteams.com/sitemap.xml
`);

  const refresh = async () => {
    const [s, p, b, r, ps] = await Promise.all([
      (supabase as any).from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
      (supabase as any).from('projects').select('*', { count: 'exact', head: true }).eq('is_active', true),
      (supabase as any).from('blogs').select('*', { count: 'exact', head: true }).eq('is_published', true),
      (supabase as any).from('learn_resources').select('*', { count: 'exact', head: true }).eq('is_active', true),
      (supabase as any).from('page_seo').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);
    setStats({
      pages: ps.count || 0,
      services: s.count || 0,
      projects: p.count || 0,
      blogs: b.count || 0,
      resources: r.count || 0,
    });
  };

  useEffect(() => { refresh(); }, []);

  const total = stats.pages + stats.services + stats.projects + stats.blogs + stats.resources;

  const generateSitemapXml = async () => {
    const base = 'https://odooteams.com';
    const today = new Date().toISOString().split('T')[0];
    const urls: string[] = [];
    const { data: pages } = await (supabase as any).from('page_seo').select('page_path').eq('is_active', true);
    const { data: services } = await (supabase as any).from('services').select('title_en, updated_at').eq('is_active', true);
    const { data: projects } = await (supabase as any).from('projects').select('title_en, updated_at').eq('is_active', true);

    pages?.forEach((p: any) => urls.push(`<url><loc>${base}${p.page_path}</loc><lastmod>${today}</lastmod></url>`));
    services?.forEach((s: any) => {
      const slug = s.title_en?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      urls.push(`<url><loc>${base}/services/${slug}</loc><lastmod>${(s.updated_at || today).split('T')[0]}</lastmod></url>`);
    });
    projects?.forEach((p: any) => {
      const slug = p.title_en?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      urls.push(`<url><loc>${base}/projects/${slug}</loc><lastmod>${(p.updated_at || today).split('T')[0]}</lastmod></url>`);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sitemap downloaded');
  };

  const downloadRobots = () => {
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('robots.txt downloaded');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sitemap</CardTitle>
              <CardDescription>Aggregated URL counts and generated XML sitemap</CardDescription>
            </div>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{v}</div>
                <div className="text-xs text-muted-foreground capitalize">{k}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="font-medium">Total URLs: {total}</p>
              <p className="text-xs text-muted-foreground">Upload generated file to /public/sitemap.xml</p>
            </div>
            <Button onClick={generateSitemapXml}>
              <Download className="h-4 w-4 mr-2" /> Generate & Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>robots.txt</CardTitle>
          <CardDescription>Control which crawlers can access which URLs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea rows={10} className="font-mono text-sm" value={robotsContent} onChange={e => setRobotsContent(e.target.value)} />
          <Button onClick={downloadRobots}>
            <Download className="h-4 w-4 mr-2" /> Download robots.txt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Internal Links Tab ----------
function InternalLinksTab() {
  const [baseUrl, setBaseUrl] = useState('https://odooteams.com');
  const [routes, setRoutes] = useState(['/', '/about', '/services', '/projects', '/learn-odoo', '/faqs', '/contact'].join('\n'));
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [report, setReport] = useState<InternalLinkReport | null>(null);

  const run = async () => {
    setLoading(true);
    setReport(null);
    try {
      const list = routes.split('\n').map(r => r.trim()).filter(Boolean);
      const out = await analyzeInternalLinks(baseUrl, list, setProgress);
      setReport(out);
      toast.success(`Analyzed ${list.length} pages`);
    } catch (e: any) {
      toast.error(e.message || 'Failed (CORS?)');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internal Link Analyzer</CardTitle>
          <CardDescription>
            Crawls each route, counts outbound internal vs external links, surfaces orphan pages and top anchor text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Routes (one per line)</Label>
              <Textarea rows={6} value={routes} onChange={e => setRoutes(e.target.value)} className="font-mono text-xs" />
            </div>
          </div>
          <Button onClick={run} disabled={loading}>
            <NetworkIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Analyzing…' : 'Analyze Internal Links'}
          </Button>
          {progress && <p className="text-xs text-muted-foreground">{progress}</p>}
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="border rounded p-3 text-center">
              <div className="text-2xl font-bold">{report.pages.length}</div>
              <div className="text-xs text-muted-foreground">Pages</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-2xl font-bold">{report.averageInternal.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Avg internal links/page</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className={`text-2xl font-bold ${report.orphans.length ? 'text-orange-600' : 'text-green-600'}`}>{report.orphans.length}</div>
              <div className="text-xs text-muted-foreground">Orphan pages</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-2xl font-bold">{Object.keys(report.externalDomains).length}</div>
              <div className="text-xs text-muted-foreground">External domains</div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Per-page metrics</CardTitle>
              <CardDescription>Inbound counts come from the scanned set only.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Inbound</TableHead>
                    <TableHead>Outbound internal</TableHead>
                    <TableHead>External</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>H1</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.pages.map(p => {
                    const key = p.url.replace(/\/$/, '') || '/';
                    const inbound = report.inbound[key] ?? 0;
                    return (
                      <TableRow key={p.url}>
                        <TableCell className="font-mono text-xs">{p.url}</TableCell>
                        <TableCell>
                          <Badge variant={inbound === 0 ? 'destructive' : 'default'}>{inbound}</Badge>
                        </TableCell>
                        <TableCell>{p.internalLinks.length}</TableCell>
                        <TableCell>{p.externalLinks.length}</TableCell>
                        <TableCell>{p.wordCount}</TableCell>
                        <TableCell>
                          <Badge variant={p.h1Count === 1 ? 'default' : 'destructive'}>{p.h1Count}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {report.orphans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Orphan pages</CardTitle>
                <CardDescription>No internal links point to these. Add contextual links from related pages.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {report.orphans.map(o => <Badge key={o} variant="destructive">{o}</Badge>)}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Top anchor text</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {report.topAnchors.map(a => (
                <Badge key={a.anchor} variant="secondary">{a.anchor} · {a.count}</Badge>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ---------- Off-Page SEO Tab ----------
function OffPageTab() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const done = OFF_PAGE_CHECKLIST.filter(i => checked[i.id]).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Off-Page SEO Checklist</CardTitle>
          <CardDescription>{done}/{OFF_PAGE_CHECKLIST.length} complete — work through these to grow authority signals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {OFF_PAGE_CHECKLIST.map(item => (
            <label key={item.id} className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50 cursor-pointer">
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={e => setChecked({ ...checked, [item.id]: e.target.checked })}
              />
              <span className="flex-1 text-sm">{item.label}</span>
              <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                {item.priority}
              </Badge>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backlink Prospects</CardTitle>
          <CardDescription>High-relevance directories, forums, and publications for Odoo/ERP outreach.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BACKLINK_PROSPECTS.map(p => (
                <TableRow key={p.url}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-xs">{p.category}</TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={p.authority === 'high' ? 'default' : p.authority === 'medium' ? 'secondary' : 'outline'}>
                      {p.authority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-md">{p.notes}</TableCell>
                  <TableCell>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outreach Email Templates</CardTitle>
          <CardDescription>Copy, fill in the variables, and send.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(OUTREACH_TEMPLATES).map(([key, body]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Button variant="outline" size="sm" onClick={() => copy(body)}>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
              <Textarea rows={10} readOnly value={body} className="font-mono text-xs" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


// ---------- Main Page ----------
export default function AdminSEO() {
  return (
    <>
      <SEOHead title="Admin • SEO Management" description="Manage SEO settings, page metadata, and sitemaps" />
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4">SEO Management</h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                <Tabs defaultValue="dashboard">
                  <div className="w-full overflow-x-auto -mx-1 px-1 pb-1">
                    <TabsList className="inline-flex w-max md:grid md:grid-cols-7 md:w-full max-w-6xl">
                      <TabsTrigger value="dashboard" className="whitespace-nowrap"><Activity className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
                      <TabsTrigger value="global" className="whitespace-nowrap"><Globe className="h-4 w-4 mr-2" />Global</TabsTrigger>
                      <TabsTrigger value="pages" className="whitespace-nowrap"><FileText className="h-4 w-4 mr-2" />Pages</TabsTrigger>
                      <TabsTrigger value="content" className="whitespace-nowrap"><Package className="h-4 w-4 mr-2" />Content SEO</TabsTrigger>
                      <TabsTrigger value="internal" className="whitespace-nowrap"><LinkIcon className="h-4 w-4 mr-2" />Internal Links</TabsTrigger>
                      <TabsTrigger value="offpage" className="whitespace-nowrap"><ExternalLink className="h-4 w-4 mr-2" />Off-Page</TabsTrigger>
                      <TabsTrigger value="sitemap" className="whitespace-nowrap"><Search className="h-4 w-4 mr-2" />Sitemap</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="dashboard" className="mt-6"><SEODashboard /></TabsContent>
                  <TabsContent value="global" className="mt-6"><GlobalSeoTab /></TabsContent>
                  <TabsContent value="pages" className="mt-6"><PerPageSeoTab /></TabsContent>
                  <TabsContent value="content" className="mt-6"><ContentSeoTab /></TabsContent>
                  <TabsContent value="internal" className="mt-6"><InternalLinksTab /></TabsContent>
                  <TabsContent value="offpage" className="mt-6"><OffPageTab /></TabsContent>
                  <TabsContent value="sitemap" className="mt-6 space-y-6">
                    <SitemapRobotsPanel />
                    <SitemapTab />
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
