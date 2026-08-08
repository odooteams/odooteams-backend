// Off-page SEO helpers: backlink-prospect templates, outreach email scaffolds,
// and a competitor-domain checklist. All client-side (no API calls).

export interface BacklinkProspect {
  category: string;
  name: string;
  url: string;
  authority: "high" | "medium" | "low";
  type: "directory" | "forum" | "guest-post" | "qa" | "social" | "review" | "press";
  notes: string;
}

export const BACKLINK_PROSPECTS: BacklinkProspect[] = [
  // Directories
  { category: "Business directory", name: "Clutch", url: "https://clutch.co/", authority: "high", type: "directory", notes: "B2B service-provider directory; rich Odoo / ERP category." },
  { category: "Business directory", name: "GoodFirms", url: "https://www.goodfirms.co/", authority: "high", type: "directory", notes: "Submit company profile under ERP / Odoo Partners." },
  { category: "Business directory", name: "G2", url: "https://www.g2.com/", authority: "high", type: "review", notes: "List service & collect reviews from real clients." },
  { category: "Business directory", name: "Odoo Partners", url: "https://www.odoo.com/partners", authority: "high", type: "directory", notes: "Official partner listing — strongest topical relevance." },
  { category: "Local SEO", name: "Google Business Profile", url: "https://business.google.com/", authority: "high", type: "directory", notes: "Required for local-pack rankings & Maps." },
  { category: "Local SEO", name: "Bing Places", url: "https://www.bingplaces.com/", authority: "medium", type: "directory", notes: "Mirror of GBP for Bing." },
  // Q&A / Forums
  { category: "Q&A", name: "Stack Overflow (odoo tag)", url: "https://stackoverflow.com/questions/tagged/odoo", authority: "high", type: "qa", notes: "Answer Odoo questions; link to detailed posts on your site." },
  { category: "Q&A", name: "Odoo Forum", url: "https://www.odoo.com/forum/help-1", authority: "high", type: "forum", notes: "Topically perfect — answer with linked deep-dives." },
  { category: "Q&A", name: "Reddit r/Odoo", url: "https://www.reddit.com/r/Odoo/", authority: "medium", type: "forum", notes: "Helpful answers > self-promo." },
  { category: "Q&A", name: "Quora (Odoo topic)", url: "https://www.quora.com/topic/Odoo", authority: "medium", type: "qa", notes: "Long-form answers age well for SEO." },
  // Guest posts
  { category: "Guest posts", name: "Medium", url: "https://medium.com/", authority: "medium", type: "guest-post", notes: "Republish flagship posts with canonical -> your site." },
  { category: "Guest posts", name: "Dev.to", url: "https://dev.to/", authority: "medium", type: "guest-post", notes: "Technical Odoo tutorials." },
  { category: "Guest posts", name: "HackerNoon", url: "https://hackernoon.com/", authority: "medium", type: "guest-post", notes: "Editorial pitches on ERP / SMB digital transformation." },
  // Social
  { category: "Social", name: "LinkedIn Company Page", url: "https://www.linkedin.com/", authority: "high", type: "social", notes: "Post case studies & link to project pages." },
  { category: "Social", name: "YouTube channel", url: "https://www.youtube.com/", authority: "high", type: "social", notes: "Tutorial videos with descriptions pointing back to /learn-odoo." },
  { category: "Social", name: "GitHub org", url: "https://github.com/", authority: "high", type: "social", notes: "Open-source Odoo modules with website link in profile." },
  // Press / PR
  { category: "Press", name: "HARO (Connectively)", url: "https://www.connectively.us/", authority: "high", type: "press", notes: "Respond to journalist queries about ERP/Odoo for editorial links." },
  { category: "Press", name: "PRWeb", url: "https://www.prweb.com/", authority: "medium", type: "press", notes: "Distribute milestone press releases." },
];

export const OUTREACH_TEMPLATES = {
  guestPost: `Subject: Guest post idea: "{topic}" for {site}

Hi {firstName},

I really enjoyed your recent piece on {recentArticle}. I run OdooTeams — we
implement Odoo ERP for SMBs — and I'd love to contribute a deep-dive on
"{topic}" for your readers.

A rough outline:
  • {bullet1}
  • {bullet2}
  • {bullet3}

I can submit a 1200–1500 word, original draft with custom screenshots
within 10 days. Happy to adjust the angle if you'd prefer a different
take.

Best,
{yourName}
https://odooteams.com`,

  brokenLink: `Subject: Broken link on {pageTitle}

Hi {firstName},

While reading {pageUrl} I noticed the link to {brokenUrl} returns 404.
We've published a comprehensive guide that covers the same topic and
could be a clean drop-in replacement:

{yourUrl}

Either way, thought you'd want to know about the dead link.

Cheers,
{yourName}`,

  resourcePage: `Subject: Resource for {pageTitle}

Hi {firstName},

Your roundup at {pageUrl} is one of the most useful Odoo resource pages
I've seen. I just published {yourUrl} — a {pageType} on {topic} that
your readers might find valuable.

No worries if it's not a fit — keep up the great work.

— {yourName}, OdooTeams`,
};

export const OFF_PAGE_CHECKLIST = [
  { id: "gbp", label: "Claim & verify Google Business Profile", priority: "high" },
  { id: "partner", label: "Listed on Odoo official Partners page", priority: "high" },
  { id: "clutch", label: "Profile on Clutch with ≥ 5 verified reviews", priority: "high" },
  { id: "goodfirms", label: "Profile on GoodFirms", priority: "medium" },
  { id: "linkedin", label: "Active LinkedIn company page (weekly posts)", priority: "high" },
  { id: "youtube", label: "YouTube channel with implementation/tutorial videos", priority: "medium" },
  { id: "github", label: "GitHub org publishing open-source Odoo modules", priority: "medium" },
  { id: "haro", label: "HARO / Connectively responses sent weekly", priority: "medium" },
  { id: "guestposts", label: "≥ 1 guest post placed per month", priority: "high" },
  { id: "qa", label: "Weekly answers on Stack Overflow / Odoo forum / Quora", priority: "medium" },
  { id: "press", label: "Quarterly press release for milestones", priority: "low" },
  { id: "schemaOrg", label: "Organization + LocalBusiness JSON-LD on home page", priority: "high" },
  { id: "nap", label: "Consistent NAP (Name/Address/Phone) across all listings", priority: "high" },
  { id: "reviews", label: "Active review-collection workflow after each project", priority: "high" },
];
