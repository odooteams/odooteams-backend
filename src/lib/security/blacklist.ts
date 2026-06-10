// IP blacklist / whitelist / security event helpers
import { supabase } from "@/integrations/supabase/client";

export interface BlacklistEntry {
  id: string;
  ip: string;
  reason: string;
  attempts: number;
  auto: boolean;
  severity: string;
  last_route: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhitelistEntry {
  id: string;
  ip: string;
  note: string | null;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  ip: string | null;
  user_id: string | null;
  event_type: string;
  severity: string;
  route: string | null;
  user_agent: string | null;
  details: any;
  created_at: string;
}

export async function listBlacklist(): Promise<BlacklistEntry[]> {
  const { data, error } = await supabase
    .from("ip_blacklist" as any)
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data as any) || [];
}

export async function listWhitelist(): Promise<WhitelistEntry[]> {
  const { data, error } = await supabase
    .from("ip_whitelist" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data as any) || [];
}

export async function listEvents(limit = 100): Promise<SecurityEvent[]> {
  const { data, error } = await supabase
    .from("security_events" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as any) || [];
}

export async function addBlacklist(ip: string, reason: string, severity = "high") {
  const { error } = await supabase.from("ip_blacklist" as any).insert({
    ip, reason, severity, auto: false, attempts: 1,
  });
  if (error) throw error;
}

export async function removeBlacklist(id: string) {
  const { error } = await supabase.from("ip_blacklist" as any).delete().eq("id", id);
  if (error) throw error;
}

export async function addWhitelist(ip: string, note?: string) {
  const { error } = await supabase.from("ip_whitelist" as any).insert({ ip, note });
  if (error) throw error;
}

export async function removeWhitelist(id: string) {
  const { error } = await supabase.from("ip_whitelist" as any).delete().eq("id", id);
  if (error) throw error;
}

export async function moveToWhitelist(entry: BlacklistEntry, note?: string) {
  await addWhitelist(entry.ip, note || `Restored from blacklist: ${entry.reason}`);
  await removeBlacklist(entry.id);
}

/** Report a security event from anywhere in the app. Auto-blacklist trigger handles repeat offenders. */
export async function reportSecurityEvent(opts: {
  event_type: string;
  severity?: "info" | "low" | "medium" | "high" | "critical";
  route?: string;
  details?: any;
}) {
  try {
    await supabase.from("security_events" as any).insert({
      event_type: opts.event_type,
      severity: opts.severity || "low",
      route: opts.route || (typeof window !== "undefined" ? window.location.pathname : null),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      details: opts.details || null,
    });
  } catch {
    /* swallow */
  }
}
