// CSRF protection inspector — checks for anti-CSRF tokens in HTML forms and
// validates Set-Cookie hardening flags (SameSite, HttpOnly, Secure) across
// admin/auth surfaces.

import { fetchHeaders } from "./scanner";

export interface CsrfFinding {
  route: string;
  url: string;
  category: "token" | "cookie" | "header" | "reachability";
  severity: "info" | "low" | "medium" | "high";
  pass: boolean;
  message: string;
  detail?: string;
}

export const DEFAULT_ADMIN_ROUTES = [
  "/admin",
  "/admin/users",
  "/admin/permissions",
  "/admin/settings",
  "/admin/security",
  "/auth/signin",
  "/auth/signup",
];

const TOKEN_NAME_RE =
  /name=["'](?:csrf|csrf_token|csrfmiddlewaretoken|_token|authenticity_token|xsrf|_csrf)["']/i;
const META_CSRF_RE = /<meta[^>]+name=["']csrf-token["'][^>]*>/i;
const FORM_RE = /<form\b[^>]*>([\s\S]*?)<\/form>/gi;
const METHOD_RE = /method=["']?(post|put|patch|delete)["']?/i;

async function safeFetch(url: string): Promise<Response | null> {
  try {
    return await fetch(url, { credentials: "omit", mode: "cors" });
  } catch {
    return null;
  }
}

function inspectCookie(setCookie: string): {
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
} {
  return {
    secure: /;\s*secure/i.test(setCookie),
    httpOnly: /;\s*httponly/i.test(setCookie),
    sameSite: /;\s*samesite=([^;]+)/i.exec(setCookie)?.[1]?.trim() || null,
  };
}

export async function runCsrfAudit(
  baseUrl: string,
  routes: string[] = DEFAULT_ADMIN_ROUTES,
  opts?: { onProgress?: (msg: string) => void }
): Promise<CsrfFinding[]> {
  const out: CsrfFinding[] = [];
  const base = baseUrl.replace(/\/$/, "");
  const log = (m: string) => opts?.onProgress?.(m);

  for (const route of routes) {
    const url = base + route;
    log(`Inspecting ${route}…`);
    const res = await safeFetch(url);
    if (!res) {
      out.push({
        route,
        url,
        category: "reachability",
        severity: "low",
        pass: false,
        message: "Could not fetch route (CORS or network)",
      });
      continue;
    }

    // --- Cookie hardening ---
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      const { secure, httpOnly, sameSite } = inspectCookie(setCookie);
      const ok = secure && httpOnly && !!sameSite && /strict|lax/i.test(sameSite);
      out.push({
        route,
        url,
        category: "cookie",
        severity: ok ? "info" : "high",
        pass: ok,
        message: `Cookie flags — Secure:${secure} HttpOnly:${httpOnly} SameSite:${sameSite || "missing"}`,
      });
    } else {
      out.push({
        route,
        url,
        category: "cookie",
        severity: "info",
        pass: true,
        message: "No Set-Cookie issued at this route",
      });
    }

    // --- HTML form / token inspection ---
    const html = await res.text().catch(() => "");
    const forms = Array.from(html.matchAll(FORM_RE));
    if (forms.length === 0) {
      out.push({
        route,
        url,
        category: "token",
        severity: "info",
        pass: true,
        message: "No <form> tags on this route (SPA likely posts via fetch)",
      });
    } else {
      for (const f of forms) {
        const body = f[1];
        const isMutating = METHOD_RE.test(f[0]);
        if (!isMutating) continue;
        const hasToken = TOKEN_NAME_RE.test(body);
        out.push({
          route,
          url,
          category: "token",
          severity: hasToken ? "info" : "high",
          pass: hasToken,
          message: hasToken
            ? "Anti-CSRF token field present in mutating form"
            : "Mutating form has no recognizable anti-CSRF token",
        });
      }
    }

    // --- Meta CSRF token (Rails / Django / Laravel pattern) ---
    out.push({
      route,
      url,
      category: "token",
      severity: META_CSRF_RE.test(html) ? "info" : "low",
      pass: META_CSRF_RE.test(html),
      message: META_CSRF_RE.test(html)
        ? "<meta name=\"csrf-token\"> present"
        : "No <meta name=\"csrf-token\"> tag (OK for token-in-header SPAs)",
    });
  }

  // --- Origin-level header check (one-shot) ---
  const rootHeaders = await fetchHeaders(base + "/");
  if (rootHeaders) {
    const xfo = rootHeaders.get("x-frame-options");
    const csp = rootHeaders.get("content-security-policy") || "";
    const framed = !!xfo || /frame-ancestors/i.test(csp);
    out.push({
      route: "/",
      url: base + "/",
      category: "header",
      severity: framed ? "info" : "high",
      pass: framed,
      message: framed
        ? "Clickjacking protection present (X-Frame-Options or frame-ancestors)"
        : "Missing X-Frame-Options and frame-ancestors — clickjacking enables CSRF UI redress",
    });
  }

  return out;
}
