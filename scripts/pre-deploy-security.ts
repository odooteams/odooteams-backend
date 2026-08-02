/**
 * Automated pre-deploy security scan.
 *
 * Runs before every build (prebuild hook) and on demand:
 *   bunx tsx scripts/pre-deploy-security.ts
 *
 * It performs static, offline checks over the repo plus live Supabase RLS
 * probes, writes a timestamped report to security-reports/ so findings can be
 * tracked over time, and fails the build when a CRITICAL issue is found.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface Finding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
}

const findings: Finding[] = [];
const passed: string[] = [];

const add = (id: string, severity: Severity, title: string, detail: string) =>
  findings.push({ id, severity, title, detail });

const read = (p: string) => (existsSync(resolve(p)) ? readFileSync(resolve(p), 'utf8') : '');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://eflevjjteuxhqkwqecvv.supabase.co';
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbGV2amp0ZXV4aHFrd3FlY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjU2MzcsImV4cCI6MjA3NTM0MTYzN30.7F7Z9S31IfJLUrTZx8wje-Jomzsz4SzH9tDjE0IpPt8';

/* --------------------------- 1. secret leakage --------------------------- */
function checkSecretLeakage() {
  let out = '';
  try {
    out = execSync(
      `grep -rIl -E "service_role|SUPABASE_SERVICE_ROLE_KEY|SMTP_PASSWORD *= *['\\"]" src public index.html 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
  } catch { /* grep exit 1 = no matches */ }
  const files = out.split('\n').filter(Boolean);
  if (files.length) {
    add('secret-leak', 'critical', 'Possible secret in client bundle', `Referenced in: ${files.join(', ')}`);
  } else {
    passed.push('No service-role keys or SMTP passwords referenced in client code');
  }

  const env = read('.env');
  if (/SERVICE_ROLE|SECRET_KEY/i.test(env)) {
    add('env-secret', 'critical', 'Server-only secret present in .env', '.env is bundled by Vite — only VITE_* publishable values belong there.');
  } else {
    passed.push('.env contains only publishable values');
  }
}

/* -------------------------- 2. security headers -------------------------- */
function checkHeaders() {
  const htaccess = read('public/.htaccess');
  const required: Array<[string, RegExp, Severity]> = [
    ['Strict-Transport-Security', /Strict-Transport-Security/i, 'high'],
    ['Content-Security-Policy', /Content-Security-Policy/i, 'high'],
    ['X-Frame-Options', /X-Frame-Options/i, 'medium'],
    ['X-Content-Type-Options', /X-Content-Type-Options/i, 'medium'],
    ['Referrer-Policy', /Referrer-Policy/i, 'low'],
    ['Permissions-Policy', /Permissions-Policy/i, 'low'],
  ];
  if (!htaccess) {
    add('htaccess-missing', 'high', 'public/.htaccess missing', 'No server-side security headers are configured.');
    return;
  }
  required.forEach(([name, re, sev]) => {
    if (re.test(htaccess)) passed.push(`${name} configured`);
    else add(`hdr-${name}`, sev, `Missing ${name} header`, 'Add it to public/.htaccess (and the Nginx/Cloudflare snippets in /admin/security).');
  });
  if (!/unsafe-eval/.test(htaccess)) passed.push("CSP does not allow 'unsafe-eval'");
  else add('csp-unsafe-eval', 'medium', "CSP allows 'unsafe-eval'", 'Remove unsafe-eval from the script-src directive if possible.');
}

/* --------------------------- 3. crawlability ----------------------------- */
function checkCrawlability() {
  const robots = read('public/robots.txt');
  if (!robots) add('robots-missing', 'medium', 'robots.txt missing', 'Crawlers get no directives.');
  else {
    if (/^\s*disallow:\s*\/\s*$/im.test(robots)) add('robots-blocks-all', 'high', 'robots.txt blocks the whole site', 'A "Disallow: /" rule is present.');
    ['/admin', '/dashboard', '/auth'].forEach((p) => {
      if (!new RegExp(`disallow:\\s*${p}`, 'i').test(robots)) {
        add(`robots-${p}`, 'low', `Private area ${p} not disallowed`, 'Add a Disallow rule so admin URLs stay out of the index.');
      }
    });
    if (!/sitemap:/i.test(robots)) add('robots-no-sitemap', 'low', 'robots.txt has no Sitemap directive', 'Add Sitemap: https://odooteams.com/sitemap.xml');
    passed.push('robots.txt present');
  }

  const sitemap = read('public/sitemap.xml');
  const locs = (sitemap.match(/<loc>/g) || []).length;
  if (!sitemap) add('sitemap-missing', 'medium', 'sitemap.xml missing', 'Run bunx tsx scripts/generate-sitemap.ts');
  else if (locs <= 7) add('sitemap-static-only', 'medium', 'sitemap.xml has no dynamic URLs', `Only ${locs} URLs — dynamic content is likely blocked by RLS.`);
  else passed.push(`sitemap.xml contains ${locs} URLs`);
}

/* ------------------------ 4. live RLS / API probes ----------------------- */
async function probe(path: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    const body = await res.text();
    return { status: res.status, body };
  } catch (err: any) {
    return { status: 0, body: err?.message || 'network error' };
  }
}

async function checkRls() {
  const sensitive = ['profiles?select=email&limit=1', 'user_roles?select=role&limit=1', 'contact_submissions?select=email&limit=1', 'admin_notifications?select=id&limit=1'];
  for (const p of sensitive) {
    const { status, body } = await probe(p);
    const table = p.split('?')[0];
    if (status === 200 && body.trim() !== '[]') {
      add(`rls-${table}`, 'critical', `Anonymous read exposes ${table}`, `GET /${table} returned data without auth.`);
    } else {
      passed.push(`${table} is not anonymously readable`);
    }
  }

  const publicTables = ['services?select=id&limit=1', 'projects?select=id&limit=1', 'blogs?select=id&limit=1', 'learn_resources?select=id&limit=1'];
  for (const p of publicTables) {
    const { status, body } = await probe(p);
    const table = p.split('?')[0];
    if (status !== 200) add(`public-read-${table}`, 'high', `Public content ${table} unreadable`, `Anonymous GET returned ${status}: ${body.slice(0, 160)}`);
    else passed.push(`${table} readable by visitors`);
  }
}

/* ------------------------- 5. auth configuration ------------------------- */
function checkAuthConfig() {
  const cfg = read('supabase/config.toml');
  const expect: Array<[string, RegExp, Severity, string]> = [
    ['MFA (TOTP) enabled', /\[auth\.mfa\.totp\][\s\S]*?enroll_enabled\s*=\s*true/, 'medium', 'Enable TOTP MFA under [auth.mfa.totp].'],
    ['Email OTP rate limit', /\[auth\.rate_limit\][\s\S]*?email_sent/, 'medium', 'Set rate limits under [auth.rate_limit].'],
    ['Redirect allow-list', /additional_redirect_urls\s*=\s*\[[^\]]+\]/, 'high', 'Restrict additional_redirect_urls to trusted origins.'],
    ['Signup confirmations', /enable_confirmations\s*=\s*true/, 'medium', 'Require email confirmation for new signups.'],
  ];
  expect.forEach(([label, re, sev, fix]) => {
    if (re.test(cfg)) passed.push(label);
    else add(`auth-${label}`, sev, `Auth hardening: ${label} not configured`, fix);
  });
  if (/site_url\s*=\s*"http:\/\/(127\.0\.0\.1|localhost)/.test(cfg)) {
    add('auth-site-url', 'medium', 'Auth site_url points at localhost', 'Set site_url to https://odooteams.com so magic links and resets resolve in production.');
  }
  if (/enable_anonymous_sign_ins\s*=\s*true/.test(cfg)) {
    add('auth-anon', 'medium', 'Anonymous sign-ins enabled', 'Disable enable_anonymous_sign_ins unless required.');
  } else passed.push('Anonymous sign-ins disabled');
}

/* ------------------------------- reporting ------------------------------- */
const WEIGHT: Record<Severity, number> = { critical: 25, high: 12, medium: 6, low: 2, info: 0 };

async function main() {
  checkSecretLeakage();
  checkHeaders();
  checkCrawlability();
  checkAuthConfig();
  await checkRls();

  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
  const score = Math.max(0, 100 - findings.reduce((n, f) => n + WEIGHT[f.severity], 0));
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  const report = {
    ranAt: new Date().toISOString(),
    score,
    grade,
    counts,
    passed: passed.length,
    passedChecks: passed,
    findings,
  };

  const dir = resolve('security-reports');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'latest.json'), JSON.stringify(report, null, 2));
  appendFileSync(resolve(dir, 'history.jsonl'), JSON.stringify({ ranAt: report.ranAt, score, grade, counts }) + '\n');

  console.log(`\n[pre-deploy-security] Score ${score}/100 (grade ${grade}) — ${passed.length} checks passed, ${findings.length} findings`);
  findings
    .sort((a, b) => WEIGHT[b.severity] - WEIGHT[a.severity])
    .forEach((f) => console.log(`  [${f.severity.toUpperCase()}] ${f.title} — ${f.detail}`));
  console.log('[pre-deploy-security] Report: security-reports/latest.json (history in history.jsonl)\n');

  if (counts.critical) {
    console.error('[pre-deploy-security] CRITICAL findings present — blocking build.');
    process.exit(1);
  }
}

main();
