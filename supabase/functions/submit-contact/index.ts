// Public edge function that accepts contact + quote submissions with:
// - honeypot rejection
// - per-IP rate limiting
// - idempotency via dedupe hash
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RATE_LIMITS = {
  contact: { windowSec: 60, max: 3, dailyMax: 20 },
  quote: { windowSec: 60, max: 3, dailyMax: 30 },
};
const DEDUPE_WINDOW_SEC = 600; // 10 min — same payload silently deduped

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  return (xff.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown").slice(0, 64);
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const {
    type, // 'contact' | 'quote'
    full_name,
    email,
    phone,
    company,
    subject,
    message,
    project_title,
    project_cost,
    // anti-bot
    website, // honeypot — must be empty
    hp_company, // alt honeypot — must be empty
    form_loaded_at, // ms timestamp client set on render
  } = body || {};

  // Honeypot — silently accept (return success) so bots can't tell.
  if ((website && String(website).trim()) || (hp_company && String(hp_company).trim())) {
    return json({ success: true, deduped: true });
  }

  // Min fill time — bots submit instantly.
  if (typeof form_loaded_at === "number") {
    const elapsed = Date.now() - form_loaded_at;
    if (elapsed < 1500) {
      return json({ success: true, deduped: true });
    }
  }

  // Validate
  const submissionType = type === "quote" ? "quote" : "contact";
  if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2 || full_name.length > 100) {
    return json({ error: "Invalid name" }, 400);
  }
  if (!email || typeof email !== "string" || !isEmail(email) || email.length > 255) {
    return json({ error: "Invalid email" }, 400);
  }
  if (!message && submissionType === "contact") {
    return json({ error: "Message required" }, 400);
  }
  if (message && (typeof message !== "string" || message.length > 2000)) {
    return json({ error: "Invalid message" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const ip = getIp(req);
  const limits = RATE_LIMITS[submissionType];
  const now = Date.now();

  // Per-IP windowed rate limit
  const sinceWindow = new Date(now - limits.windowSec * 1000).toISOString();
  const sinceDay = new Date(now - 24 * 3600 * 1000).toISOString();

  const [{ count: recentCount }, { count: dayCount }] = await Promise.all([
    supabase
      .from("submission_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("submission_type", submissionType)
      .gte("created_at", sinceWindow),
    supabase
      .from("submission_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .eq("submission_type", submissionType)
      .gte("created_at", sinceDay),
  ]);

  if ((recentCount ?? 0) >= limits.max || (dayCount ?? 0) >= limits.dailyMax) {
    return json(
      { error: "Too many requests. Please try again later." },
      429,
    );
  }

  // Idempotency / dedupe
  const fingerprint = [
    submissionType,
    email.trim().toLowerCase(),
    (phone || "").trim(),
    (message || project_title || "").trim().slice(0, 500),
  ].join("|");
  const dedupe_hash = await sha256Hex(fingerprint);

  const sinceDedupe = new Date(now - DEDUPE_WINDOW_SEC * 1000).toISOString();
  const { data: dup } = await supabase
    .from("submission_rate_limits")
    .select("id")
    .eq("dedupe_hash", dedupe_hash)
    .gte("created_at", sinceDedupe)
    .limit(1)
    .maybeSingle();

  if (dup) {
    return json({ success: true, deduped: true });
  }

  // Persist contact submission (quote requests are also saved here with subject)
  const finalSubject = submissionType === "quote"
    ? `[Quote] ${project_title || subject || ""}${project_cost ? ` (~${project_cost})` : ""}`
    : (subject || null);

  const finalMessage = submissionType === "quote"
    ? `${message || ""}\n\n— Project: ${project_title || ""}${project_cost ? `\n— Estimated cost: ${project_cost}` : ""}`.trim()
    : message;

  const { error: insertErr } = await supabase
    .from("contact_submissions")
    .insert({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim().slice(0, 50) : null,
      company: company ? String(company).trim().slice(0, 100) : null,
      subject: finalSubject ? String(finalSubject).slice(0, 200) : null,
      message: finalMessage || "(no message)",
      status: "new",
      dedupe_hash,
    });

  if (insertErr) {
    console.error("Insert error:", insertErr);
    return json({ error: "Failed to save submission" }, 500);
  }

  await supabase.from("submission_rate_limits").insert({
    ip_address: ip,
    submission_type: submissionType,
    dedupe_hash,
  });

  // Fire-and-forget notifications (client confirmation + admin alert)
  const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification-email`;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const lang = (body?.lang === "ar" ? "ar" : "en") as "ar" | "en";
  const baseData = {
    type: submissionType,
    name: full_name,
    email: email.trim().toLowerCase(),
    phone,
    company,
    subject: finalSubject,
    message: finalMessage,
  };
  const post = (kind: string) =>
    fetch(notifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}`, apikey: anonKey },
      body: JSON.stringify({ kind, lang, data: baseData }),
    }).catch((e) => console.error(`notify ${kind} failed:`, e?.message));

  // Don't await — keep response fast
  post("contact_confirmation");
  post("contact_admin_alert");

  return json({ success: true });
});
