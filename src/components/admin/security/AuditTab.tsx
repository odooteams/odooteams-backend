import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Download, AlertTriangle, CheckCircle2, History } from "lucide-react";
import { toast } from "sonner";
import {
  runPreDeployAudit,
  diffAudits,
  type AuditReport,
  type AuditDiff,
  type AuditFinding,
} from "@/lib/security/preDeployAudit";

const BASELINE_URL = "/security-reports/latest.json";
const LOCAL_KEY = "security-audit-latest";
const DEFAULT_BASE_URL = "https://odooteams.com";

const sevColor = (s: AuditFinding["severity"]) =>
  s === "critical" ? "destructive" : s === "high" ? "destructive" : s === "medium" ? "secondary" : "outline";

function ReportSummary({ report, label }: { report: AuditReport; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Badge variant="outline">{label}</Badge>
      <span className="font-semibold">
        {report.score}/100 · grade {report.grade}
      </span>
      <span className="text-muted-foreground">{report.passed} checks passed</span>
      <span className="text-muted-foreground">{report.findings.length} findings</span>
      <span className="text-muted-foreground">{new Date(report.ranAt).toLocaleString()}</span>
    </div>
  );
}

export default function AuditTab() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [baseline, setBaseline] = useState<AuditReport | null>(null);
  const [current, setCurrent] = useState<AuditReport | null>(null);
  const [diff, setDiff] = useState<AuditDiff | null>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState("");
  const [pct, setPct] = useState(0);

  const loadBaseline = useCallback(async () => {
    try {
      const res = await fetch(`${BASELINE_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as AuditReport;
        setBaseline(json);
        return json;
      }
    } catch {
      /* ignore */
    }
    setBaseline(null);
    return null;
  }, []);

  useEffect(() => {
    loadBaseline();
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        setCurrent(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [loadBaseline]);

  useEffect(() => {
    if (baseline && current) setDiff(diffAudits(baseline, current));
  }, [baseline, current]);

  const rerun = async () => {
    setRunning(true);
    setPct(0);
    try {
      const fresh = await loadBaseline();
      const report = await runPreDeployAudit(baseUrl, (s, p) => {
        setStep(s);
        setPct(p);
      });
      setCurrent(report);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(report));
      if (fresh) setDiff(diffAudits(fresh, report));
      toast.success(`Scan complete — ${report.score}/100 (grade ${report.grade})`);
    } catch (e: any) {
      toast.error(e?.message || "Scan failed");
    } finally {
      setRunning(false);
      setStep("");
    }
  };

  const download = () => {
    if (!current) return;
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "latest.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6 min-w-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" /> Security Audit
          </CardTitle>
          <CardDescription>
            Re-runs the pre-deploy security scan (headers, robots/sitemap, live RLS probes), reloads the committed
            <code className="mx-1">latest.json</code> baseline and shows the staleness diff.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-0">
              <Label htmlFor="audit-base">Base URL</Label>
              <Input id="audit-base" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} dir="ltr" />
            </div>
            <div className="flex gap-2">
              <Button onClick={rerun} disabled={running}>
                <RefreshCw className={`h-4 w-4 mr-2 ${running ? "animate-spin" : ""}`} />
                {running ? "Scanning…" : "Re-run scan"}
              </Button>
              <Button variant="outline" onClick={download} disabled={!current}>
                <Download className="h-4 w-4 mr-2" /> latest.json
              </Button>
            </div>
          </div>

          {running && (
            <div className="space-y-2">
              <Progress value={pct} />
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          )}

          <div className="space-y-2">
            {baseline ? (
              <ReportSummary report={baseline} label="Baseline (latest.json)" />
            ) : (
              <p className="text-sm text-muted-foreground">
                No committed baseline found at <code>{BASELINE_URL}</code> — run <code>bun run security:scan</code>.
              </p>
            )}
            {current && <ReportSummary report={current} label="Latest run" />}
          </div>
        </CardContent>
      </Card>

      {diff && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Staleness diff
            </CardTitle>
            <CardDescription>
              Baseline is {diff.baselineAgeHours < 1 ? "less than an hour" : `${Math.round(diff.baselineAgeHours)} hour(s)`} old ·{" "}
              score change {diff.scoreDelta > 0 ? `+${diff.scoreDelta}` : diff.scoreDelta}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant={diff.stale ? "destructive" : "outline"} className="gap-1">
              {diff.stale ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
              {diff.stale ? "latest.json is stale — regenerate it" : "latest.json matches the live scan"}
            </Badge>

            {[
              ["New findings", diff.newFindings],
              ["Resolved since baseline", diff.resolvedFindings],
              ["Still open", diff.unchangedFindings],
            ].map(([label, list]) => {
              const items = list as AuditFinding[];
              if (!items.length) return null;
              return (
                <div key={label as string} className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    {label as string} ({items.length})
                  </h4>
                  {items.map((f) => (
                    <div key={f.id} className="rounded-md border p-3 text-sm space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={sevColor(f.severity) as any}>{f.severity}</Badge>
                        <span className="font-medium">{f.title}</span>
                      </div>
                      <p className="text-muted-foreground break-words">{f.detail}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {current && current.passedChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Passed checks ({current.passedChecks.length})</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {current.passedChecks.map((c) => (
              <div key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span className="break-words">{c}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
