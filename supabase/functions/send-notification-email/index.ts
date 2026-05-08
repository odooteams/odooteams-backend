// Sends emails via Hostinger SMTP (info@odooteams.com)
// Used for: contact/quote confirmations, admin alerts, status updates, support tickets
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;
const SMTP_USER = "info@odooteams.com";
const FROM_NAME = "Odoo Teams";
const ADMIN_EMAIL = "info@odooteams.com";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Lang = "ar" | "en";

interface Payload {
  kind:
    | "contact_confirmation"
    | "contact_admin_alert"
    | "status_update"
    | "support_ticket_client"
    | "support_ticket_admin";
  to?: string; // overrides default routing (admin alerts go to ADMIN_EMAIL)
  lang?: Lang;
  data: Record<string, any>;
}

function t(lang: Lang, en: string, ar: string) {
  return lang === "ar" ? ar : en;
}

function wrap(lang: Lang, title: string, bodyHtml: string) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const align = lang === "ar" ? "right" : "left";
  return `<!doctype html><html dir="${dir}"><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f6f7fb;font-family:Segoe UI,Tahoma,Arial,sans-serif;color:#222">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
        <tr><td style="background:linear-gradient(135deg,#5b21b6,#c026d3);padding:24px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:22px">${FROM_NAME}</h1>
        </td></tr>
        <tr><td style="padding:28px;text-align:${align}">
          <h2 style="margin:0 0 16px;color:#5b21b6;font-size:18px">${title}</h2>
          ${bodyHtml}
        </td></tr>
        <tr><td style="background:#fafafa;padding:16px;text-align:center;color:#888;font-size:12px">
          © ${new Date().getFullYear()} Odoo Teams · <a href="https://odooteams.com" style="color:#5b21b6;text-decoration:none">odooteams.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function build(payload: Payload): { to: string; subject: string; html: string } {
  const lang: Lang = payload.lang === "ar" ? "ar" : "en";
  const d = payload.data || {};

  switch (payload.kind) {
    case "contact_confirmation": {
      const subject = t(lang, "We received your message", "تم استلام رسالتك");
      const html = wrap(lang, t(lang, `Hello ${d.name || ""}`, `مرحباً ${d.name || ""}`), `
        <p>${t(lang, "Thank you for contacting Odoo Teams. We received your message and will get back to you shortly.", "شكراً لتواصلك مع Odoo Teams. لقد استلمنا رسالتك وسنقوم بالرد عليك في أقرب وقت.")}</p>
        ${d.subject ? `<p><strong>${t(lang, "Subject", "الموضوع")}:</strong> ${d.subject}</p>` : ""}
        ${d.message ? `<p style="background:#f6f7fb;padding:12px;border-radius:8px;white-space:pre-wrap">${String(d.message).slice(0, 1000)}</p>` : ""}
        <p>${t(lang, "Best regards,", "مع أطيب التحيات،")}<br/>Odoo Teams</p>
      `);
      return { to: payload.to || d.email, subject, html };
    }
    case "contact_admin_alert": {
      const subject = `[New ${d.type === "quote" ? "Quote" : "Contact"}] ${d.name} — ${d.subject || "No subject"}`;
      const html = wrap("en", "New submission received", `
        <p><strong>Type:</strong> ${d.type || "contact"}</p>
        <p><strong>Name:</strong> ${d.name || "-"}</p>
        <p><strong>Email:</strong> <a href="mailto:${d.email}">${d.email}</a></p>
        <p><strong>Phone:</strong> ${d.phone || "-"}</p>
        ${d.company ? `<p><strong>Company:</strong> ${d.company}</p>` : ""}
        ${d.subject ? `<p><strong>Subject:</strong> ${d.subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p style="background:#f6f7fb;padding:12px;border-radius:8px;white-space:pre-wrap">${d.message || "-"}</p>
        <p><a href="https://odooteams.com/admin/messages" style="display:inline-block;background:#5b21b6;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open in admin</a></p>
      `);
      return { to: payload.to || ADMIN_EMAIL, subject, html };
    }
    case "status_update": {
      const statusLabel: Record<string, [string, string]> = {
        new: ["New", "جديد"],
        in_progress: ["In Progress", "قيد المعالجة"],
        resolved: ["Resolved", "تم الحل"],
        closed: ["Closed", "مغلق"],
      };
      const [en, ar] = statusLabel[d.status] || [d.status, d.status];
      const subject = t(lang, `Your request status: ${en}`, `حالة طلبك: ${ar}`);
      const html = wrap(lang, t(lang, `Hello ${d.name || ""}`, `مرحباً ${d.name || ""}`), `
        <p>${t(lang, "There is an update on your request.", "هناك تحديث على طلبك.")}</p>
        <p style="font-size:16px"><strong>${t(lang, "New status", "الحالة الجديدة")}:</strong>
          <span style="display:inline-block;background:#5b21b6;color:#fff;padding:4px 12px;border-radius:999px;margin-${lang === "ar" ? "right" : "left"}:8px">${t(lang, en, ar)}</span>
        </p>
        ${d.notes ? `<p><strong>${t(lang, "Notes", "ملاحظات")}:</strong></p><p style="background:#f6f7fb;padding:12px;border-radius:8px;white-space:pre-wrap">${d.notes}</p>` : ""}
        <p>${t(lang, "Thank you for choosing Odoo Teams.", "شكراً لاختيارك Odoo Teams.")}</p>
      `);
      return { to: payload.to || d.email, subject, html };
    }
    case "support_ticket_client": {
      const subject = t(lang, "Support ticket received", "تم استلام تذكرة الدعم");
      const html = wrap(lang, t(lang, "Your support ticket has been received", "تم استلام تذكرة الدعم الخاصة بك"), `
        <p>${t(lang, `Hello ${d.name || ""}, we have received your support ticket and our team will respond soon.`, `مرحباً ${d.name || ""}، لقد استلمنا تذكرة الدعم الخاصة بك وسيرد عليك فريقنا قريباً.`)}</p>
        <p><strong>${t(lang, "Subject", "الموضوع")}:</strong> ${d.subject || "-"}</p>
        <p style="background:#f6f7fb;padding:12px;border-radius:8px;white-space:pre-wrap">${d.message || ""}</p>
      `);
      return { to: payload.to || d.email, subject, html };
    }
    case "support_ticket_admin": {
      const subject = `[Support Ticket] ${d.subject || "No subject"} — ${d.name || d.email}`;
      const html = wrap("en", "New support ticket", `
        <p><strong>From:</strong> ${d.name || "-"} &lt;${d.email}&gt;</p>
        <p><strong>Subject:</strong> ${d.subject || "-"}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f6f7fb;padding:12px;border-radius:8px;white-space:pre-wrap">${d.message || "-"}</p>
        <p><a href="https://odooteams.com/admin/messages" style="display:inline-block;background:#5b21b6;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open in admin</a></p>
      `);
      return { to: payload.to || ADMIN_EMAIL, subject, html };
    }
  }
}

async function sendMail(to: string, subject: string, html: string) {
  const password = Deno.env.get("SMTP_PASSWORD");
  if (!password) throw new Error("SMTP_PASSWORD not configured");

  const client = new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: true,
      auth: { username: SMTP_USER, password },
    },
  });

  try {
    await client.send({
      from: `${FROM_NAME} <${SMTP_USER}>`,
      to,
      subject,
      html,
      content: subject,
    });
  } finally {
    try { await client.close(); } catch (_) { /* ignore */ }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!payload?.kind) return json({ error: "kind required" }, 400);

  try {
    const { to, subject, html } = build(payload);
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return json({ error: "Invalid recipient" }, 400);
    }
    await sendMail(to, subject, html);
    return json({ success: true });
  } catch (e: any) {
    console.error("send-notification-email error:", e?.message || e);
    return json({ error: e?.message || "Failed to send" }, 500);
  }
});
