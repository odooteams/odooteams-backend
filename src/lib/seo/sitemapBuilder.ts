/**
 * Shared browser-side sitemap building + robots.txt validation helpers.
 * Used by the admin SEO page (Sitemap tab) so admins can regenerate and
 * validate crawlability artifacts without a redeploy.
 */
import { supabase } from '@/integrations/supabase/client';

export const SITE_BASE_URL = 'https://odooteams.com';

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  source: 'static' | 'services' | 'projects' | 'blogs' | 'learn_resources' | 'page_seo';
  canonical?: string | null;
  robots?: string | null;
  titleEn?: string | null;
  titleAr?: string | null;
}

export const STATIC_ENTRIES: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0', source: 'static' },
  { path: '/about', changefreq: 'weekly', priority: '0.9', source: 'static' },
  { path: '/services', changefreq: 'weekly', priority: '0.9', source: 'static' },
  { path: '/projects', changefreq: 'weekly', priority: '0.8', source: 'static' },
  { path: '/learn-odoo', changefreq: 'weekly', priority: '0.8', source: 'static' },
  { path: '/faqs', changefreq: 'monthly', priority: '0.7', source: 'static' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6', source: 'static' },
];

export function slugify(value: string | null | undefined) {
  return (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const PAGE_SIZE = 1000;

/** Fetch every row of a table, paging past the 1000-row PostgREST cap. */
async function fetchAll(table: string, columns: string, filter: { col: string; value: boolean }) {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await (supabase as any)
      .from(table)
      .select(columns)
      .eq(filter.col, filter.value)
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

const COLUMNS =
  'title_en, title_ar, updated_at, canonical_url, robots, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar';

export async function collectSitemapEntries(): Promise<{ entries: SitemapEntry[]; errors: string[] }> {
  const errors: string[] = [];
  const entries: SitemapEntry[] = [...STATIC_ENTRIES];

  const sources: Array<{ table: string; flag: string; prefix: string; source: SitemapEntry['source']; changefreq: string; priority: string }> = [
    { table: 'services', flag: 'is_active', prefix: '/services', source: 'services', changefreq: 'monthly', priority: '0.7' },
    { table: 'projects', flag: 'is_active', prefix: '/projects', source: 'projects', changefreq: 'yearly', priority: '0.6' },
    { table: 'blogs', flag: 'is_published', prefix: '/blogs', source: 'blogs', changefreq: 'monthly', priority: '0.6' },
    { table: 'learn_resources', flag: 'is_active', prefix: '/learn-odoo', source: 'learn_resources', changefreq: 'monthly', priority: '0.6' },
  ];

  await Promise.all(
    sources.map(async (s) => {
      try {
        const rows = await fetchAll(s.table, COLUMNS, { col: s.flag, value: true });
        rows.forEach((r) => {
          if ((r.robots || '').includes('noindex')) return;
          entries.push({
            path: `${s.prefix}/${slugify(r.title_en)}`,
            lastmod: (r.updated_at || '').split('T')[0] || undefined,
            changefreq: s.changefreq,
            priority: s.priority,
            source: s.source,
            canonical: r.canonical_url,
            robots: r.robots,
            titleEn: r.title_en,
            titleAr: r.title_ar,
          });
        });
      } catch (err: any) {
        errors.push(err?.message || String(err));
      }
    })
  );

  return { entries, errors };
}

export function buildSitemapXml(entries: SitemapEntry[], base = SITE_BASE_URL) {
  const urls = entries.map((e) => {
    const loc = `${base}${e.path}`;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `    <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en" />`,
      `    <xhtml:link rel="alternate" hreflang="ar" href="${loc}?lang=ar" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

/* ------------------------------ robots.txt ------------------------------ */

export interface RobotsIssue {
  level: 'error' | 'warning' | 'ok';
  message: string;
}

export function validateRobots(content: string, base = SITE_BASE_URL): RobotsIssue[] {
  const issues: RobotsIssue[] = [];
  const lines = content.split('\n').map((l) => l.trim());
  const nonEmpty = lines.filter((l) => l && !l.startsWith('#'));

  if (!nonEmpty.length) {
    return [{ level: 'error', message: 'robots.txt is empty — crawlers get no directives.' }];
  }

  const hasUserAgent = nonEmpty.some((l) => /^user-agent:/i.test(l));
  if (!hasUserAgent) issues.push({ level: 'error', message: 'No "User-agent:" directive found.' });

  const blocksAll = nonEmpty.some((l) => /^disallow:\s*\/$/i.test(l));
  if (blocksAll) issues.push({ level: 'error', message: 'A "Disallow: /" rule blocks the entire site from indexing.' });

  const sitemapLines = nonEmpty.filter((l) => /^sitemap:/i.test(l));
  if (!sitemapLines.length) {
    issues.push({ level: 'warning', message: 'No "Sitemap:" directive — add Sitemap: ' + base + '/sitemap.xml' });
  } else {
    sitemapLines.forEach((l) => {
      const url = l.split(/:(.+)/)[1]?.trim() || '';
      if (!/^https?:\/\//i.test(url)) issues.push({ level: 'error', message: `Sitemap URL must be absolute: "${url}"` });
      else if (!url.startsWith(base)) issues.push({ level: 'warning', message: `Sitemap URL host differs from ${base}: ${url}` });
    });
  }

  ['/admin', '/dashboard', '/auth'].forEach((p) => {
    const blocked = nonEmpty.some((l) => new RegExp(`^disallow:\\s*${p}`, 'i').test(l));
    if (!blocked) issues.push({ level: 'warning', message: `Private area ${p} is not disallowed.` });
  });

  nonEmpty.forEach((l) => {
    if (!/^(user-agent|allow|disallow|sitemap|crawl-delay|host)\s*:/i.test(l)) {
      issues.push({ level: 'warning', message: `Unrecognized directive: "${l}"` });
    }
  });

  if (!issues.length) issues.push({ level: 'ok', message: 'robots.txt looks valid.' });
  return issues;
}
