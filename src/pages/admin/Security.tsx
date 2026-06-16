import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/seo/SEOHead";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, ShieldAlert, FileSearch, Bug, RefreshCw, Download, Network, ListChecks, KeyRound, Database, Code2, Rocket, Server, Ban } from "lucide-react";
import BlacklistTab from "@/components/admin/security/BlacklistTab";
import MiddlewareTab from "@/components/admin/security/MiddlewareTab";
import AdminNotificationsBell from "@/components/admin/AdminNotificationsBell";
import { notifyOnScanReport, notifyOnFindings } from "@/lib/security/notifications";
import {
  RECOMMENDED_CSP,
  parseCsp,
  diffCsp,
  buildCspString,
  type CspDiff,
} from "@/lib/security/cspTemplate";
import { fetchHeaders, checkHeaders, probeRoute, type ProbeResult, type HeaderCheck } from "@/lib/security/scanner";
import { PUBLIC_ROUTES_TO_TEST } from "@/lib/security/routes";
import { runOwaspAudit, OWASP_LABELS, type OwaspCategory, type OwaspFinding } from "@/lib/security/owasp";
import { fetchHtml, extractResources, summarize, type Resource } from "@/lib/security/network";
import { runCsrfAudit, DEFAULT_ADMIN_ROUTES, type CsrfFinding } from "@/lib/security/csrf";
import { runSqliFuzz, type SqliFinding } from "@/lib/security/sqli-fuzzer";
import { runXssScan, type XssFinding } from "@/lib/security/xss-scan";
import { runFullScan, type FullScanReport } from "@/lib/security/fullScan";
import { generateNginxConfig, generateCloudflareTransformRules, generateApacheHtaccess } from "@/lib/security/serverConfigs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// --------- CSP Diff Tab ---------
const DEFAULT_BASE_URL = "https://odooteams.com";

function CspDiffTab() {
  const [url, setUrl] = useState(DEFAULT_BASE_URL);
  const [loading, setLoading] = useState(false);
  const [currentCspRaw, setCurrentCspRaw] = useState("");
  const [diffs, setDiffs] = useState<CspDiff[]>([]);
  const [template, setTemplate] = useState(buildCspString(RECOMMENDED_CSP));

  const run = async () => {
    setLoading(true);
    try {
      const headers = await fetchHeaders(url);
      const csp = headers?.get("content-security-policy") || "";
      setCurrentCspRaw(csp);
      const cur = parseCsp(csp);
      const tpl = parseCsp(template);
      setDiffs(diffCsp(cur, tpl));
      if (!csp) toast.warning("No CSP header found on response");
      else toast.success("CSP fetched & diffed");
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch CSP");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s: CspDiff["status"]) => {
    const map = {
      ok: ["default", "OK"],
      missing: ["destructive", "Missing"],
      extra: ["secondary", "Extra"],
      different: ["outline", "Different"],
    } as const;
    const [variant, label] = map[s];
    return <Badge variant={variant as any}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSP Diff</CardTitle>
          <CardDescription>Compare a live site's CSP header against the recommended template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com" />
            <Button onClick={run} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Fetch & Diff
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current CSP (live)</Label>
              <Textarea rows={5} value={currentCspRaw} readOnly className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>Recommended Template (editable)</Label>
              <Textarea rows={5} value={template} onChange={(e) => setTemplate(e.target.value)} className="font-mono text-xs" />
            </div>
          </div>
        </CardContent>
      </Card>

      {diffs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Directive-by-directive Diff</CardTitle>
            <CardDescription>Green = match. Red = needs change.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Directive</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Add</TableHead>
                  <TableHead>Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffs.map((d) => (
                  <TableRow key={d.directive}>
                    <TableCell className="font-mono text-xs">{d.directive}</TableCell>
                    <TableCell>{statusBadge(d.status)}</TableCell>
                    <TableCell className="font-mono text-xs text-green-600">{d.add.join(" ") || "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-red-600">{d.remove.join(" ") || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --------- Header Tests Runner ---------
function HeaderTestsTab() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [routes, setRoutes] = useState(PUBLIC_ROUTES_TO_TEST.join("\n"));
  const [results, setResults] = useState<{ route: string; checks: HeaderCheck[] }[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResults([]);
    const list = routes.split("\n").map((r) => r.trim()).filter(Boolean);
    const out: typeof results = [];
    for (const r of list) {
      const headers = await fetchHeaders(baseUrl.replace(/\/$/, "") + r);
      out.push({ route: r, checks: headers ? checkHeaders(headers) : [] });
    }
    setResults(out);
    setLoading(false);
    toast.success(`Tested ${list.length} routes`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Header Tests</CardTitle>
        <CardDescription>Validate CSP, HSTS, Permissions-Policy and more across routes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Routes (one per line)</Label>
            <Textarea rows={4} value={routes} onChange={(e) => setRoutes(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        <Button onClick={run} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Run Tests
        </Button>

        {results.map((r) => (
          <div key={r.route} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium">{r.route}</code>
              {r.checks.length === 0 && <Badge variant="destructive">Unreachable</Badge>}
            </div>
            {r.checks.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                {c.pass ? (
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                )}
                <span className="font-mono">{c.name}</span>
                <span className="text-muted-foreground truncate">{c.value || "missing"}</span>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// --------- Black-box Scanner ---------
function BlackBoxTab() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [routes, setRoutes] = useState(PUBLIC_ROUTES_TO_TEST.slice(0, 4).join("\n"));
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResults([]);
    const list = routes.split("\n").map((r) => r.trim()).filter(Boolean);
    const all: ProbeResult[] = [];
    for (const r of list) {
      const probe = await probeRoute(baseUrl, r);
      all.push(...probe);
      setResults([...all]);
    }
    setLoading(false);
    toast.success("Black-box scan complete");
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sevColor = (s: ProbeResult["severity"]) =>
    ({ info: "secondary", low: "outline", medium: "default", high: "destructive" }[s] as any);

  const summary = results.reduce(
    (acc, r) => ({ ...acc, [r.severity]: (acc as any)[r.severity] + (r.pass ? 0 : 1) }),
    { info: 0, low: 0, medium: 0, high: 0 } as Record<string, number>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Black-box Security Scan</CardTitle>
        <CardDescription>
          Passive + safe active probes: headers, cookies, exposed paths, reflected XSS heuristics, SQLi error leaks, mixed content & TLS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Routes</Label>
            <Textarea rows={4} value={routes} onChange={(e) => setRoutes(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={run} disabled={loading}>
            <Bug className={`h-4 w-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Scanning..." : "Start Scan"}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" /> Export JSON
            </Button>
          )}
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {(["high", "medium", "low", "info"] as const).map((k) => (
              <div key={k} className="border rounded p-3 text-center">
                <div className="text-2xl font-bold">{summary[k]}</div>
                <div className="text-xs text-muted-foreground capitalize">{k} issues</div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs max-w-xs truncate">{r.url}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell><Badge variant={sevColor(r.severity)}>{r.severity}</Badge></TableCell>
                  <TableCell>
                    {r.pass ? (
                      <Badge variant="default" className="bg-green-600">Pass</Badge>
                    ) : (
                      <Badge variant="destructive">Fail</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{r.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// --------- OWASP Top 10 Audit ---------
function OwaspTab() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [routes, setRoutes] = useState(PUBLIC_ROUTES_TO_TEST.slice(0, 5).join("\n"));
  const [findings, setFindings] = useState<OwaspFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const run = async () => {
    setLoading(true);
    setFindings([]);
    setProgress("Starting…");
    try {
      const list = routes.split("\n").map((r) => r.trim()).filter(Boolean);
      const out = await runOwaspAudit(baseUrl, list, { onProgress: setProgress });
      setFindings(out);
      toast.success(`OWASP audit complete — ${out.length} checks`);
    } catch (e: any) {
      toast.error(e.message || "Audit failed");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const grouped = findings.reduce<Record<OwaspCategory, OwaspFinding[]>>((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {} as any);

  const sevBadge = (s: OwaspFinding["severity"], pass: boolean) => {
    if (pass) return <Badge variant="default" className="bg-green-600">Pass</Badge>;
    const map = { info: "secondary", low: "outline", medium: "default", high: "destructive" } as const;
    return <Badge variant={map[s] as any}>{s}</Badge>;
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(findings, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `owasp-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OWASP Top 10 (2021) Audit</CardTitle>
        <CardDescription>
          Heuristic checks across all ten OWASP categories — headers, TLS, injection, SRI, auth surfaces, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Routes to probe (injection tests)</Label>
            <Textarea rows={4} value={routes} onChange={(e) => setRoutes(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={run} disabled={loading}>
            <ListChecks className={`h-4 w-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Auditing…" : "Run OWASP Audit"}
          </Button>
          {findings.length > 0 && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" /> Export JSON
            </Button>
          )}
        </div>
        {progress && <p className="text-xs text-muted-foreground">{progress}</p>}

        {findings.length > 0 && (
          <div className="space-y-4">
            {(Object.keys(OWASP_LABELS) as OwaspCategory[]).map((cat) => {
              const items = grouped[cat] || [];
              if (items.length === 0) return null;
              const failing = items.filter((i) => !i.pass).length;
              return (
                <div key={cat} className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-muted flex items-center justify-between">
                    <span className="font-semibold text-sm">{OWASP_LABELS[cat]}</span>
                    <Badge variant={failing > 0 ? "destructive" : "default"} className={failing === 0 ? "bg-green-600" : ""}>
                      {failing > 0 ? `${failing} issues` : "All pass"}
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Check</TableHead>
                        <TableHead className="w-24">Result</TableHead>
                        <TableHead>Detail</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((f, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-sm">{f.title}</TableCell>
                          <TableCell>{sevBadge(f.severity, f.pass)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{f.detail}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --------- Network & CDN Inspector ---------
function NetworkTab() {
  const [url, setUrl] = useState(DEFAULT_BASE_URL);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof summarize> | null>(null);

  const run = async () => {
    setLoading(true);
    setResources([]);
    setSummary(null);
    try {
      const html = await fetchHtml(url);
      if (!html) {
        toast.error("Could not fetch page (CORS or network)");
        return;
      }
      const items = extractResources(html, url);
      setResources(items);
      setSummary(summarize(items, url));
      toast.success(`Found ${items.length} resources`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Network & CDN Inspector</CardTitle>
          <CardDescription>
            Pulls the rendered HTML, classifies every external script/stylesheet/image/iframe by CDN provider, and flags missing SRI & mixed-content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com" />
            <Button onClick={run} disabled={loading}>
              <Network className={`h-4 w-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Scanning…" : "Inspect"}
            </Button>
          </div>

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="border rounded p-3 text-center">
                <div className="text-2xl font-bold">{summary.totalExternal}</div>
                <div className="text-xs text-muted-foreground">External resources</div>
              </div>
              <div className="border rounded p-3 text-center">
                <div className="text-2xl font-bold">{Object.keys(summary.byCdn).length}</div>
                <div className="text-xs text-muted-foreground">Distinct CDNs</div>
              </div>
              <div className="border rounded p-3 text-center">
                <div className={`text-2xl font-bold ${summary.mixedContent.length ? "text-red-600" : ""}`}>
                  {summary.mixedContent.length}
                </div>
                <div className="text-xs text-muted-foreground">Mixed-content (http)</div>
              </div>
              <div className="border rounded p-3 text-center">
                <div className={`text-2xl font-bold ${summary.missingSri.length ? "text-orange-600" : ""}`}>
                  {summary.missingSri.length}
                </div>
                <div className="text-xs text-muted-foreground">Missing SRI</div>
              </div>
            </div>
          )}

          {summary && Object.keys(summary.byCdn).length > 0 && (
            <div>
              <Label className="mb-2 block">CDN breakdown</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.byCdn)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cdn, n]) => (
                    <Badge key={cdn} variant="secondary">{cdn} · {n}</Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>{resources.length} resources detected on the page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>CDN</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Proto</TableHead>
                    <TableHead>SRI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell><Badge variant="outline">{r.tag}</Badge></TableCell>
                      <TableCell className="text-xs">{r.cdn}</TableCell>
                      <TableCell className="font-mono text-xs max-w-md truncate">{r.url}</TableCell>
                      <TableCell>
                        {r.protocol === "https:" ? (
                          <Badge className="bg-green-600">https</Badge>
                        ) : r.protocol === "http:" ? (
                          <Badge variant="destructive">http</Badge>
                        ) : (
                          <Badge variant="secondary">{r.protocol}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {(r.tag === "script" || r.tag === "link") ? (
                          r.hasIntegrity ? (
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-orange-600" />
                          )
                        ) : <span className="text-muted-foreground text-xs">n/a</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --------- CSRF Audit ---------
function CsrfTab() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [routes, setRoutes] = useState(DEFAULT_ADMIN_ROUTES.join("\n"));
  const [findings, setFindings] = useState<CsrfFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const run = async () => {
    setLoading(true);
    setFindings([]);
    try {
      const list = routes.split("\n").map((r) => r.trim()).filter(Boolean);
      const out = await runCsrfAudit(baseUrl, list, { onProgress: setProgress });
      setFindings(out);
      toast.success(`CSRF audit complete — ${out.length} checks`);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const sevBadge = (s: CsrfFinding["severity"], pass: boolean) => {
    if (pass) return <Badge variant="default" className="bg-green-600">Pass</Badge>;
    const map = { info: "secondary", low: "outline", medium: "default", high: "destructive" } as const;
    return <Badge variant={map[s] as any}>{s}</Badge>;
  };

  const totals = {
    pass: findings.filter((f) => f.pass).length,
    fail: findings.filter((f) => !f.pass).length,
    high: findings.filter((f) => !f.pass && f.severity === "high").length,
  };

  const downloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      totals,
      findings,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `csrf-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSRF Protection Audit</CardTitle>
        <CardDescription>
          Checks anti-CSRF tokens on mutating forms and validates Set-Cookie SameSite/HttpOnly/Secure flags on admin & auth routes. Produces a pass/fail report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Admin / auth routes</Label>
            <Textarea rows={5} value={routes} onChange={(e) => setRoutes(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={run} disabled={loading}>
            <KeyRound className={`h-4 w-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Auditing…" : "Run CSRF Audit"}
          </Button>
          {findings.length > 0 && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" /> Export Report
            </Button>
          )}
        </div>
        {progress && <p className="text-xs text-muted-foreground">{progress}</p>}

        {findings.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="border rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{totals.pass}</div>
              <div className="text-xs text-muted-foreground">Pass</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{totals.fail}</div>
              <div className="text-xs text-muted-foreground">Fail</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{totals.high}</div>
              <div className="text-xs text-muted-foreground">High severity</div>
            </div>
          </div>
        )}

        {findings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{f.route}</TableCell>
                  <TableCell>{f.category}</TableCell>
                  <TableCell>{sevBadge(f.severity, f.pass)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// --------- SQL Injection Fuzzer ---------
function SqliTab() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [routes, setRoutes] = useState(PUBLIC_ROUTES_TO_TEST.slice(0, 4).join("\n"));
  const [extra, setExtra] = useState("");
  const [findings, setFindings] = useState<SqliFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const run = async () => {
    setLoading(true);
    setFindings([]);
    try {
      const list = routes.split("\n").map((r) => r.trim()).filter(Boolean);
      const extras = extra.split(",").map((s) => s.trim()).filter(Boolean);
      const out = await runSqliFuzz(baseUrl, list, { extraParams: extras, onProgress: setProgress });
      setFindings(out);
      toast.success(`Fuzzing complete — ${out.length} signals`);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const sevBadge = (s: SqliFinding["severity"]) => {
    const map = { info: "secondary", low: "outline", medium: "default", high: "destructive" } as const;
    return <Badge variant={map[s] as any}>{s}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SQL Injection Fuzzer</CardTitle>
        <CardDescription>
          Sends a battery of SQLi payloads against common query parameters and any discovered HTML form fields, flagging DB-error leaks, status flips and large length deltas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Routes</Label>
            <Textarea rows={4} value={routes} onChange={(e) => setRoutes(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Extra parameters (comma-separated, optional)</Label>
          <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="invoice_id, ticket, code" />
        </div>
        <Button onClick={run} disabled={loading}>
          <Database className={`h-4 w-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
          {loading ? "Fuzzing…" : "Start SQLi Fuzz"}
        </Button>
        {progress && <p className="text-xs text-muted-foreground">{progress}</p>}

        {findings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Param</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Payload</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{f.route}</TableCell>
                  <TableCell className="font-mono text-xs">{f.parameter}</TableCell>
                  <TableCell><Badge variant="outline">{f.method}</Badge></TableCell>
                  <TableCell className="font-mono text-xs max-w-xs truncate">{f.payload}</TableCell>
                  <TableCell>{sevBadge(f.severity)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.signal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && findings.length === 0 && (
          <p className="text-sm text-muted-foreground">No findings yet — run the fuzzer.</p>
        )}
      </CardContent>
    </Card>
  );
}

// --------- XSS Scanner ---------
function XssTab() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [routes, setRoutes] = useState(PUBLIC_ROUTES_TO_TEST.slice(0, 4).join("\n"));
  const [extra, setExtra] = useState("");
  const [stored, setStored] = useState(true);
  const [findings, setFindings] = useState<XssFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const run = async () => {
    setLoading(true);
    setFindings([]);
    try {
      const list = routes.split("\n").map((r) => r.trim()).filter(Boolean);
      const extras = extra.split(",").map((s) => s.trim()).filter(Boolean);
      const out = await runXssScan(baseUrl, list, {
        extraParams: extras,
        testStored: stored,
        onProgress: setProgress,
      });
      setFindings(out);
      toast.success(`XSS scan complete — ${out.length} reflections`);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const sevBadge = (s: XssFinding["severity"]) => {
    const map = { info: "secondary", low: "outline", medium: "default", high: "destructive" } as const;
    return <Badge variant={map[s] as any}>{s}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>XSS Scanner</CardTitle>
        <CardDescription>
          Tests reflected & stored XSS payloads against common parameters and discovered form fields. Reports the rendering context of each reflection so you can judge exploitability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Routes</Label>
            <Textarea rows={4} value={routes} onChange={(e) => setRoutes(e.target.value)} className="font-mono text-xs" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Extra parameters (comma-separated, optional)</Label>
            <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="comment, title, slug" />
          </div>
          <div className="flex items-end gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={stored} onChange={(e) => setStored(e.target.checked)} />
              Also test stored XSS (POST then re-fetch)
            </label>
          </div>
        </div>
        <Button onClick={run} disabled={loading}>
          <Code2 className={`h-4 w-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
          {loading ? "Scanning…" : "Run XSS Scan"}
        </Button>
        {progress && <p className="text-xs text-muted-foreground">{progress}</p>}

        {findings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Param</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{f.route}</TableCell>
                  <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{f.parameter}</TableCell>
                  <TableCell><Badge variant="secondary">{f.context}</Badge></TableCell>
                  <TableCell>{sevBadge(f.severity)}</TableCell>
                  <TableCell className="font-mono text-xs max-w-md truncate">{f.evidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && findings.length === 0 && (
          <p className="text-sm text-muted-foreground">No reflections detected yet — run the scan.</p>
        )}
      </CardContent>
    </Card>
  );
}


// --------- Full Scan ---------
interface SavedScan {
  id: string;
  label: string;
  savedAt: string;
  report: FullScanReport;
}

function FullScanTab() {
  const { user } = useAuth();
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [pct, setPct] = useState(0);
  const [report, setReport] = useState<FullScanReport | null>(null);
  const [saved, setSaved] = useState<SavedScan[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const fetchSaved = async () => {
    if (!user?.id) return;
    setLoadingSaved(true);
    const { data, error } = await supabase
      .from("security_scans")
      .select("id, label, created_at, report")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast.error("Could not load saved scans: " + error.message);
    } else {
      setSaved(
        (data || []).map((row: any) => ({
          id: row.id,
          label: row.label,
          savedAt: row.created_at,
          report: row.report as FullScanReport,
        }))
      );
    }
    setLoadingSaved(false);
  };

  useEffect(() => {
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const run = async () => {
    if (!baseUrl.trim()) {
      toast.error("Please enter a URL to scan");
      return;
    }
    if (!user?.id) {
      toast.error("You must be signed in to save scans");
      return;
    }
    let target = baseUrl.trim();
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;

    setLoading(true);
    setReport(null);
    setPct(0);
    try {
      const r = await runFullScan(target, (msg, p) => {
        setProgress(msg);
        setPct(p);
      });
      setReport(r);

      const finalLabel =
        label.trim() ||
        (() => {
          try {
            return new URL(r.baseUrl).hostname;
          } catch {
            return r.baseUrl;
          }
        })();

      const { error } = await supabase.from("security_scans").insert({
        user_id: user.id,
        label: finalLabel,
        target_url: r.baseUrl,
        started_at: r.startedAt,
        finished_at: r.finishedAt,
        summary: r.summary as any,
        report: r as any,
      });
      if (error) {
        toast.error("Scan ran but failed to save: " + error.message);
      } else {
        toast.success("Full scan complete — saved to your account");
        fetchSaved();
      }
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (r: FullScanReport | null = report) => {
    if (!r) return;
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `full-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const deleteSaved = async (id: string) => {
    const { error } = await supabase.from("security_scans").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete: " + error.message);
      return;
    }
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAll = async () => {
    if (!user?.id) return;
    if (!confirm("Delete all saved scans? This cannot be undone.")) return;
    const { error } = await supabase.from("security_scans").delete().eq("user_id", user.id);
    if (error) {
      toast.error("Failed to clear: " + error.message);
      return;
    }
    setSaved([]);
    toast.success("Saved scans cleared");
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Full Security Scan</CardTitle>
        <CardDescription>
          Runs Headers + OWASP Top 10 + CSRF + SQLi + XSS + Black-box + Network/CDN against any URL and saves the consolidated report for later review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <div className="space-y-1">
            <Label htmlFor="full-scan-url" className="text-xs">Target URL</Label>
            <Input
              id="full-scan-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="full-scan-label" className="text-xs">Label (optional)</Label>
            <Input
              id="full-scan-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Pre-release prod"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={run} disabled={loading} size="lg" className="w-full">
              <Rocket className={`h-4 w-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Scanning…" : "Run Full Scan"}
            </Button>
          </div>
        </div>

        {loading && (
          <div className="space-y-2">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground">{progress} ({pct}%)</p>
          </div>
        )}

        {report && (() => {
          const s = report.summary;
          const weights = { headers: 2, owasp: 3, csrf: 3, blackbox: 2, sqli: 3, xss: 3, network: 1 };
          let earned = 0, total = 0;
          total += weights.headers * (s.headers.pass + s.headers.fail);
          earned += weights.headers * s.headers.pass;
          total += weights.owasp * (s.owasp.pass + s.owasp.fail);
          earned += weights.owasp * s.owasp.pass;
          total += weights.csrf * (s.csrf.pass + s.csrf.fail);
          earned += weights.csrf * s.csrf.pass;
          total += weights.blackbox * (s.blackbox.pass + s.blackbox.fail);
          earned += weights.blackbox * s.blackbox.pass;
          // findings count as failures
          const sqliPenalty = s.sqli.high * weights.sqli;
          const xssPenalty = s.xss.high * weights.xss;
          const netPenalty = s.network.mixed * weights.network;
          total += sqliPenalty + xssPenalty + netPenalty;
          const score = total === 0 ? 100 : Math.round((earned / total) * 100);
          const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
          const color = grade === "A" ? "text-green-600" : grade === "B" ? "text-emerald-600" : grade === "C" ? "text-yellow-600" : grade === "D" ? "text-orange-600" : "text-red-600";
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Latest scan results</h3>
                <Button variant="outline" size="sm" onClick={() => downloadReport(report)}>
                  <Download className="h-4 w-4 mr-2" /> Export JSON
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="border rounded-lg p-4 text-center">
                  <div className={`text-5xl font-bold ${color}`}>{grade}</div>
                  <div className="text-xs text-muted-foreground mt-1">Overall security grade</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className={`text-5xl font-bold ${color}`}>{score}</div>
                  <div className="text-xs text-muted-foreground mt-1">Score / 100</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-5xl font-bold">{s.owasp.fail + s.csrf.fail + s.headers.fail + s.blackbox.fail + s.sqli.high + s.xss.high}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total issues</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  ["Headers", `${s.headers.pass}✓ / ${s.headers.fail}✗`, s.headers.fail],
                  ["OWASP", `${s.owasp.pass}✓ / ${s.owasp.fail}✗`, s.owasp.fail],
                  ["CSRF", `${s.csrf.pass}✓ / ${s.csrf.fail}✗`, s.csrf.fail],
                  ["Black-box", `${s.blackbox.pass}✓ / ${s.blackbox.fail}✗`, s.blackbox.fail],
                  ["SQLi findings", String(s.sqli.findings), s.sqli.high],
                  ["XSS findings", String(s.xss.findings), s.xss.high],
                  ["External resources", String(s.network.external), 0],
                  ["Mixed content", String(s.network.mixed), s.network.mixed],
                ].map(([lbl, val, bad]) => (
                  <div key={lbl as string} className="border rounded p-3 text-center">
                    <div className={`text-xl font-bold ${(bad as number) > 0 ? "text-red-600" : ""}`}>{val as string}</div>
                    <div className="text-xs text-muted-foreground">{lbl as string}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Scanned {report.baseUrl} · {new Date(report.startedAt).toLocaleString()}
                {" → "}
                {new Date(report.finishedAt).toLocaleTimeString()}
              </p>
            </div>
          );
        })()}

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Saved scans ({saved.length}){loadingSaved && " · loading…"}
            </h3>
            {saved.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
            )}
          </div>
          {saved.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No saved scans yet. Completed scans are stored on your admin account and available across devices.
            </p>

          ) : (
            <div className="space-y-2">
              {saved.map((s) => {
                const sum = s.report.summary;
                const totalFail =
                  sum.headers.fail + sum.owasp.fail + sum.csrf.fail + sum.blackbox.fail + sum.sqli.high + sum.xss.high;
                return (
                  <div key={s.id} className="border rounded p-3 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-medium text-sm">{s.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {s.report.baseUrl} · {new Date(s.savedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${totalFail > 0 ? "text-red-600" : "text-green-600"}`}>
                      {totalFail > 0 ? `${totalFail} issues` : "All passed"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReport(s.report)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => downloadReport(s.report)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSaved(s.id)}>Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --------- Server Config Snippets ---------
function ServerConfigTab() {
  const [domain, setDomain] = useState("odooteams.com");
  const [csp, setCsp] = useState(buildCspString(RECOMMENDED_CSP));
  const nginx = generateNginxConfig({ domain, csp });
  const cf = generateCloudflareTransformRules({ domain, csp });
  const apache = generateApacheHtaccess({ domain, csp });

  const dl = (name: string, content: string, mime = "text/plain") => {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Server Config Generator</CardTitle>
          <CardDescription>Drop-in Nginx, Cloudflare, and Apache snippets that set every missing security header.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CSP (editable)</Label>
              <Textarea rows={3} value={csp} onChange={(e) => setCsp(e.target.value)} className="font-mono text-xs" />
            </div>
          </div>
        </CardContent>
      </Card>

      {[
        { title: "Nginx", filename: "nginx-security.conf", content: nginx },
        { title: "Cloudflare Transform Rules", filename: "cloudflare-rules.txt", content: cf },
        { title: "Apache .htaccess", filename: ".htaccess", content: apache },
      ].map((s) => (
        <Card key={s.title}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>Copy/paste or download.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => dl(s.filename, s.content)}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea rows={14} readOnly value={s.content} className="font-mono text-xs" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// --------- Main page ---------
export default function AdminSecurity() {
  return (
    <>
      <SEOHead title="Admin • Security" description="CSP diff, header tests and black-box security scan" />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-6 bg-background">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold ml-4 flex items-center gap-2 flex-1">
                <ShieldCheck className="h-6 w-6" /> Security
              </h1>
              <AdminNotificationsBell />
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6 min-w-0">
                <Tabs defaultValue="full" className="w-full">
                  <div className="w-full overflow-x-auto -mx-1 px-1 pb-1">
                    <TabsList className="inline-flex w-max md:grid md:grid-cols-12 md:w-full">
                      <TabsTrigger value="full" className="whitespace-nowrap"><Rocket className="h-4 w-4 mr-2" />Full Scan</TabsTrigger>
                      <TabsTrigger value="middleware" className="whitespace-nowrap"><Server className="h-4 w-4 mr-2" />Middleware</TabsTrigger>
                      <TabsTrigger value="blacklist" className="whitespace-nowrap"><Ban className="h-4 w-4 mr-2" />Blacklist</TabsTrigger>
                      <TabsTrigger value="owasp" className="whitespace-nowrap"><ListChecks className="h-4 w-4 mr-2" />OWASP</TabsTrigger>
                      <TabsTrigger value="csrf" className="whitespace-nowrap"><KeyRound className="h-4 w-4 mr-2" />CSRF</TabsTrigger>
                      <TabsTrigger value="xss" className="whitespace-nowrap"><Code2 className="h-4 w-4 mr-2" />XSS</TabsTrigger>
                      <TabsTrigger value="sqli" className="whitespace-nowrap"><Database className="h-4 w-4 mr-2" />SQLi Fuzz</TabsTrigger>
                      <TabsTrigger value="network" className="whitespace-nowrap"><Network className="h-4 w-4 mr-2" />Network</TabsTrigger>
                      <TabsTrigger value="csp" className="whitespace-nowrap"><FileSearch className="h-4 w-4 mr-2" />CSP Diff</TabsTrigger>
                      <TabsTrigger value="headers" className="whitespace-nowrap"><ShieldCheck className="h-4 w-4 mr-2" />Headers</TabsTrigger>
                      <TabsTrigger value="blackbox" className="whitespace-nowrap"><Bug className="h-4 w-4 mr-2" />Black-box</TabsTrigger>
                      <TabsTrigger value="server" className="whitespace-nowrap"><Server className="h-4 w-4 mr-2" />Server Config</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="full" className="mt-6 min-w-0"><FullScanTab /></TabsContent>
                  <TabsContent value="middleware" className="mt-6 min-w-0"><MiddlewareTab /></TabsContent>
                  <TabsContent value="blacklist" className="mt-6 min-w-0"><BlacklistTab /></TabsContent>
                  <TabsContent value="owasp" className="mt-6 min-w-0"><OwaspTab /></TabsContent>
                  <TabsContent value="csrf" className="mt-6 min-w-0"><CsrfTab /></TabsContent>
                  <TabsContent value="xss" className="mt-6 min-w-0"><XssTab /></TabsContent>
                  <TabsContent value="sqli" className="mt-6 min-w-0"><SqliTab /></TabsContent>
                  <TabsContent value="network" className="mt-6 min-w-0"><NetworkTab /></TabsContent>
                  <TabsContent value="csp" className="mt-6 min-w-0"><CspDiffTab /></TabsContent>
                  <TabsContent value="headers" className="mt-6 min-w-0"><HeaderTestsTab /></TabsContent>
                  <TabsContent value="blackbox" className="mt-6 min-w-0"><BlackBoxTab /></TabsContent>
                  <TabsContent value="server" className="mt-6 min-w-0"><ServerConfigTab /></TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
