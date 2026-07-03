import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, Search, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import SerpPreview from '@/components/seo/SerpPreview';
import { SCHEMA_TYPES, SchemaType, buildJsonLd, requiredFields, SERP_LIMITS, lengthStatus } from '@/lib/seo/schemaTemplates';

type EntityType = 'services' | 'projects' | 'blogs' | 'learn_resources';

const ENTITY_CONFIG: Record<EntityType, { label: string; slugSource: 'title_en'; routePrefix: string }> = {
  services: { label: 'Services', slugSource: 'title_en', routePrefix: '/services' },
  projects: { label: 'Projects', slugSource: 'title_en', routePrefix: '/projects' },
  blogs: { label: 'Blogs', slugSource: 'title_en', routePrefix: '/blogs' },
  learn_resources: { label: 'Learn Resources', slugSource: 'title_en', routePrefix: '/learn-odoo' },
};

interface Row {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  image?: string | null;
  images?: string[] | null;
  seo_title_en: string | null;
  seo_title_ar: string | null;
  seo_description_en: string | null;
  seo_description_ar: string | null;
  seo_keywords_en: string | null;
  seo_keywords_ar: string | null;
  focus_keyword_en: string | null;
  focus_keyword_ar: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots: string | null;
  structured_data: any;
  schema_type: string | null;
  updated_at?: string;
}

function LenBadge({ value, locale, kind }: { value: string; locale: 'en' | 'ar'; kind: 'title' | 'desc' }) {
  const status = lengthStatus(value, locale, kind);
  const l = SERP_LIMITS[locale];
  const max = kind === 'title' ? l.titleMax : l.descMax;
  const min = kind === 'title' ? l.titleMin : l.descMin;
  const len = (value || '').length;
  if (status === 'ok') return <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />{len}/{max}</span>;
  if (status === 'empty') return <span className="inline-flex items-center gap-1 text-red-500 text-xs"><AlertTriangle className="h-3 w-3" />missing</span>;
  if (status === 'long') return <span className="inline-flex items-center gap-1 text-red-500 text-xs"><AlertTriangle className="h-3 w-3" />{len}/{max} truncates</span>;
  return <span className="inline-flex items-center gap-1 text-orange-500 text-xs"><AlertTriangle className="h-3 w-3" />{len}/{max} · under {min}</span>;
}

function slugify(s: string) {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function scoreSeo(r: Partial<Row>) {
  let s = 0;
  if (r.seo_title_en && r.seo_title_en.length >= 30 && r.seo_title_en.length <= 60) s += 20;
  else if (r.seo_title_en) s += 10;
  if (r.seo_description_en && r.seo_description_en.length >= 100 && r.seo_description_en.length <= 160) s += 20;
  else if (r.seo_description_en) s += 10;
  if (r.seo_title_ar) s += 10;
  if (r.seo_description_ar) s += 10;
  if (r.focus_keyword_en) s += 10;
  if (r.seo_keywords_en) s += 10;
  if (r.og_image) s += 10;
  if (r.canonical_url) s += 10;
  return Math.min(s, 100);
}

function Editor({ table, row, onSaved, onClose }: { table: EntityType; row: Row; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<Row>(row);
  const [saving, setSaving] = useState(false);
  const cfg = ENTITY_CONFIG[table];

  const autoSlug = slugify(form.title_en || '');
  const suggestedCanonical = `https://odooteams.com${cfg.routePrefix}/${autoSlug}`;

  const generate = () => {
    const kw = form.focus_keyword_en || form.title_en || '';
    const kwAr = form.focus_keyword_ar || form.title_ar || '';
    setForm(f => ({
      ...f,
      seo_title_en: f.seo_title_en || `${f.title_en} | OdooTeams`.slice(0, 60),
      seo_title_ar: f.seo_title_ar || `${f.title_ar} | أودو تيمز`.slice(0, 60),
      seo_description_en: f.seo_description_en || `Discover ${kw}. Expert Odoo ERP solutions by OdooTeams — implementation, customization & support.`.slice(0, 160),
      seo_description_ar: f.seo_description_ar || `اكتشف ${kwAr}. حلول Odoo ERP احترافية من أودو تيمز — تطبيق وتخصيص ودعم.`.slice(0, 160),
      canonical_url: f.canonical_url || suggestedCanonical,
      og_image: f.og_image || (Array.isArray((f as any).images) ? (f as any).images?.[0] : (f as any).image) || '',
    }));
    toast.success('AI-assisted SEO drafted — review & save');
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = {
        seo_title_en: form.seo_title_en,
        seo_title_ar: form.seo_title_ar,
        seo_description_en: form.seo_description_en,
        seo_description_ar: form.seo_description_ar,
        seo_keywords_en: form.seo_keywords_en,
        seo_keywords_ar: form.seo_keywords_ar,
        focus_keyword_en: form.focus_keyword_en,
        focus_keyword_ar: form.focus_keyword_ar,
        og_image: form.og_image,
        canonical_url: form.canonical_url,
        robots: form.robots || 'index, follow',
        structured_data: form.structured_data,
        schema_type: form.schema_type,
      };
      const { error } = await (supabase as any).from(table).update(payload).eq('id', form.id);
      if (error) throw error;
      toast.success('SEO saved');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const schemaType = (form.schema_type as SchemaType) || (table === 'services' ? 'Service' : table === 'projects' ? 'CreativeWork' : 'Article');

  const autoBuildJsonLd = () => {
    const jsonEn = buildJsonLd({
      type: schemaType,
      locale: 'en',
      name: form.seo_title_en || form.title_en || '',
      description: form.seo_description_en || '',
      url: form.canonical_url || suggestedCanonical,
      image: form.og_image || (Array.isArray((form as any).images) ? (form as any).images?.[0] : (form as any).image) || null,
      keywords: form.seo_keywords_en || form.focus_keyword_en,
    });
    const jsonAr = buildJsonLd({
      type: schemaType,
      locale: 'ar',
      name: form.seo_title_ar || form.title_ar || '',
      description: form.seo_description_ar || '',
      url: form.canonical_url || suggestedCanonical,
      image: form.og_image || (Array.isArray((form as any).images) ? (form as any).images?.[0] : (form as any).image) || null,
      keywords: form.seo_keywords_ar || form.focus_keyword_ar,
    });
    setForm(f => ({ ...f, structured_data: [jsonEn, jsonAr] }));
    toast.success(`JSON-LD (${schemaType}) generated for EN & AR — review & save`);
  };

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            SEO — {form.title_en || form.title_ar}
            <Badge variant="outline">{cfg.label}</Badge>
            <Badge variant="secondary">{schemaType}</Badge>
            <Badge variant={scoreSeo(form) >= 80 ? 'default' : scoreSeo(form) >= 50 ? 'secondary' : 'destructive'}>
              Score {scoreSeo(form)}/100
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={generate}>
              <Sparkles className="h-4 w-4 mr-2" /> Auto-fill from title
            </Button>
            <Button variant="outline" size="sm" onClick={autoBuildJsonLd}>
              <Sparkles className="h-4 w-4 mr-2" /> Build JSON-LD ({schemaType})
            </Button>
            <span className="text-xs text-muted-foreground">Suggested slug: <code>{autoSlug}</code></span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Schema Type (schema.org)</Label>
              <Select value={schemaType} onValueChange={v => setForm({ ...form, schema_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCHEMA_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label} — <span className="text-muted-foreground">{t.description}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Required fields: <code>{requiredFields(schemaType).join(', ')}</code></p>
            </div>
            <div className="space-y-2">
              <Label>Canonical URL (self-reference)</Label>
              <Input value={form.canonical_url || ''} onChange={e => setForm({ ...form, canonical_url: e.target.value })} placeholder={suggestedCanonical} />
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span>hreflang <code>en</code> → <code>{(form.canonical_url || suggestedCanonical) + '?lang=en'}</code></span>
                <span>hreflang <code>ar</code> → <code>{(form.canonical_url || suggestedCanonical) + '?lang=ar'}</code></span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, canonical_url: suggestedCanonical })}>Use suggested</Button>
            </div>
          </div>


          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Focus Keyword (EN)</Label>
              <Input value={form.focus_keyword_en || ''} onChange={e => setForm({ ...form, focus_keyword_en: e.target.value })} placeholder="e.g. Odoo ERP implementation" />
            </div>
            <div className="space-y-2" dir="rtl">
              <Label>الكلمة المفتاحية الرئيسية (AR)</Label>
              <Input value={form.focus_keyword_ar || ''} onChange={e => setForm({ ...form, focus_keyword_ar: e.target.value })} placeholder="مثال: تطبيق نظام Odoo" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SEO Title (EN) — <span className={titleEnLen > 60 || titleEnLen < 30 ? 'text-orange-500' : 'text-green-600'}>{titleEnLen}/60</span></Label>
              <Input maxLength={70} value={form.seo_title_en || ''} onChange={e => setForm({ ...form, seo_title_en: e.target.value })} />
            </div>
            <div className="space-y-2" dir="rtl">
              <Label>عنوان SEO (AR) — <span className={titleArLen > 60 || titleArLen < 30 ? 'text-orange-500' : 'text-green-600'}>{titleArLen}/60</span></Label>
              <Input maxLength={70} value={form.seo_title_ar || ''} onChange={e => setForm({ ...form, seo_title_ar: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meta Description (EN) — <span className={descEnLen > 160 || descEnLen < 100 ? 'text-orange-500' : 'text-green-600'}>{descEnLen}/160</span></Label>
              <Textarea rows={3} maxLength={170} value={form.seo_description_en || ''} onChange={e => setForm({ ...form, seo_description_en: e.target.value })} />
            </div>
            <div className="space-y-2" dir="rtl">
              <Label>وصف Meta (AR) — <span className={descArLen > 160 || descArLen < 100 ? 'text-orange-500' : 'text-green-600'}>{descArLen}/160</span></Label>
              <Textarea rows={3} maxLength={170} value={form.seo_description_ar || ''} onChange={e => setForm({ ...form, seo_description_ar: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Keywords (EN, comma-separated)</Label>
              <Input value={form.seo_keywords_en || ''} onChange={e => setForm({ ...form, seo_keywords_en: e.target.value })} />
            </div>
            <div className="space-y-2" dir="rtl">
              <Label>الكلمات المفتاحية (AR)</Label>
              <Input value={form.seo_keywords_ar || ''} onChange={e => setForm({ ...form, seo_keywords_ar: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Open Graph / Social Image URL</Label>
              <Input value={form.og_image || ''} onChange={e => setForm({ ...form, og_image: e.target.value })} placeholder="https://..." />
              {form.og_image && <img src={form.og_image} alt="og preview" className="rounded border max-h-32 object-cover" />}
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input value={form.canonical_url || ''} onChange={e => setForm({ ...form, canonical_url: e.target.value })} placeholder={suggestedCanonical} />
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, canonical_url: suggestedCanonical })}>
                Use suggested
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Robots Directive</Label>
              <Select value={form.robots || 'index, follow'} onValueChange={v => setForm({ ...form, robots: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="index, follow">index, follow (default)</SelectItem>
                  <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                  <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                  <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Structured Data (JSON-LD) — optional</Label>
              <Textarea
                rows={4}
                className="font-mono text-xs"
                placeholder='{"@context":"https://schema.org","@type":"Product",...}'
                value={form.structured_data ? JSON.stringify(form.structured_data, null, 2) : ''}
                onChange={e => {
                  try {
                    setForm({ ...form, structured_data: e.target.value ? JSON.parse(e.target.value) : null });
                  } catch {
                    setForm({ ...form, structured_data: e.target.value as any });
                  }
                }}
              />
            </div>
          </div>

          <div className="border rounded-lg p-3 bg-muted/30">
            <Label className="text-xs text-muted-foreground mb-2 block">Live SERP Preview (EN)</Label>
            <SerpPreview data={{
              title_en: form.seo_title_en,
              description_en: form.seo_description_en,
              page_path: `${cfg.routePrefix}/${autoSlug}`,
            } as any} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />{saving ? 'Saving…' : 'Save SEO'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EntityList({ table }: { table: EntityType }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);

  const load = async () => {
    setLoading(true);
    const cols = 'id,title_en,title_ar,seo_title_en,seo_title_ar,seo_description_en,seo_description_ar,seo_keywords_en,seo_keywords_ar,focus_keyword_en,focus_keyword_ar,og_image,canonical_url,robots,structured_data,updated_at' +
      (table === 'services' || table === 'blogs' || table === 'learn_resources' ? ',image' : '') +
      (table === 'projects' ? ',images' : '');
    const { data, error } = await (supabase as any).from(table).select(cols).order('updated_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [table]);

  const filtered = useMemo(
    () => rows.filter(r =>
      (r.title_en || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.title_ar || '').includes(search)
    ),
    [rows, search]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by title (EN/AR)..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Badge variant="secondary">{filtered.length} items</Badge>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>SEO Title (EN)</TableHead>
                <TableHead>SEO Title (AR)</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Robots</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => {
                const score = scoreSeo(r);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      <div className="truncate">{r.title_en}</div>
                      <div className="text-xs text-muted-foreground truncate" dir="rtl">{r.title_ar}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs">{r.seo_title_en || <span className="text-muted-foreground">— missing —</span>}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs" dir="rtl">{r.seo_title_ar || <span className="text-muted-foreground">— missing —</span>}</TableCell>
                    <TableCell>
                      <Badge variant={score >= 80 ? 'default' : score >= 50 ? 'secondary' : 'destructive'}>{score}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.robots || 'index, follow'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(r)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No items</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && <Editor table={table} row={editing} onSaved={load} onClose={() => setEditing(null)} />}
    </div>
  );
}

export default function ContentSeoTab() {
  const [tab, setTab] = useState<EntityType>('services');
  return (
    <Card>
      <CardHeader>
        <CardTitle>Per-Item SEO (Services, Projects, Blogs, Resources)</CardTitle>
        <CardDescription>
          Manage bilingual SEO for every product/service/article: focus keyword, meta title & description, Open Graph image, canonical URL, robots directive, and JSON-LD structured data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as EntityType)}>
          <div className="w-full overflow-x-auto pb-1">
            <TabsList className="inline-flex w-max">
              {Object.entries(ENTITY_CONFIG).map(([k, v]) => (
                <TabsTrigger key={k} value={k} className="whitespace-nowrap">{v.label}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          {Object.keys(ENTITY_CONFIG).map(k => (
            <TabsContent key={k} value={k} className="mt-4">
              <EntityList table={k as EntityType} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
