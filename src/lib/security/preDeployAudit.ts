// Browser port of scripts/pre-deploy-security.ts.
// Re-runs the checks that are observable from the client (headers, robots,
// sitemap, live anonymous RLS probes) and produces the same report shape as
// security-reports/latest.json so the two can be diffed.

import { supabase } from "@/integrations/supabase/client";
import { fetchHeaders } from "./scanner";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface AuditFinding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
}

export interface AuditReport {
  ranAt: string;
  score: number;
  grade: string;
  counts: Record<string, number>;
  passed: number;
  passedChecks: string[];
  findings: AuditFinding[];
}

export const WEIGHT: Record<Severity, number> = {
  critical: 25,
  high: 12,
  medium: 6,
  low: 2,
  info: 0,
};

const SENSITIVE_TABLES = ["profiles", "user_roles", "contact_submissions", "admin_notifications"] as const;
const PUBLIC_TABLES = ["services", "projects", "blogs", "learn_resources"] as const;

async function text(url: string): Promise<string> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

export async function runPreDeployAudit(
  baseUrl: string,
  onProgress?: (step: string, pct: number) => void
): Promise<AuditReport> {
  const base = baseUrl.replace(/\/$/, "");
  const findings: AuditFinding[] = [];
  const passed: string[] = [];
  const add = (id: string, severity: Severity, title: string, detail: string) =>
    findings.push({ id, severity, title, detail });

  /* ---------------------------- security headers --------------------------- */
  onProgress?.("Checking security headers…", 10);
  const headers = await fetchHeaders(base + "/");
  const required: Array<[string, string, Severity]> = [
    ["Strict-Transport-Security", "strict-transport-security", "high"],
    ["Content-Security-Policy", "content-security-policy", "high"],
    ["X-Frame-Options", "x-frame-options", "medium"],
    ["X-Content-Type-Options", "x-content-type-options", "medium"],
    ["Referrer-Policy", "referrer-policy", "low"],
    ["Permissions-Policy", "permissions-policy", "low"],
  ];
  if (!headers) {
    add("headers-unreachable", "medium", "Could not read response headers", `No headers returned from ${base}/ (CORS or network).`);
  } else {
    for (const [label, key, sev] of required) {
      if (headers.get(key)) passed.push(`${label} configured`);
      else add(`hdr-${key}`, sev, `Missing ${label} header`, "Add it in public/.htaccess or the Nginx/Cloudflare snippets in Server Config.");
    }
    const csp = headers.get("content-security-policy") || "";
    if (csp && /unsafe-eval/.test(csp)) add("csp-unsafe-eval", "medium", "CSP allows 'unsafe-eval'", "Remove unsafe-eval from script-src if possible.");
    else if (csp) passed.push("CSP does not allow 'unsafe-eval'");
  }

  /* ------------------------------ crawlability ----------------------------- */
  onProgress?.("Validating robots.txt & sitemap.xml…", 35);
  const robots = await text(base + "/robots.txt");
  if (!robots) {
    add("robots-missing", "medium", "robots.txt missing", "Crawlers get no directives.");
  } else {
    if (/^\s*disallow:\s*\/\s*$/im.test(robots)) add("robots-blocks-all", "high", "robots.txt blocks the whole site", 'A "Disallow: /" rule is present.');
    ["/admin", "/dashboard", "/auth"].forEach((p) => {
      if (!new RegExp(`disallow:\\s*${p}`, "i").test(robots)) {
        add(`robots-${p}`, "low", `Private area ${p} not disallowed`, "Add a Disallow rule so private URLs stay out of the index.");
      }
    });
    if (!/sitemap:/i.test(robots)) add("robots-no-sitemap", "low", "robots.txt has no Sitemap directive", "Add a Sitemap: line.");
    passed.push("robots.txt present");
  }

  const sitemap = await text(base + "/sitemap.xml");
  const locs = (sitemap.match(/<loc>/g) || []).length;
  if (!sitemap) add("sitemap-missing", "medium", "sitemap.xml missing", "Regenerate it from Admin › SEO › Sitemap.");
  else if (locs <= 7) add("sitemap-static-only", "medium", "sitemap.xml has no dynamic URLs", `Only ${locs} URLs — dynamic content is likely blocked by RLS.`);
  else passed.push(`sitemap.xml contains ${locs} URLs`);

  /* --------------------------- live RLS/API probes -------------------------- */
  onProgress?.("Probing row level security…", 60);
  for (const table of SENSITIVE_TABLES) {
    const { data, error } = await supabase.from(table as any).select("id").limit(1);
    if (!error && data && data.length > 0) {
      add(`rls-${table}`, "critical", `Anonymous read exposes ${table}`, `SELECT on ${table} returned data for the current (public) key.`);
    } else {
      passed.push(`${table} is not anonymously readable`);
    }
  }

  onProgress?.("Verifying public content is readable…", 85);
  for (const table of PUBLIC_TABLES) {
    const { error } = await supabase.from(table as any).select("id").limit(1);
    if (error) add(`public-read-${table}`, "high", `Public content ${table} unreadable`, error.message);
    else passed.push(`${table} readable by visitors`);
  }

  onProgress?.("Compiling report…", 100);

  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
  const score = Math.max(0, 100 - findings.reduce((n, f) => n + WEIGHT[f.severity], 0));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  return {
    ranAt: new Date().toISOString(),
    score,
    grade,
    counts,
    passed: passed.length,
    passedChecks: passed,
    findings,
  };
}

export interface AuditDiff {
  scoreDelta: number;
  newFindings: AuditFinding[];
  resolvedFindings: AuditFinding[];
  unchangedFindings: AuditFinding[];
  stale: boolean;
  baselineAgeHours: number;
}

export function diffAudits(baseline: AuditReport, current: AuditReport): AuditDiff {
  const baseIds = new Set(baseline.findings.map((f) => f.id));
  const curIds = new Set(current.findings.map((f) => f.id));
  const ageHours = (Date.now() - new Date(baseline.ranAt).getTime()) / 3_600_000;
  return {
    scoreDelta: current.score - baseline.score,
    newFindings: current.findings.filter((f) => !baseIds.has(f.id)),
    resolvedFindings: baseline.findings.filter((f) => !curIds.has(f.id)),
    unchangedFindings: current.findings.filter((f) => baseIds.has(f.id)),
    stale:
      current.score !== baseline.score ||
      current.findings.length !== baseline.findings.length ||
      [...curIds].some((id) => !baseIds.has(id)),
    baselineAgeHours: ageHours,
  };
}
