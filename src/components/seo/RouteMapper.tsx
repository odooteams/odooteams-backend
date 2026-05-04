import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Link2 } from 'lucide-react';

const BASE = 'https://odooteams.com';

export interface RoutePattern {
  key: string;
  label: string;
  pattern: string; // e.g. /services/:slug
  source?: 'services' | 'projects' | 'blogs' | 'learn_resources' | null;
  slugField?: string;
}

export const ROUTE_PATTERNS: RoutePattern[] = [
  { key: 'home', label: 'Home', pattern: '/', source: null },
  { key: 'about', label: 'About', pattern: '/about', source: null },
  { key: 'services', label: 'Services list', pattern: '/services', source: null },
  { key: 'service-detail', label: 'Service detail', pattern: '/services/:slug', source: 'services', slugField: 'title_en' },
  { key: 'projects', label: 'Projects list', pattern: '/projects', source: null },
  { key: 'project-detail', label: 'Project detail', pattern: '/projects/:slug', source: 'projects', slugField: 'title_en' },
  { key: 'learn', label: 'Learn Odoo', pattern: '/learn-odoo', source: null },
  { key: 'resource-detail', label: 'Resource detail', pattern: '/learn-odoo/:slug', source: 'learn_resources', slugField: 'title_en' },
  { key: 'blogs', label: 'Blogs list', pattern: '/blogs', source: null },
  { key: 'blog-detail', label: 'Blog detail', pattern: '/blogs/:slug', source: 'blogs', slugField: 'slug' },
  { key: 'faqs', label: 'FAQs', pattern: '/faqs', source: null },
  { key: 'contact', label: 'Contact', pattern: '/contact', source: null },
  { key: 'custom', label: 'Custom', pattern: '', source: null },
];

const slugify = (s: string) =>
  (s || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

interface Props {
  pagePath: string;
  canonicalUrl: string;
  onChange: (next: { page_path: string; canonical_url: string }) => void;
}

export default function RouteMapper({ pagePath, canonicalUrl, onChange }: Props) {
  const [patternKey, setPatternKey] = useState<string>(() => {
    const found = ROUTE_PATTERNS.find(p => p.pattern === pagePath);
    return found?.key || 'custom';
  });
  const [slug, setSlug] = useState('');
  const [items, setItems] = useState<{ slug: string; label: string }[]>([]);

  const pattern = ROUTE_PATTERNS.find(p => p.key === patternKey) || ROUTE_PATTERNS[0];
  const isDynamic = pattern.pattern.includes(':slug');

  useEffect(() => {
    const loadItems = async () => {
      if (!pattern.source) { setItems([]); return; }
      const fields = pattern.slugField === 'slug' ? 'slug, title_en' : `${pattern.slugField}, title_en`;
      const { data } = await (supabase as any).from(pattern.source).select(fields).limit(200);
      const list = (data || []).map((r: any) => {
        const raw = r[pattern.slugField || 'title_en'];
        const s = pattern.slugField === 'slug' ? raw : slugify(raw);
        return { slug: s, label: r.title_en || s };
      }).filter((x: any) => x.slug);
      setItems(list);
    };
    loadItems();
  }, [pattern.source, pattern.slugField]);

  const buildPath = (s = slug) => {
    if (pattern.key === 'custom') return pagePath;
    if (!isDynamic) return pattern.pattern;
    return s ? pattern.pattern.replace(':slug', s) : pattern.pattern;
  };

  const apply = () => {
    const path = buildPath();
    let cleanPath = path;
    if (cleanPath.endsWith('/') && cleanPath !== '/') cleanPath = cleanPath.slice(0, -1);
    onChange({ page_path: cleanPath, canonical_url: `${BASE}${cleanPath}` });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <p className="font-medium text-sm">Route Mapper</p>
        <Badge variant="outline" className="ml-auto font-mono text-xs">{buildPath() || '/'}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Route pattern</Label>
          <Select value={patternKey} onValueChange={setPatternKey}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROUTE_PATTERNS.map(p => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label} <span className="text-muted-foreground ml-2 font-mono text-xs">{p.pattern || 'custom'}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isDynamic && (
          <div className="space-y-2">
            <Label className="text-xs">Slug</Label>
            {items.length > 0 ? (
              <Select value={slug} onValueChange={setSlug}>
                <SelectTrigger><SelectValue placeholder="Pick from content" /></SelectTrigger>
                <SelectContent>
                  {items.map(i => (
                    <SelectItem key={i.slug} value={i.slug}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-slug" />
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-muted-foreground font-mono break-all">
          Canonical: {BASE}{buildPath() || '/'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={apply}>
          Apply to page
        </Button>
      </div>

      {canonicalUrl && (
        <p className="text-xs text-muted-foreground">Current canonical: <span className="font-mono">{canonicalUrl}</span></p>
      )}
    </div>
  );
}
