/**
 * Runs before `vite dev` and `vite build` (predev/prebuild hooks).
 * Writes public/sitemap.xml with hreflang alternates for EN/AR and only
 * includes published/active rows from Supabase.
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://odooteams-backend.lovable.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://eflevjjteuxhqkwqecvv.supabase.co';
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbGV2amp0ZXV4aHFrd3FlY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjU2MzcsImV4cCI6MjA3NTM0MTYzN30.7F7Z9S31IfJLUrTZx8wje-Jomzsz4SzH9tDjE0IpPt8';

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

async function loadDynamic(): Promise<SitemapEntry[]> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const [services, projects, blogs, resources] = await Promise.all([
      supabase.from('services').select('title_en, updated_at, canonical_url, robots').eq('is_active', true),
      supabase.from('projects').select('title_en, updated_at, canonical_url, robots').eq('is_active', true),
      supabase.from('blogs').select('title_en, updated_at, canonical_url, robots').eq('is_published', true),
      supabase.from('learn_resources').select('title_en, updated_at, canonical_url, robots').eq('is_active', true),
    ]);
    const out: SitemapEntry[] = [];
    const skip = (r: any) => (r.robots || '').includes('noindex');
    services.data?.filter((r: any) => !skip(r)).forEach((r: any) =>
      out.push({ path: `/services/${slugify(r.title_en)}`, lastmod: (r.updated_at || '').split('T')[0], changefreq: 'monthly', priority: '0.7' }));
    projects.data?.filter((r: any) => !skip(r)).forEach((r: any) =>
      out.push({ path: `/projects/${slugify(r.title_en)}`, lastmod: (r.updated_at || '').split('T')[0], changefreq: 'yearly', priority: '0.6' }));
    blogs.data?.filter((r: any) => !skip(r)).forEach((r: any) =>
      out.push({ path: `/blogs/${slugify(r.title_en)}`, lastmod: (r.updated_at || '').split('T')[0], changefreq: 'monthly', priority: '0.6' }));
    resources.data?.filter((r: any) => !skip(r)).forEach((r: any) =>
      out.push({ path: `/learn-odoo/${slugify(r.title_en)}`, lastmod: (r.updated_at || '').split('T')[0], changefreq: 'monthly', priority: '0.6' }));
    return out;
  } catch (err) {
    console.warn('[sitemap] Could not fetch dynamic content — writing static-only sitemap.', err);
    return [];
  }
}

function xml(entries: SitemapEntry[]) {
  const urls = entries.map((e) => {
    const loc = `${BASE_URL}${e.path}`;
    const altEn = `${BASE_URL}${e.path}?lang=en`;
    const altAr = `${BASE_URL}${e.path}?lang=ar`;
    return [
      `  <url>`,
      `    <loc>${loc}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `    <xhtml:link rel="alternate" hreflang="en" href="${altEn}" />`,
      `    <xhtml:link rel="alternate" hreflang="ar" href="${altAr}" />`,
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
  const dynamic = await loadDynamic();
  const all = [...staticEntries, ...dynamic];
  writeFileSync(resolve('public/sitemap.xml'), xml(all));
  console.log(`sitemap.xml written (${all.length} entries — ${staticEntries.length} static, ${dynamic.length} dynamic)`);
}

main();
