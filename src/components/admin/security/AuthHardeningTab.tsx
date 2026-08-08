import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, ExternalLink, KeyRound, Loader2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { checkPasswordSafety } from "@/lib/security/pwned";
import { runPreDeployAudit, type AuditReport } from "@/lib/security/preDeployAudit";

const PROJECT_REF = "eflevjjteuxhqkwqecvv";
const PROVIDERS_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`;
const POLICIES_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/auth/policies`;
const BASE_URL = "https://odooteams.com";

interface Step {
  id: string;
  title: string;
  detail: string;
  link?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    id: "leaked",
    title: "Enable “Prevent use of leaked passwords”",
    detail:
      "Authentication → Sign In / Providers → Email → turn on the HaveIBeenPwned check. This is a hosted project setting and cannot be changed from code.",
    link: { label: "Open Auth Providers", href: PROVIDERS_URL },
  },
  {
    id: "minlen",
    title: "Set minimum password length to 8+ and require mixed characters",
    detail: "Authentication → Policies → Password requirements. The app already enforces 8+ with letters and numbers.",
    link: { label: "Open Auth Policies", href: POLICIES_URL },
  },
  {
    id: "mfa",
    title: "Enable MFA (TOTP) for admin accounts",
    detail: "Authentication → Providers → Multi-Factor Authentication. Recommended for every account with the admin role.",
    link: { label: "Open Auth Providers", href: PROVIDERS_URL },
  },
  {
    id: "redirects",
    title: "Restrict redirect URLs to production + preview domains only",
    detail: "Authentication → URL Configuration. Wildcard redirects allow token theft via open redirect.",
    link: { label: "Open Auth Providers", href: PROVIDERS_URL },
  },
];

type SelfTest = { name: string; pass: boolean; note: string };

export default function AuthHardeningTab() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [tests, setTests] = useState<SelfTest[] | null>(null);
  const [rescanning, setRescanning] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);

  const allDone = STEPS.every((s) => done[s.id]);

  const runSelfTest = async () => {
    setTesting(true);
    setTests(null);
    try {
      const breached = await checkPasswordSafety("Password123");
      const weak = await checkPasswordSafety("abc123");
      const strong = await checkPasswordSafety(`Qz7${crypto.randomUUID().slice(0, 12)}Kp!`);
      const results: SelfTest[] = [
        {
          name: "Known breached password is blocked",
          pass: breached.breached || !!breached.weakReason,
          note: breached.offline ? "Breach API unreachable — local heuristics only" : `seen ${breached.count.toLocaleString()} times`,
        },
        {
          name: "Trivially weak password is blocked",
          pass: !!weak.weakReason || weak.breached,
          note: weak.weakReason || "blocked by breach corpus",
        },
        {
          name: "Strong unique password is accepted",
          pass: !strong.breached && !strong.weakReason,
          note: strong.offline ? "breach API unreachable (fails open)" : "not found in breach corpus",
        },
      ];
      setTests(results);
      const failed = results.filter((r) => !r.pass).length;
      failed === 0 ? toast.success("App-level leaked-password guard is active") : toast.error(`${failed} guard check(s) failed`);
    } finally {
      setTesting(false);
    }
  };

  const rescan = async () => {
    setRescanning(true);
    try {
      const r = await runPreDeployAudit(BASE_URL);
      setReport(r);
      toast.success(`Scan complete — score ${r.score}/100 (grade ${r.grade})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setRescanning(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> App-level leaked-password guard
          </CardTitle>
          <CardDescription>
            Signup and password reset check every password against the HaveIBeenPwned breach corpus using k-anonymity
            (only the first 5 characters of the SHA-1 hash are sent). Breached passwords are rejected even when the
            Supabase project setting is unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runSelfTest} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
            Run guard self-test
          </Button>
          {tests && (
            <div className="space-y-2">
              {tests.map((t) => (
                <div key={t.name} className="flex items-start gap-2 text-sm">
                  {t.pass ? (
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  )}
                  <span className="min-w-0">
                    {t.name} <span className="text-muted-foreground">— {t.note}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Auth hardening checklist</CardTitle>
          <CardDescription>Complete these steps in the Supabase dashboard, then re-run the scan below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id={s.id}
                checked={!!done[s.id]}
                onCheckedChange={(v) => setDone((d) => ({ ...d, [s.id]: !!v }))}
                className="mt-1"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <label htmlFor={s.id} className="font-medium text-sm cursor-pointer block">
                  {i + 1}. {s.title}
                </label>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
                {s.link && (
                  <a
                    href={s.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {s.link.label} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}

          <Alert variant={allDone ? "default" : "destructive"}>
            <AlertTitle>{allDone ? "Checklist complete" : "Checklist incomplete"}</AlertTitle>
            <AlertDescription className="text-xs">
              {allDone
                ? "Re-run the scan now so the leaked-password finding can be verified and closed."
                : "You can still re-run the scan, but findings for unchanged settings will reappear."}
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={rescan} disabled={rescanning}>
              {rescanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Run security scan again
            </Button>
            {report && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={report.grade === "A" ? "default" : "secondary"}>Grade {report.grade}</Badge>
                <span className="font-semibold">{report.score}/100</span>
                <span className="text-muted-foreground">{report.findings.length} findings</span>
                <span className="text-muted-foreground">{new Date(report.ranAt).toLocaleString()}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            This runs the same pre-deploy audit used by the Audit tab against {BASE_URL}. Supabase-hosted auth settings
            are also re-checked by the platform security scan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
