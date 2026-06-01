import { useState } from "react";
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
import { ShieldCheck, ShieldAlert, FileSearch, Bug, RefreshCw, Download, Network, ListChecks } from "lucide-react";
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
              <h1 className="text-2xl font-bold ml-4 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" /> Security
              </h1>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto space-y-6 min-w-0">
                <Tabs defaultValue="csp" className="w-full">
                  <div className="w-full overflow-x-auto -mx-1 px-1 pb-1">
                    <TabsList className="inline-flex w-max md:grid md:grid-cols-3 md:w-full md:max-w-2xl">
                      <TabsTrigger value="csp" className="whitespace-nowrap"><FileSearch className="h-4 w-4 mr-2" />CSP Diff</TabsTrigger>
                      <TabsTrigger value="headers" className="whitespace-nowrap"><ShieldCheck className="h-4 w-4 mr-2" />Header Tests</TabsTrigger>
                      <TabsTrigger value="blackbox" className="whitespace-nowrap"><Bug className="h-4 w-4 mr-2" />Black-box Scan</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="csp" className="mt-6 min-w-0"><CspDiffTab /></TabsContent>
                  <TabsContent value="headers" className="mt-6 min-w-0"><HeaderTestsTab /></TabsContent>
                  <TabsContent value="blackbox" className="mt-6 min-w-0"><BlackBoxTab /></TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
