/**
 * Hreflang / canonical consistency audit.
 *
 * Compares what each SEO-managed row declares (canonical_url, robots, AR/EN
 * meta) with the URLs the app actually renders via SEOHead, so structured data
 * and the SERP preview match what a crawler will see.
 */
import { supabase } from '@/integrations/supabase/client';
import { SITE_BASE_URL, slugify } from './sitemapBuilder';

export type AuditLevel = 'error' | 'warning' | 'ok';

export interface HreflangIssue {
  level: AuditLevel;
  field: string;
  message: string;
}

export interface HreflangAuditRow {
  table: string;
  id: string;
  title: string;
  path: string;
  expectedCanonical: string;
  declaredCanonical: string | null;
  hreflang: { en: string; ar: string; xDefault: string };
  issues: HreflangIssue[];
  score: number;
}

export interface HreflangAuditReport {
  rows: HreflangAuditRow[];
  errors: number;
  warnings: number;
  ok: number;
  fetchErrors: string[];
  ranAt: string;
}

const SOURCES = [
  { table: 'services', flag: 'is_active', prefix: '/services' },
  { table: 'projects', flag: 'is_active', prefix: '/projects' },
  { table: 'blogs', flag: 'is_published', prefix: '/blogs' },
  { table: 'learn_resources', flag: 'is_active', prefix: '/learn-odoo' },
] as const;

const COLUMNS =
  'id, title_en, title_ar, canonical_url, robots, og_image, seo_title_en, seo_title_ar, seo_description_en, seo_description_ar, structured_data';

function auditRow(table: string, prefix: string, row: any): HreflangAuditRow {
  const path = `${prefix}/${slugify(row.title_en)}`;
  const expectedCanonical = `${SITE_BASE_URL}${path}`;
  const declared = (row.canonical_url || '').trim() || null;
  const issues: HreflangIssue[] = [];

  if (!declared) {
    issues.push({ level: 'warning', field: 'canonical', message: `No canonical set — the app will render ${expectedCanonical}.` });
  } else {
    if (!/^https?:\/\//i.test(declared)) {
      issues.push({ level: 'error', field: 'canonical', message: 'Canonical must be an absolute URL.' });
    } else if (declared.replace(/\/$/, '') !== expectedCanonical.replace(/\/$/, '')) {
      issues.push({
        level: 'error',
        field: 'canonical',
        message: `Canonical (${declared}) does not match the rendered URL (${expectedCanonical}).`,
      });
    }
    if (/[?&]lang=/i.test(declared)) {
      issues.push({ level: 'error', field: 'canonical', message: 'Canonical must not contain a ?lang= parameter — that URL is an hreflang alternate.' });
    }
  }

  const base = declared && /^https?:\/\//i.test(declared) ? declared : expectedCanonical;
  const sep = base.includes('?') ? '&' : '?';
  const hreflang = { en: `${base}${sep}lang=en`, ar: `${base}${sep}lang=ar`, xDefault: base };

  // Bilingual completeness — hreflang pairs are only valid if both locales exist.
  if (!row.title_ar) issues.push({ level: 'error', field: 'ar', message: 'Missing Arabic title — the ar hreflang points at a page with no Arabic content.' });
  if (!row.title_en) issues.push({ level: 'error', field: 'en', message: 'Missing English title — the en hreflang has no English content.' });

  const pairs: Array<[string, string, string]> = [
    ['seo_title_en', 'seo_title_ar', 'meta title'],
    ['seo_description_en', 'seo_description_ar', 'meta description'],
  ];
  pairs.forEach(([en, ar, label]) => {
    const hasEn = !!(row[en] || '').trim();
    const hasAr = !!(row[ar] || '').trim();
    if (hasEn !== hasAr) {
      issues.push({
        level: 'warning',
        field: label,
        message: `${label} exists only in ${hasEn ? 'English' : 'Arabic'} — AR/EN SERP previews will not match.`,
      });
    } else if (!hasEn && !hasAr) {
      issues.push({ level: 'warning', field: label, message: `No ${label} for either locale — falls back to the raw title.` });
    }
  });

  if ((row.robots || '').includes('noindex') && declared) {
    issues.push({ level: 'warning', field: 'robots', message: 'Page is noindex but declares a canonical — conflicting signals for crawlers.' });
  }

  // Structured data must reference the same canonical URL.
  if (row.structured_data) {
    const raw = typeof row.structured_data === 'string' ? row.structured_data : JSON.stringify(row.structured_data);
    const urls = raw.match(/https?:\/\/[^"']+/g) || [];
    const pageUrls = urls.filter((u) => u.includes('/services/') || u.includes('/projects/') || u.includes('/blogs/') || u.includes('/learn-odoo/'));
    if (pageUrls.length && !pageUrls.some((u) => u.replace(/\/$/, '') === base.replace(/\/$/, ''))) {
      issues.push({ level: 'warning', field: 'structured data', message: 'JSON-LD does not reference the canonical URL.' });
    }
    if (!/"inLanguage"/.test(raw)) {
      issues.push({ level: 'warning', field: 'structured data', message: 'JSON-LD has no "inLanguage" — add en/ar variants so schema matches hreflang.' });
    }
  } else {
    issues.push({ level: 'warning', field: 'structured data', message: 'No JSON-LD structured data generated yet.' });
  }

  const errors = issues.filter((i) => i.level === 'error').length;
  const warnings = issues.filter((i) => i.level === 'warning').length;
  const score = Math.max(0, 100 - errors * 25 - warnings * 8);

  return {
    table,
    id: row.id,
    title: row.title_en || row.title_ar || '(untitled)',
    path,
    expectedCanonical,
    declaredCanonical: declared,
    hreflang,
    issues,
    score,
  };
}

export async function runHreflangAudit(): Promise<HreflangAuditReport> {
  const rows: HreflangAuditRow[] = [];
  const fetchErrors: string[] = [];

  await Promise.all(
    SOURCES.map(async (s) => {
      const { data, error } = await (supabase as any).from(s.table).select(COLUMNS).eq(s.flag, true).limit(1000);
      if (error) {
        fetchErrors.push(`${s.table}: ${error.message}`);
        return;
      }
      (data || []).forEach((r: any) => rows.push(auditRow(s.table, s.prefix, r)));
    })
  );

  const errors = rows.reduce((n, r) => n + r.issues.filter((i) => i.level === 'error').length, 0);
  const warnings = rows.reduce((n, r) => n + r.issues.filter((i) => i.level === 'warning').length, 0);
  const ok = rows.filter((r) => r.issues.length === 0).length;

  rows.sort((a, b) => a.score - b.score);
  return { rows, errors, warnings, ok, fetchErrors, ranAt: new Date().toISOString() };
}
