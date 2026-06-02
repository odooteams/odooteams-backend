// Dedicated XSS scanner — tests reflected payloads against common query
// parameters and form fields, then revisits the page to look for stored
// reflections. Reports the exact context in which each payload appears.

export interface XssFinding {
  route: string;
  url: string;
  parameter: string;
  payload: string;
  type: "reflected" | "stored";
  context: "raw-html" | "attribute" | "script" | "url" | "encoded" | "none";
  severity: "info" | "low" | "medium" | "high";
  vulnerable: boolean;
  evidence: string;
}

export const XSS_PAYLOADS = [
  `<script>alert(1)</script>`,
  `"><svg/onload=alert(1)>`,
  `';alert(1);//`,
  `<img src=x onerror=alert(1)>`,
  `javascript:alert(1)`,
  `<iframe srcdoc="<svg onload=alert(1)>"></iframe>`,
  `"><body onload=alert(1)>`,
  `<details open ontoggle=alert(1)>`,
];

export const DEFAULT_PARAMS = [
  "q", "search", "query", "s", "keyword", "name", "id", "ref", "redirect",
  "next", "lang", "callback", "page", "msg", "error",
];

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

function classifyContext(html: string, payload: string): XssFinding["context"] {
  if (!html.includes(payload)) {
    // Try encoded form
    const encoded = payload
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    if (html.includes(encoded)) return "encoded";
    return "none";
  }
  // Find surrounding context (~50 chars before)
  const idx = html.indexOf(payload);
  const before = html.slice(Math.max(0, idx - 80), idx);
  if (/<script[^>]*>[^<]*$/i.test(before)) return "script";
  if (/=\s*["'][^"']*$/.test(before)) return "attribute";
  if (/href\s*=\s*["']?$/i.test(before) || /src\s*=\s*["']?$/i.test(before)) return "url";
  return "raw-html";
}

function severityFor(context: XssFinding["context"]): XssFinding["severity"] {
  switch (context) {
    case "raw-html":
    case "script":
      return "high";
    case "attribute":
    case "url":
      return "medium";
    case "encoded":
      return "info";
    default:
      return "info";
  }
}

function snippet(html: string, payload: string): string {
  const idx = html.indexOf(payload);
  if (idx < 0) return "";
  return html.slice(Math.max(0, idx - 40), idx + payload.length + 40).replace(/\s+/g, " ");
}

function extractFormFields(html: string): Array<{
  action: string | null;
  method: "GET" | "POST";
  fields: string[];
}> {
  const out: Array<{ action: string | null; method: "GET" | "POST"; fields: string[] }> = [];
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
    if (fields.length > 0) out.push({ action, method, fields });
  }
  return out;
}

export async function runXssScan(
  baseUrl: string,
  routes: string[],
  opts?: {
    extraParams?: string[];
    testStored?: boolean;
    onProgress?: (msg: string) => void;
  }
): Promise<XssFinding[]> {
  const out: XssFinding[] = [];
  const log = (m: string) => opts?.onProgress?.(m);
  const base = baseUrl.replace(/\/$/, "");
  const params = Array.from(new Set([...(opts?.extraParams || []), ...DEFAULT_PARAMS]));
  const testStored = opts?.testStored ?? true;

  for (const route of routes) {
    const pageUrl = base + route;
    log(`Scanning ${route}…`);

    // ---- Reflected — GET ----
    for (const p of params) {
      for (const payload of XSS_PAYLOADS) {
        const probe = `${pageUrl}${pageUrl.includes("?") ? "&" : "?"}${p}=${encodeURIComponent(
          payload
        )}`;
        const r = await safeFetch(probe);
        if (!r) continue;
        const ctx = classifyContext(r.text, payload);
        if (ctx === "none") continue;
        out.push({
          route,
          url: probe,
          parameter: p,
          payload,
          type: "reflected",
          context: ctx,
          severity: severityFor(ctx),
          vulnerable: ctx === "raw-html" || ctx === "script" || ctx === "attribute" || ctx === "url",
          evidence: snippet(r.text, payload),
        });
      }
    }

    // ---- Stored — POST to discovered forms, then re-fetch ----
    if (!testStored) continue;
    const initial = await safeFetch(pageUrl);
    if (!initial) continue;
    const forms = extractFormFields(initial.text);
    for (const form of forms) {
      const action = form.action ? new URL(form.action, pageUrl).href : pageUrl;
      for (const field of form.fields) {
        const payload = XSS_PAYLOADS[1]; // svg/onload (compact + distinctive)
        const fd = new FormData();
        fd.append(field, payload);
        const post = await safeFetch(action, { method: form.method, body: fd });
        if (!post) continue;
        // Look for stored reflection on the page after a moment
        const after = await safeFetch(pageUrl);
        if (!after) continue;
        const ctx = classifyContext(after.text, payload);
        if (ctx === "none" || ctx === "encoded") continue;
        out.push({
          route,
          url: pageUrl,
          parameter: field,
          payload,
          type: "stored",
          context: ctx,
          severity: severityFor(ctx),
          vulnerable: true,
          evidence: snippet(after.text, payload),
        });
      }
    }
  }

  return out;
}
