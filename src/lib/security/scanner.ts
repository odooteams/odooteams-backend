import { REQUIRED_HEADERS } from "./cspTemplate";

export interface HeaderCheck {
  name: string;
  present: boolean;
  value: string | null;
  pass: boolean;
  expected: string;
}

export async function fetchHeaders(url: string): Promise<Headers | null> {
  try {
    const res = await fetch(url, { method: "GET", credentials: "omit", mode: "cors" });
    return res.headers;
  } catch {
    try {
      const res = await fetch(url, { method: "GET", mode: "no-cors" });
      return res.headers;
    } catch {
      return null;
    }
  }
}

export function checkHeaders(headers: Headers): HeaderCheck[] {
  return Object.entries(REQUIRED_HEADERS).map(([name, expected]) => {
    const value = headers.get(name);
    const pass =
      value != null &&
      (typeof expected === "string"
        ? value.toLowerCase().includes(expected.toLowerCase())
        : expected.test(value));
    return {
      name,
      present: value != null,
      value,
      pass,
      expected: expected.toString(),
    };
  });
}

// Safe black-box probes — passive + non-destructive
export interface ProbeResult {
  url: string;
  category: "headers" | "cookies" | "xss" | "sqli" | "mixed-content" | "exposure" | "tls";
  severity: "info" | "low" | "medium" | "high";
  pass: boolean;
  message: string;
}

const SQLI_PAYLOADS = ["'", "' OR '1'='1", "1; DROP TABLE--", "\" OR 1=1--"];
const XSS_PAYLOADS = [
  "<script>alert(1)</script>",
  "\"><svg/onload=alert(1)>",
  "javascript:alert(1)",
];

export async function probeRoute(baseUrl: string, route: string): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];
  const url = baseUrl.replace(/\/$/, "") + route;

  // 1. TLS check
  results.push({
    url,
    category: "tls",
    severity: "high",
    pass: url.startsWith("https://"),
    message: url.startsWith("https://") ? "HTTPS in use" : "URL not using HTTPS",
  });

  // 2. Headers
  const headers = await fetchHeaders(url);
  if (!headers) {
    results.push({
      url,
      category: "headers",
      severity: "medium",
      pass: false,
      message: "Could not fetch headers (CORS or network error)",
    });
    return results;
  }

  checkHeaders(headers).forEach((h) =>
    results.push({
      url,
      category: "headers",
      severity: h.pass ? "info" : "medium",
      pass: h.pass,
      message: h.pass
        ? `${h.name}: OK`
        : `${h.name} missing or weak (got: ${h.value || "none"})`,
    })
  );

  // 3. Mixed content hint
  const csp = headers.get("content-security-policy") || "";
  results.push({
    url,
    category: "mixed-content",
    severity: "low",
    pass: csp.includes("upgrade-insecure-requests") || !csp.includes("http:"),
    message: csp.includes("upgrade-insecure-requests")
      ? "CSP upgrades insecure requests"
      : "CSP missing upgrade-insecure-requests directive",
  });

  // 4. Cookie security
  const setCookie = headers.get("set-cookie");
  if (setCookie) {
    const secure = /secure/i.test(setCookie);
    const httpOnly = /httponly/i.test(setCookie);
    const sameSite = /samesite/i.test(setCookie);
    results.push({
      url,
      category: "cookies",
      severity: secure && httpOnly && sameSite ? "info" : "high",
      pass: secure && httpOnly && sameSite,
      message: `Cookies — Secure:${secure} HttpOnly:${httpOnly} SameSite:${sameSite}`,
    });
  }

  // 5. Exposed admin/debug paths
  const sensitive = ["/.env", "/.git/config", "/admin", "/server-status", "/wp-admin"];
  for (const p of sensitive) {
    try {
      const r = await fetch(baseUrl.replace(/\/$/, "") + p, { method: "HEAD", mode: "no-cors" });
      // status 0 in opaque means we can't read; skip
      if (r.type === "opaque") continue;
      results.push({
        url: baseUrl + p,
        category: "exposure",
        severity: r.ok ? "high" : "info",
        pass: !r.ok,
        message: r.ok ? `Sensitive path reachable: ${p}` : `${p} not exposed`,
      });
    } catch {
      /* ignore */
    }
  }

  // 6. Reflected XSS — query param echo (heuristic, safe)
  try {
    const probe = `${url}${url.includes("?") ? "&" : "?"}q=${encodeURIComponent(XSS_PAYLOADS[0])}`;
    const r = await fetch(probe, { mode: "cors" });
    if (r.ok) {
      const text = await r.text();
      const reflected = text.includes(XSS_PAYLOADS[0]);
      results.push({
        url: probe,
        category: "xss",
        severity: reflected ? "high" : "info",
        pass: !reflected,
        message: reflected
          ? "Query parameter reflected un-escaped (potential XSS)"
          : "No raw reflection of XSS payload",
      });
    }
  } catch {
    /* ignore CORS */
  }

  // 7. SQLi heuristic — look for DB error strings
  try {
    const probe = `${url}${url.includes("?") ? "&" : "?"}id=${encodeURIComponent(SQLI_PAYLOADS[1])}`;
    const r = await fetch(probe, { mode: "cors" });
    if (r.ok) {
      const text = (await r.text()).toLowerCase();
      const dbErr =
        text.includes("sql syntax") ||
        text.includes("postgres") && text.includes("error") ||
        text.includes("sqlstate") ||
        text.includes("unterminated quoted string");
      results.push({
        url: probe,
        category: "sqli",
        severity: dbErr ? "high" : "info",
        pass: !dbErr,
        message: dbErr ? "DB error string leaked in response (possible SQLi)" : "No DB error leakage",
      });
    }
  } catch {
    /* ignore */
  }

  return results;
}

export const PROBE_PAYLOADS = { SQLI_PAYLOADS, XSS_PAYLOADS };
