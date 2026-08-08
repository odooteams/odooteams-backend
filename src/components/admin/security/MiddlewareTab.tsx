// Backend / edge middleware status panel
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, ShieldAlert, Server, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { runMiddlewareChecks, middlewareScore, type MiddlewareCheck } from "@/lib/security/middleware";

const DEFAULT_BASE_URL = "https://odooteams.com";

export default function MiddlewareTab() {
  const [url, setUrl] = useState(DEFAULT_BASE_URL);
  const [checks, setChecks] = useState<MiddlewareCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await runMiddlewareChecks(url);
      setChecks(r);
      toast.success("Middleware status refreshed");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const score = middlewareScore(checks);
  const gradeColor =
    score.grade === "A" ? "text-green-600" :
    score.grade === "B" ? "text-emerald-600" :
    score.grade === "C" ? "text-yellow-600" :
    score.grade === "D" ? "text-orange-600" : "text-red-600";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Backend Security Middleware</CardTitle>
        <CardDescription>
          Verifies rate limiting, HSTS, CSP, CSRF, cookie hardening, and IP blacklist are active. Produces a weighted pass/fail score.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-[1fr_auto] gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Target URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <Button onClick={run} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Checking…" : "Run middleware check"}
          </Button>
        </div>

        {checks.length > 0 && (
          <div className="grid md:grid-cols-4 gap-3">
            <div className="border rounded p-4 text-center">
              <div className={`text-4xl font-bold ${gradeColor}`}>{score.grade}</div>
              <div className="text-xs text-muted-foreground">Grade</div>
            </div>
            <div className="border rounded p-4 text-center">
              <div className={`text-4xl font-bold ${gradeColor}`}>{score.score}</div>
              <div className="text-xs text-muted-foreground">Score / 100</div>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="text-4xl font-bold text-green-600">{score.pass}</div>
              <div className="text-xs text-muted-foreground">Passing</div>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="text-4xl font-bold text-red-600">{score.fail}</div>
              <div className="text-xs text-muted-foreground">Failing</div>
            </div>
          </div>
        )}

        {checks.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Check</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                  <TableCell>
                    {c.pass ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <ShieldCheck className="h-4 w-4" /> Pass
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                        <ShieldAlert className="h-4 w-4" /> Fail
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
