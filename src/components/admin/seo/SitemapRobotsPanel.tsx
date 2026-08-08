import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Download, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Languages, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  buildSitemapXml,
  collectSitemapEntries,
  validateRobots,
  SITE_BASE_URL,
  type RobotsIssue,
  type SitemapEntry,
} from '@/lib/seo/sitemapBuilder';
import { runHreflangAudit, type HreflangAuditReport } from '@/lib/seo/hreflangAudit';

const levelIcon = (level: string) =>
  level === 'error' ? <XCircle className="h-4 w-4 text-destructive" /> :
  level === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
  <CheckCircle2 className="h-4 w-4 text-green-600" />;

export default function SitemapRobotsPanel() {
  /* ------------------------------- sitemap ------------------------------ */
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [xml, setXml] = useState('');
  const [building, setBuilding] = useState(false);
  const [buildErrors, setBuildErrors] = useState<string[]>([]);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  const regenerate = async () => {
    setBuilding(true);
    setBuildErrors([]);
    try {
      const { entries: rows, errors } = await collectSitemapEntries();
      setEntries(rows);
      setXml(buildSitemapXml(rows));
      setBuildErrors(errors);
      if (errors.length) toast.error(`Sitemap built with ${errors.length} source error(s)`);
      else toast.success(`Sitemap regenerated — ${rows.length} URLs`);
    } catch (err: any) {
      setBuildErrors([err?.message || String(err)]);
      toast.error('Failed to regenerate sitemap');
    } finally {
      setBuilding(false);
    }
  };

  const loadLive = async () => {
    try {
      const res = await fetch('/sitemap.xml', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const text = await res.text();
      setLiveCount((text.match(/<loc>/g) || []).length);
    } catch {
      setLiveCount(null);
    }
  };

  useEffect(() => { loadLive(); }, []);

  const downloadXml = () => {
    if (!xml) return;
    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('sitemap.xml downloaded');
  };

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] || 0) + 1;
    return acc;
  }, {});

  /* ------------------------------- robots ------------------------------- */
  const [robots, setRobots] = useState('');
  const [robotsIssues, setRobotsIssues] = useState<RobotsIssue[] | null>(null);
  const [loadingRobots, setLoadingRobots] = useState(false);

  const loadRobots = async () => {
    setLoadingRobots(true);
    try {
      const res = await fetch('/robots.txt', { cache: 'no-store' });
      const text = await res.text();
      setRobots(text);
      setRobotsIssues(validateRobots(text));
      toast.success('robots.txt loaded and validated');
    } catch (err: any) {
      toast.error('Could not load /robots.txt');
      setRobotsIssues([{ level: 'error', message: 'robots.txt could not be fetched.' }]);
    } finally {
      setLoadingRobots(false);
    }
  };

  useEffect(() => { loadRobots(); }, []);

  /* ------------------------------ hreflang ------------------------------ */
  const [audit, setAudit] = useState<HreflangAuditReport | null>(null);
  const [auditing, setAuditing] = useState(false);

  const runAudit = async () => {
    setAuditing(true);
    try {
      const report = await runHreflangAudit();
      setAudit(report);
      if (report.errors) toast.error(`${report.errors} hreflang/canonical error(s) found`);
      else if (report.warnings) toast.warning(`${report.warnings} warning(s) found`);
      else toast.success('Hreflang and canonicals are consistent');
    } catch (err: any) {
      toast.error(err?.message || 'Audit failed');
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sitemap */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Sitemap generator</CardTitle>
              <CardDescription>Rebuild sitemap.xml from every published row (services, projects, blogs, learn resources)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadLive}><RefreshCw className="h-4 w-4 mr-2" />Check live file</Button>
              <Button onClick={regenerate} disabled={building}>
                <RefreshCw className={`h-4 w-4 mr-2 ${building ? 'animate-spin' : ''}`} />
                {building ? 'Regenerating…' : 'Regenerate sitemap.xml'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">Live /sitemap.xml: {liveCount ?? 'unavailable'} URLs</Badge>
            <Badge variant="outline">Generated: {entries.length} URLs</Badge>
            {Object.entries(counts).map(([k, v]) => <Badge key={k} variant="secondary">{k}: {v}</Badge>)}
          </div>

          {buildErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Some sources failed</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">{buildErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </AlertDescription>
            </Alert>
          )}

          {liveCount !== null && entries.length > 0 && liveCount !== entries.length && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Deployed sitemap is out of date</AlertTitle>
              <AlertDescription>
                The live file has {liveCount} URLs but {entries.length} are publishable. Download the generated file into
                <code className="mx-1">public/sitemap.xml</code> (or redeploy — it regenerates on every build).
              </AlertDescription>
            </Alert>
          )}

          {xml && (
            <>
              <Textarea rows={10} readOnly className="font-mono text-xs" value={xml} />
              <div className="flex gap-2">
                <Button onClick={downloadXml}><Download className="h-4 w-4 mr-2" />Download sitemap.xml</Button>
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(xml); toast.success('XML copied'); }}>
                  <Copy className="h-4 w-4 mr-2" />Copy
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* robots.txt */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>robots.txt validation</CardTitle>
              <CardDescription>Fetches the deployed /robots.txt and checks directives, sitemap reference and private areas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadRobots} disabled={loadingRobots}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingRobots ? 'animate-spin' : ''}`} />Reload
              </Button>
              <Button onClick={() => { setRobotsIssues(validateRobots(robots)); toast.success('Validated'); }}>
                <ShieldCheck className="h-4 w-4 mr-2" />Validate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea rows={10} className="font-mono text-sm" value={robots} onChange={(e) => setRobots(e.target.value)} />
          {robotsIssues && (
            <div className="space-y-2">
              {robotsIssues.map((i, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  {levelIcon(i.level)}<span>{i.message}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Base URL used for checks: {SITE_BASE_URL}</p>
        </CardContent>
      </Card>

      {/* hreflang audit */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Hreflang &amp; canonical consistency</CardTitle>
              <CardDescription>Warns when AR/EN canonicals, alternates, meta or JSON-LD do not match the rendered page</CardDescription>
            </div>
            <Button onClick={runAudit} disabled={auditing}>
              <Languages className={`h-4 w-4 mr-2 ${auditing ? 'animate-pulse' : ''}`} />
              {auditing ? 'Auditing…' : 'Run audit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!audit && <p className="text-sm text-muted-foreground">Run the audit to check every published item.</p>}
          {audit && (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive">{audit.errors} errors</Badge>
                <Badge variant="secondary">{audit.warnings} warnings</Badge>
                <Badge variant="outline">{audit.ok} clean of {audit.rows.length}</Badge>
              </div>
              {audit.fetchErrors.map((e, i) => (
                <Alert variant="destructive" key={i}><AlertDescription>{e}</AlertDescription></Alert>
              ))}
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {audit.rows.map((r) => (
                  <div key={`${r.table}-${r.id}`} className="border rounded-lg p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground break-all" dir="ltr">{r.expectedCanonical}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{r.table}</Badge>
                        <Badge variant={r.score >= 90 ? 'default' : r.score >= 60 ? 'secondary' : 'destructive'}>{r.score}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5" dir="ltr">
                      <div>hreflang en → {r.hreflang.en}</div>
                      <div>hreflang ar → {r.hreflang.ar}</div>
                      <div>x-default → {r.hreflang.xDefault}</div>
                    </div>
                    {r.issues.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Consistent</div>
                    ) : (
                      <ul className="space-y-1">
                        {r.issues.map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            {levelIcon(i.level)}<span><span className="font-medium">{i.field}:</span> {i.message}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
