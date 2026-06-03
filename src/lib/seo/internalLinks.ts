// Internal-link analyzer. Fetches a set of pages and reports outbound internal
// vs external links, orphan pages, and anchor-text distribution.

export interface PageLinkStats {
  url: string;
  ok: boolean;
  status?: number;
  internalLinks: string[];
  externalLinks: string[];
  anchors: Record<string, number>; // anchor text -> count
  h1Count: number;
  title: string;
  metaDescription: string;
  wordCount: number;
}

export interface InternalLinkReport {
  baseUrl: string;
  pages: PageLinkStats[];
  inbound: Record<string, number>; // path -> number of inbound internal links from scanned pages
  orphans: string[]; // pages with zero inbound links
  topAnchors: { anchor: string; count: number }[];
  averageInternal: number;
  externalDomains: Record<string, number>;
}

const HREF_RE = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const META_DESC_RE = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i;
const H1_RE = /<h1\b/gi;

function stripTags(s: string) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isInternal(href: string, origin: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return new URL(href, origin).origin === origin;
  } catch {
    return false;
  }
}

function normalizePath(href: string, origin: string): string {
  try {
    const u = new URL(href, origin);
    return u.pathname.replace(/\/$/, "") || "/";
  } catch {
    return href;
  }
}

export async function analyzeInternalLinks(
  baseUrl: string,
  routes: string[],
  onProgress?: (msg: string) => void
): Promise<InternalLinkReport> {
  const origin = new URL(baseUrl).origin;
  const pages: PageLinkStats[] = [];

  for (const route of routes) {
    const full = origin + route;
    onProgress?.(`Fetching ${route}…`);
    let html = "";
    let status = 0;
    let ok = false;
    try {
      const res = await fetch(full, { mode: "cors" });
      status = res.status;
      ok = res.ok;
      html = await res.text();
    } catch {
      pages.push({
        url: route,
        ok: false,
        internalLinks: [],
        externalLinks: [],
        anchors: {},
        h1Count: 0,
        title: "",
        metaDescription: "",
        wordCount: 0,
      });
      continue;
    }

    const internal: string[] = [];
    const external: string[] = [];
    const anchors: Record<string, number> = {};

    for (const m of html.matchAll(HREF_RE)) {
      const href = m[1];
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
      const text = stripTags(m[2]).slice(0, 80) || "(no text)";
      anchors[text] = (anchors[text] || 0) + 1;
      if (isInternal(href, origin)) internal.push(normalizePath(href, origin));
      else external.push(href);
    }

    const title = TITLE_RE.exec(html)?.[1]?.trim() || "";
    const metaDescription = META_DESC_RE.exec(html)?.[1]?.trim() || "";
    const h1Count = (html.match(H1_RE) || []).length;
    const body = stripTags(html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, ""));
    const wordCount = body.split(/\s+/).filter(Boolean).length;

    pages.push({
      url: route,
      ok,
      status,
      internalLinks: internal,
      externalLinks: external,
      anchors,
      h1Count,
      title,
      metaDescription,
      wordCount,
    });
  }

  // Inbound counts
  const inbound: Record<string, number> = {};
  for (const r of routes) inbound[r.replace(/\/$/, "") || "/"] = 0;
  for (const p of pages) {
    for (const link of p.internalLinks) {
      const key = link.replace(/\/$/, "") || "/";
      if (key in inbound && key !== (p.url.replace(/\/$/, "") || "/")) inbound[key]++;
    }
  }
  const orphans = Object.entries(inbound).filter(([, n]) => n === 0).map(([p]) => p);

  // Top anchors
  const anchorAgg: Record<string, number> = {};
  for (const p of pages) for (const [a, c] of Object.entries(p.anchors)) anchorAgg[a] = (anchorAgg[a] || 0) + c;
  const topAnchors = Object.entries(anchorAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([anchor, count]) => ({ anchor, count }));

  // External domains
  const externalDomains: Record<string, number> = {};
  for (const p of pages)
    for (const ext of p.externalLinks) {
      try {
        const host = new URL(ext).hostname.replace(/^www\./, "");
        externalDomains[host] = (externalDomains[host] || 0) + 1;
      } catch {
        /* ignore */
      }
    }

  const averageInternal = pages.length ? pages.reduce((a, p) => a + p.internalLinks.length, 0) / pages.length : 0;

  return { baseUrl: origin, pages, inbound, orphans, topAnchors, averageInternal, externalDomains };
}
