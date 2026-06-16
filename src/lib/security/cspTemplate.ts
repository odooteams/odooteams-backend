// Recommended CSP template for OdooTeams
export const RECOMMENDED_CSP: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://*.supabase.co",
  ],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://www.google-analytics.com",
  ],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
  "upgrade-insecure-requests": [],
};

export const REQUIRED_HEADERS: Record<string, string | RegExp> = {
  "content-security-policy": /default-src/i,
  "strict-transport-security": /max-age=\d{7,}/i, // >= ~115 days
  "x-content-type-options": "nosniff",
  "x-frame-options": /DENY|SAMEORIGIN/i,
  "referrer-policy": /no-referrer|strict-origin/i,
  "permissions-policy": /.+/,
  "cross-origin-opener-policy": /same-origin/i,
  "cross-origin-resource-policy": /same-origin|same-site/i,
  "x-xss-protection": /0|1; mode=block/i,
};

export function parseCsp(value: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!value) return out;
  value.split(";").forEach((part) => {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return;
    const [name, ...rest] = tokens;
    out[name.toLowerCase()] = rest;
  });
  return out;
}

export interface CspDiff {
  directive: string;
  status: "missing" | "extra" | "ok" | "different";
  current: string[];
  recommended: string[];
  add: string[];
  remove: string[];
}

export function diffCsp(
  current: Record<string, string[]>,
  recommended: Record<string, string[]>
): CspDiff[] {
  const keys = new Set([...Object.keys(current), ...Object.keys(recommended)]);
  const result: CspDiff[] = [];
  keys.forEach((directive) => {
    const cur = current[directive] || [];
    const rec = recommended[directive] || [];
    const add = rec.filter((v) => !cur.includes(v));
    const remove = cur.filter((v) => !rec.includes(v));
    let status: CspDiff["status"] = "ok";
    if (!current[directive]) status = "missing";
    else if (!recommended[directive]) status = "extra";
    else if (add.length || remove.length) status = "different";
    result.push({ directive, status, current: cur, recommended: rec, add, remove });
  });
  return result.sort((a, b) => a.directive.localeCompare(b.directive));
}

export function buildCspString(map: Record<string, string[]>): string {
  return Object.entries(map)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}
