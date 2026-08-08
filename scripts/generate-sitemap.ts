/**
 * Runs before `vite dev` and `vite build` (predev/prebuild hooks).
 * Writes public/sitemap.xml with hreflang alternates for EN/AR and only
 * includes published/active rows from Supabase.
 *
 * Reads under the anon role, so the public RLS SELECT policies must allow it.
 * Any source failure is reported loudly (and fails the build in CI) instead of
 * silently producing a static-only sitemap.
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://odooteams.com';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://eflevjjteuxhqkwqecvv.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbGV2amp0ZXV4aHFrd3FlY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjU2MzcsImV4cCI6MjA3NTM0MTYzN30.7F7Z9S31IfJLUrTZx8wje-Jomzsz4SzH9tDjE0IpPt8';

const PAGE_SIZE = 1000;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'weekly', priority: '0.9' },
  { path: '/services', changefreq: 'weekly', priority: '0.9' },
  { path: '/projects', changefreq: 'weekly', priority: '0.8' },
  { path: '/learn-odoo', changefreq: 'weekly', priority: '0.8' },
  { path: '/faqs', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
];

function slugify(s: string) {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

/** Page past the 1000-row PostgREST cap so nothing is silently dropped. */
async function fetchAll(table: string, flag: string) {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select('title_en, updated_at, canonical_url, robots')
      .eq(flag, true)
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

const SOURCES = [
  { table: 'services', flag: 'is_active', prefix: '/services', changefreq: 'monthly' as const, priority: '0.7' },
  { table: 'projects', flag: 'is_active', prefix: '/projects', changefreq: 'yearly' as const, priority: '0.6' },
  { table: 'blogs', flag: 'is_published', prefix: '/blogs', changefreq: 'monthly' as const, priority: '0.6' },
  { table: 'learn_resources', flag: 'is_active', prefix: '/learn-odoo', changefreq: 'monthly' as const, priority: '0.6' },
];

async function loadDynamic(): Promise<{ entries: SitemapEntry[]; errors: string[] }> {
  const entries: SitemapEntry[] = [];
  const errors: string[] = [];
  for (const s of SOURCES) {
    try {
      const rows = await fetchAll(s.table, s.flag);
      let added = 0;
      for (const r of rows) {
        if ((r.robots || '').includes('noindex')) continue;
        const slug = slugify(r.title_en);
        if (!slug) continue;
        entries.push({
          path: `${s.prefix}/${slug}`,
          lastmod: (r.updated_at || '').split('T')[0] || undefined,
          changefreq: s.changefreq,
          priority: s.priority,
        });
        added++;
      }
      console.log(`[sitemap] ${s.table}: ${added}/${rows.length} rows included`);
    } catch (err: any) {
      const msg = err?.message || String(err);
      errors.push(msg);
      console.error(`[sitemap] FAILED to read ${s.table}: ${msg}`);
    }
  }
  return { entries, errors };
}

function xml(entries: SitemapEntry[]) {
  const urls = entries.map((e) => {
    const loc = `${BASE_URL}${e.path}`;
    return [
      `  <url>`,
      `    <loc>${loc}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `    <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en" />`,
      `    <xhtml:link rel="alternate" hreflang="ar" href="${loc}?lang=ar" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`,
      `  </url>`,
    ].filter(Boolean).join('\n');
  });
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
  ].join('\n');
}

async function main() {
  const { entries: dynamic, errors } = await loadDynamic();
  const all = [...staticEntries, ...dynamic];
  writeFileSync(resolve('public/sitemap.xml'), xml(all));
  console.log(`sitemap.xml written (${all.length} entries — ${staticEntries.length} static, ${dynamic.length} dynamic)`);

  if (errors.length) {
    console.error(`[sitemap] ${errors.length} source(s) failed — dynamic URLs may be missing.`);
    if (process.env.CI) process.exit(1);
  } else if (dynamic.length === 0) {
    console.warn('[sitemap] No dynamic URLs found. Check that public read policies allow the anon role.');
  }
}

main();
