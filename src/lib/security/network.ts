// Network & CDN inspector — pulls the rendered HTML of a target URL,
// classifies external resources by host/CDN, and flags missing SRI / mixed content.

export interface Resource {
  tag: "script" | "link" | "img" | "iframe";
  url: string;
  host: string;
  cdn: string;
  hasIntegrity: boolean;
  hasCrossorigin: boolean;
  protocol: "http:" | "https:" | "other";
}

const CDN_MAP: Array<[RegExp, string]> = [
  [/cdn\.jsdelivr\.net/i, "jsDelivr"],
  [/cdnjs\.cloudflare\.com/i, "cdnjs (Cloudflare)"],
  [/unpkg\.com/i, "UNPKG"],
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/i, "Google Fonts"],
  [/ajax\.googleapis\.com|googletagmanager\.com|google-analytics\.com/i, "Google"],
  [/stackpath|bootstrapcdn/i, "BootstrapCDN"],
  [/cloudfront\.net/i, "AWS CloudFront"],
  [/akamai/i, "Akamai"],
  [/fastly/i, "Fastly"],
  [/(supabase\.co|supabase\.in)/i, "Supabase"],
  [/lovable\.app|gpteng\.co/i, "Lovable / GPT Engineer"],
  [/githubusercontent|raw\.github/i, "GitHub"],
  [/youtube\.com|ytimg\.com/i, "YouTube"],
  [/twitter\.com|x\.com|twimg/i, "Twitter/X"],
  [/facebook\.com|fbcdn/i, "Facebook"],
];

function classifyCdn(host: string): string {
  for (const [re, name] of CDN_MAP) if (re.test(host)) return name;
  return "First-party / unknown";
}

export async function fetchHtml(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { credentials: "omit" });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

export function extractResources(html: string, pageOrigin: string): Resource[] {
  const items: Resource[] = [];
  const patterns: Array<{ tag: Resource["tag"]; re: RegExp; attr: string }> = [
    { tag: "script", re: /<script\b([^>]*)>/gi, attr: "src" },
    { tag: "link", re: /<link\b([^>]*)>/gi, attr: "href" },
    { tag: "img", re: /<img\b([^>]*)>/gi, attr: "src" },
    { tag: "iframe", re: /<iframe\b([^>]*)>/gi, attr: "src" },
  ];

  for (const { tag, re, attr } of patterns) {
    for (const m of html.matchAll(re)) {
      const attrs = m[1] || "";
      const srcMatch = new RegExp(`${attr}=["']([^"']+)["']`, "i").exec(attrs);
      if (!srcMatch) continue;
      const raw = srcMatch[1];
      let absoluteUrl: URL;
      try {
        absoluteUrl = new URL(raw, pageOrigin);
      } catch { continue; }
      // Skip same-origin first-party assets unless it's a link tag (preload/stylesheet)
      if (absoluteUrl.origin === new URL(pageOrigin).origin && tag === "img") continue;
      const protocol = absoluteUrl.protocol === "https:"
        ? "https:"
        : absoluteUrl.protocol === "http:"
          ? "http:"
          : "other";
      items.push({
        tag,
        url: absoluteUrl.href,
        host: absoluteUrl.host,
        cdn: classifyCdn(absoluteUrl.host),
        hasIntegrity: /\bintegrity=/i.test(attrs),
        hasCrossorigin: /\bcrossorigin=/i.test(attrs),
        protocol,
      });
    }
  }
  return items;
}

export interface NetworkSummary {
  totalExternal: number;
  byCdn: Record<string, number>;
  mixedContent: Resource[];
  missingSri: Resource[]; // only script/link to stylesheet are SRI-eligible
}

export function summarize(resources: Resource[], pageOrigin: string): NetworkSummary {
  const origin = new URL(pageOrigin).origin;
  const external = resources.filter((r) => new URL(r.url).origin !== origin);
  const byCdn: Record<string, number> = {};
  for (const r of external) byCdn[r.cdn] = (byCdn[r.cdn] || 0) + 1;
  const mixedContent = external.filter((r) => r.protocol === "http:");
  const missingSri = external.filter(
    (r) => (r.tag === "script" || r.tag === "link") && !r.hasIntegrity
  );
  return { totalExternal: external.length, byCdn, mixedContent, missingSri };
}
