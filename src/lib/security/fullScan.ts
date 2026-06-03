// Full-scan orchestrator: runs every available security check in sequence,
// aggregates results into a single pass/fail report that can be exported.

import { fetchHeaders, checkHeaders, probeRoute, type ProbeResult, type HeaderCheck } from "./scanner";
import { PUBLIC_ROUTES_TO_TEST } from "./routes";
import { runOwaspAudit, type OwaspFinding } from "./owasp";
import { runCsrfAudit, DEFAULT_ADMIN_ROUTES, type CsrfFinding } from "./csrf";
import { runSqliFuzz, type SqliFinding } from "./sqli-fuzzer";
import { runXssScan, type XssFinding } from "./xss-scan";
import { fetchHtml, extractResources, summarize } from "./network";

export interface FullScanReport {
  baseUrl: string;
  startedAt: string;
  finishedAt: string;
  summary: {
    headers: { pass: number; fail: number };
    owasp: { pass: number; fail: number };
    csrf: { pass: number; fail: number };
    sqli: { findings: number; high: number };
    xss: { findings: number; high: number };
    blackbox: { pass: number; fail: number };
    network: { external: number; mixed: number; missingSri: number };
  };
  headers: { route: string; checks: HeaderCheck[] }[];
  owasp: OwaspFinding[];
  csrf: CsrfFinding[];
  sqli: SqliFinding[];
  xss: XssFinding[];
  blackbox: ProbeResult[];
  network: { totalExternal: number; mixedContent: string[]; missingSri: string[]; byCdn: Record<string, number> } | null;
}

export async function runFullScan(
  baseUrl: string,
  onProgress?: (step: string, pct: number) => void
): Promise<FullScanReport> {
  const startedAt = new Date().toISOString();
  const base = baseUrl.replace(/\/$/, "");
  const routes = PUBLIC_ROUTES_TO_TEST;
  const probeRoutes = routes.slice(0, 4);

  // ---- 1) Headers ----
  onProgress?.("Running header tests…", 5);
  const headers: { route: string; checks: HeaderCheck[] }[] = [];
  for (const r of routes) {
    const h = await fetchHeaders(base + r);
    headers.push({ route: r, checks: h ? checkHeaders(h) : [] });
  }

  // ---- 2) OWASP Top 10 ----
  onProgress?.("Running OWASP Top 10 audit…", 20);
  const owasp = await runOwaspAudit(base, probeRoutes);

  // ---- 3) CSRF ----
  onProgress?.("Auditing CSRF protections…", 40);
  const csrf = await runCsrfAudit(base, DEFAULT_ADMIN_ROUTES);

  // ---- 4) SQLi ----
  onProgress?.("Fuzzing for SQL injection…", 55);
  const sqli = await runSqliFuzz(base, probeRoutes, { extraParams: ["id", "search"] });

  // ---- 5) XSS ----
  onProgress?.("Scanning for XSS…", 70);
  const xss = await runXssScan(base, probeRoutes, { extraParams: ["q", "search"], testStored: false });

  // ---- 6) Black-box probe ----
  onProgress?.("Running black-box probes…", 85);
  const blackbox: ProbeResult[] = [];
  for (const r of probeRoutes) {
    blackbox.push(...(await probeRoute(base, r)));
  }

  // ---- 7) Network/CDN ----
  onProgress?.("Inspecting external resources & CDNs…", 95);
  let network: FullScanReport["network"] = null;
  const html = await fetchHtml(base + "/");
  if (html) {
    const items = extractResources(html, base + "/");
    const s = summarize(items, base + "/");
    network = {
      totalExternal: s.totalExternal,
      mixedContent: s.mixedContent.map((r) => r.url),
      missingSri: s.missingSri.map((r) => r.url),
      byCdn: s.byCdn,
    };
  }

  onProgress?.("Compiling report…", 100);

  const headersFlat = headers.flatMap((h) => h.checks);
  const summary = {
    headers: {
      pass: headersFlat.filter((c) => c.pass).length,
      fail: headersFlat.filter((c) => !c.pass).length,
    },
    owasp: {
      pass: owasp.filter((f) => f.pass).length,
      fail: owasp.filter((f) => !f.pass).length,
    },
    csrf: {
      pass: csrf.filter((f) => f.pass).length,
      fail: csrf.filter((f) => !f.pass).length,
    },
    sqli: {
      findings: sqli.length,
      high: sqli.filter((f) => f.severity === "high").length,
    },
    xss: {
      findings: xss.length,
      high: xss.filter((f) => f.severity === "high").length,
    },
    blackbox: {
      pass: blackbox.filter((p) => p.pass).length,
      fail: blackbox.filter((p) => !p.pass).length,
    },
    network: {
      external: network?.totalExternal || 0,
      mixed: network?.mixedContent.length || 0,
      missingSri: network?.missingSri.length || 0,
    },
  };

  return {
    baseUrl: base,
    startedAt,
    finishedAt: new Date().toISOString(),
    summary,
    headers,
    owasp,
    csrf,
    sqli,
    xss,
    blackbox,
    network,
  };
}
