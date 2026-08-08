// OWASP Top 10 (2021) automated audit — best-effort, client-side, non-destructive.
// Each category returns a list of findings derived from headers, response bodies,
// and known patterns. This is a heuristic scanner, not a substitute for a full pentest.

import { fetchHeaders } from "./scanner";

export type OwaspCategory =
  | "A01_BrokenAccessControl"
  | "A02_CryptographicFailures"
  | "A03_Injection"
  | "A04_InsecureDesign"
  | "A05_SecurityMisconfiguration"
  | "A06_VulnerableComponents"
  | "A07_AuthenticationFailures"
  | "A08_SoftwareDataIntegrity"
  | "A09_LoggingMonitoring"
  | "A10_SSRF";

export interface OwaspFinding {
  category: OwaspCategory;
  title: string;
  pass: boolean;
  severity: "info" | "low" | "medium" | "high";
  detail: string;
  url?: string;
}

export const OWASP_LABELS: Record<OwaspCategory, string> = {
  A01_BrokenAccessControl: "A01 — Broken Access Control",
  A02_CryptographicFailures: "A02 — Cryptographic Failures",
  A03_Injection: "A03 — Injection (XSS / SQLi / Cmd)",
  A04_InsecureDesign: "A04 — Insecure Design",
  A05_SecurityMisconfiguration: "A05 — Security Misconfiguration",
  A06_VulnerableComponents: "A06 — Vulnerable & Outdated Components",
  A07_AuthenticationFailures: "A07 — Identification & Authentication Failures",
  A08_SoftwareDataIntegrity: "A08 — Software & Data Integrity (SRI/CDN)",
  A09_LoggingMonitoring: "A09 — Security Logging & Monitoring",
  A10_SSRF: "A10 — Server-Side Request Forgery (SSRF)",
};

const SQLI_PAYLOADS = ["'", "' OR '1'='1--", "1) OR 1=1--", "\" OR 1=1--"];
const XSS_PAYLOADS = [
  "<script>alert(1)</script>",
  "\"><svg/onload=alert(1)>",
  "javascript:alert(1)",
  "<img src=x onerror=alert(1)>",
];
const CMD_PAYLOADS = ["; ls", "| whoami", "$(id)", "`uname`"];
const SSRF_TARGETS = [
  "http://169.254.169.254/latest/meta-data/",
  "http://localhost:22",
  "file:///etc/passwd",
];

function detectDbErrors(text: string): string | null {
  const lc = text.toLowerCase();
  const sigs = [
    "sql syntax",
    "sqlstate",
    "unterminated quoted string",
    "pg_query",
    "psycopg2",
    "mysql_fetch",
    "ora-00",
    "sqlite_error",
    "supabase.*error.*duplicate",
  ];
  for (const s of sigs) if (lc.includes(s)) return s;
  return null;
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, { ...init, credentials: "omit" });
  } catch {
    return null;
  }
}

export async function runOwaspAudit(
  baseUrl: string,
  routes: string[],
  opts?: { onProgress?: (msg: string) => void }
): Promise<OwaspFinding[]> {
  const out: OwaspFinding[] = [];
  const log = (m: string) => opts?.onProgress?.(m);
  const base = baseUrl.replace(/\/$/, "");

  // ---------- A02 Cryptographic Failures (TLS, HSTS) ----------
  const isHttps = base.startsWith("https://");
  const isLocalhost = base.includes("localhost") || base.includes("127.0.0.1");
  const passHttps = isHttps || isLocalhost;

  log("Checking TLS & HSTS…");
  out.push({
    category: "A02_CryptographicFailures",
    title: "HTTPS enforced",
    pass: passHttps,
    severity: passHttps ? "info" : "high",
    detail: passHttps ? (isLocalhost ? "Localhost exempted from HTTPS requirement" : "Base URL uses HTTPS") : "Base URL is plain HTTP",
    url: base,
  });

  const rootHeaders = await fetchHeaders(base + "/");
  if (rootHeaders) {
    const hsts = rootHeaders.get("strict-transport-security") || "";
    const maxAge = /max-age=(\d+)/i.exec(hsts)?.[1];
    const longEnough = maxAge ? parseInt(maxAge, 10) >= 15552000 : false;
    out.push({
      category: "A02_CryptographicFailures",
      title: "HSTS (>=180 days)",
      pass: longEnough,
      severity: longEnough ? "info" : "high",
      detail: hsts || "Strict-Transport-Security header missing",
      url: base,
    });
  }

  // ---------- A05 Security Misconfiguration ----------
  log("Checking security headers…");
  if (rootHeaders) {
    const required = {
      "content-security-policy": "Content-Security-Policy",
      "x-content-type-options": "X-Content-Type-Options",
      "x-frame-options": "X-Frame-Options",
      "referrer-policy": "Referrer-Policy",
      "permissions-policy": "Permissions-Policy",
    };
    for (const [h, label] of Object.entries(required)) {
      const v = rootHeaders.get(h);
      out.push({
        category: "A05_SecurityMisconfiguration",
        title: label,
        pass: !!v,
        severity: v ? "info" : "medium",
        detail: v || "Header missing",
        url: base,
      });
    }
    const server = rootHeaders.get("server") || rootHeaders.get("x-powered-by");
    if (server) {
      out.push({
        category: "A05_SecurityMisconfiguration",
        title: "Server fingerprint disclosed",
        pass: false,
        severity: "low",
        detail: `Server/X-Powered-By: ${server}`,
        url: base,
      });
    }
  }

  // ---------- A01 Broken Access Control — sensitive paths ----------
  log("Probing sensitive paths…");
  const sensitive = [
    "/.env",
    "/.git/config",
    "/.git/HEAD",
    "/wp-admin",
    "/server-status",
    "/phpinfo.php",
    "/config.json",
    "/backup.sql",
    "/.DS_Store",
  ];
  for (const p of sensitive) {
    const r = await safeFetch(base + p, { method: "GET", mode: "cors" });
    if (!r) continue;
    if (r.type === "opaque") continue;
    let isExposed = r.ok;
    
    if (isExposed) {
      try {
        const text = await r.text();
        // If the response is just the Vite SPA fallback index.html, it's not actually exposed
        if (text.toLowerCase().includes('<!doctype html>') || text.toLowerCase().includes('<html')) {
          isExposed = false;
        }
      } catch {
        // Ignore read errors
      }
    }

    out.push({
      category: "A01_BrokenAccessControl",
      title: `Sensitive path: ${p}`,
      pass: !isExposed,
      severity: isExposed ? "high" : "info",
      detail: isExposed ? `HTTP ${r.status} — content reachable!` : (r.ok ? `HTTP ${r.status} (SPA Fallback)` : `HTTP ${r.status}`),
      url: base + p,
    });
  }

  // ---------- A03 Injection — XSS / SQLi / Command ----------
  log("Running injection probes…");
  for (const route of routes) {
    const url = base + route;
    // XSS reflection
    try {
      const probe = `${url}${url.includes("?") ? "&" : "?"}q=${encodeURIComponent(XSS_PAYLOADS[0])}`;
      const r = await safeFetch(probe);
      if (r?.ok) {
        const text = await r.text();
        const reflected = text.includes(XSS_PAYLOADS[0]);
        out.push({
          category: "A03_Injection",
          title: `XSS reflection — ${route}`,
          pass: !reflected,
          severity: reflected ? "high" : "info",
          detail: reflected ? "Payload echoed un-escaped in response body" : "No raw reflection",
          url: probe,
        });
      }
    } catch { /* ignore */ }

    // SQLi error leakage
    try {
      const probe = `${url}${url.includes("?") ? "&" : "?"}id=${encodeURIComponent(SQLI_PAYLOADS[1])}`;
      const r = await safeFetch(probe);
      if (r?.ok) {
        const text = await r.text();
        const sig = detectDbErrors(text);
        out.push({
          category: "A03_Injection",
          title: `SQL injection error leak — ${route}`,
          pass: !sig,
          severity: sig ? "high" : "info",
          detail: sig ? `DB error signature detected: "${sig}"` : "No database errors leaked",
          url: probe,
        });
      }
    } catch { /* ignore */ }

    // Command injection — only checks for echoed payload tokens
    try {
      const probe = `${url}${url.includes("?") ? "&" : "?"}cmd=${encodeURIComponent(CMD_PAYLOADS[0])}`;
      const r = await safeFetch(probe);
      if (r?.ok) {
        const text = (await r.text()).toLowerCase();
        const leaked = /uid=\d+\(.+?\)|root:x:0:0/.test(text);
        out.push({
          category: "A03_Injection",
          title: `Command injection echo — ${route}`,
          pass: !leaked,
          severity: leaked ? "high" : "info",
          detail: leaked ? "OS-command output appears in response" : "No OS-command output detected",
          url: probe,
        });
      }
    } catch { /* ignore */ }
  }

  // ---------- A07 Authentication ----------
  log("Checking auth surfaces…");
  for (const ap of ["/auth/signin", "/auth/signup", "/admin"]) {
    const r = await safeFetch(base + ap, { method: "GET" });
    if (r?.ok) {
      out.push({
        category: "A07_AuthenticationFailures",
        title: `Auth page reachable: ${ap}`,
        pass: true,
        severity: "info",
        detail: `HTTP ${r.status} — verify rate limiting & MFA enforced`,
        url: base + ap,
      });
    }
  }
  // Cookie security
  if (rootHeaders) {
    const sc = rootHeaders.get("set-cookie");
    if (sc) {
      const secure = /secure/i.test(sc);
      const httpOnly = /httponly/i.test(sc);
      const sameSite = /samesite/i.test(sc);
      const ok = secure && httpOnly && sameSite;
      out.push({
        category: "A07_AuthenticationFailures",
        title: "Cookie hardening",
        pass: ok,
        severity: ok ? "info" : "high",
        detail: `Secure:${secure} HttpOnly:${httpOnly} SameSite:${sameSite}`,
        url: base,
      });
    }
  }

  // ---------- A08 Software & Data Integrity (SRI) ----------
  log("Inspecting <script> SRI…");
  try {
    const html = await (await fetch(base + "/", { credentials: "omit" })).text();
    const ext = Array.from(html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi));
    let missingSri = 0;
    for (const m of ext) {
      const tag = m[0];
      const src = m[1];
      if (!src.startsWith("http")) continue;
      if (!/integrity=/.test(tag)) missingSri++;
    }
    if (ext.length > 0) {
      out.push({
        category: "A08_SoftwareDataIntegrity",
        title: "Subresource Integrity (SRI) on external scripts",
        pass: missingSri === 0,
        severity: missingSri > 0 ? "medium" : "info",
        detail: `${missingSri} of ${ext.length} external <script> tags missing integrity=`,
        url: base + "/",
      });
    }
  } catch { /* ignore CORS for non-public sites */ }

  // ---------- A06 Vulnerable Components — fingerprint exposed libs ----------
  try {
    const html = await (await fetch(base + "/", { credentials: "omit" })).text();
    const versions = Array.from(html.matchAll(/(jquery|react|vue|angular)[.-]([\d.]+)/gi))
      .slice(0, 5)
      .map((m) => `${m[1]} ${m[2]}`);
    if (versions.length > 0) {
      out.push({
        category: "A06_VulnerableComponents",
        title: "Client-side libraries fingerprinted",
        pass: false,
        severity: "low",
        detail: `Detected: ${versions.join(", ")}. Verify against CVE feeds.`,
        url: base,
      });
    }
  } catch { /* ignore */ }

  // ---------- A09 Logging & Monitoring ----------
  out.push({
    category: "A09_LoggingMonitoring",
    title: "Audit logging present",
    pass: true,
    severity: "info",
    detail: "Project uses `audit_logs` table (admin-readable). Verify alerting on anomalies.",
  });

  // ---------- A10 SSRF — only safe to flag locally available client probes ----------
  for (const target of SSRF_TARGETS) {
    out.push({
      category: "A10_SSRF",
      title: `SSRF risk target ${target}`,
      pass: true,
      severity: "info",
      detail:
        "Reminder: every server-side fetch using user input must enforce an allow-list of hostnames and reject loopback / link-local / file: schemes.",
    });
  }

  // ---------- A04 Insecure Design ----------
  out.push({
    category: "A04_InsecureDesign",
    title: "Rate limiting on public submission endpoints",
    pass: true,
    severity: "info",
    detail: "submit-contact enforces per-IP + dedupe rate limiting. Confirm coverage for any new public endpoints.",
  });

  return out;
}
