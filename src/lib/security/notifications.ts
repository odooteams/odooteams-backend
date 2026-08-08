// Admin notification helpers — insert/read alerts shown in the admin bell.
import { supabase } from "@/integrations/supabase/client";
import type { FullScanReport } from "./fullScan";

export interface AdminNotification {
  id: string;
  type: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  message: string | null;
  link: string | null;
  metadata: any;
  read_at: string | null;
  created_at: string;
}

export async function listNotifications(limit = 50): Promise<AdminNotification[]> {
  const { data, error } = await supabase
    .from("admin_notifications" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as any) || [];
}

export async function countUnread(): Promise<number> {
  const { count, error } = await supabase
    .from("admin_notifications" as any)
    .select("id", { head: true, count: "exact" })
    .is("read_at", null);
  if (error) return 0;
  return count || 0;
}

export async function markAllRead() {
  await supabase
    .from("admin_notifications" as any)
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
}

export async function markRead(id: string) {
  await supabase
    .from("admin_notifications" as any)
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
}

export async function deleteNotification(id: string) {
  await supabase.from("admin_notifications" as any).delete().eq("id", id);
}

export async function pushNotification(n: {
  type: string;
  severity?: AdminNotification["severity"];
  title: string;
  message?: string;
  link?: string;
  metadata?: any;
}) {
  try {
    await supabase.from("admin_notifications" as any).insert({
      type: n.type,
      severity: n.severity || "medium",
      title: n.title,
      message: n.message || null,
      link: n.link || "/admin/security",
      metadata: n.metadata || null,
    });
  } catch {
    /* RLS will block non-admins; ignore */
  }
}

/** Notify admins when a full scan turns up medium/high issues. */
export async function notifyOnScanReport(report: FullScanReport, label?: string) {
  const s = report.summary;
  const high =
    s.owasp.fail + s.csrf.fail + s.blackbox.fail + s.sqli.high + s.xss.high;
  const medium = s.headers.fail + s.network.mixed + s.network.missingSri;
  if (high === 0 && medium === 0) return;

  await pushNotification({
    type: "scan_finding",
    severity: high > 0 ? "high" : "medium",
    title: high > 0 ? `Security scan: ${high} high-severity issues` : `Security scan: ${medium} issues`,
    message: `${label || report.baseUrl} — OWASP:${s.owasp.fail}✗ CSRF:${s.csrf.fail}✗ Headers:${s.headers.fail}✗ SQLi:${s.sqli.high} XSS:${s.xss.high}`,
    link: "/admin/security",
    metadata: { summary: s, baseUrl: report.baseUrl, label },
  });
}

/** Generic helper used by individual tabs (OWASP/XSS/SQLi/Blackbox). */
export async function notifyOnFindings(opts: {
  scanner: string;
  highCount: number;
  mediumCount: number;
  target: string;
}) {
  if (opts.highCount === 0 && opts.mediumCount === 0) return;
  await pushNotification({
    type: "scan_finding",
    severity: opts.highCount > 0 ? "high" : "medium",
    title: `${opts.scanner}: ${opts.highCount + opts.mediumCount} issue${
      opts.highCount + opts.mediumCount === 1 ? "" : "s"
    }`,
    message: `${opts.scanner} on ${opts.target} — high:${opts.highCount} medium:${opts.mediumCount}`,
    link: "/admin/security",
    metadata: opts,
  });
}
