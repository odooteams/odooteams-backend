import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";
import { runFullScan } from "./lib/fullScan.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://odooteams.com";

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch automation settings
    const { data: autoData } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "security_scan_automation")
      .maybeSingle();

    if (!autoData || !autoData.setting_value) {
      return new Response("Automation not configured.", { status: 200 });
    }

    const { enabled, emails } = autoData.setting_value as any;
    if (!enabled || !emails) {
      return new Response("Automation disabled or no emails configured.", { status: 200 });
    }

    // Fetch SMTP settings
    const { data: smtpData } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "smtp_settings")
      .maybeSingle();

    if (!smtpData || !smtpData.setting_value) {
      return new Response("SMTP not configured.", { status: 200 });
    }

    const smtpConfig = smtpData.setting_value as any;

    // Run the full scan
    console.log("Running full security scan against:", siteUrl);
    const report = await runFullScan(siteUrl, (step, pct) => {
      console.log(`Scan progress: ${step} (${pct}%)`);
    });

    const sum = report.summary;
    const totalFail = sum.headers.fail + sum.owasp.fail + sum.csrf.fail + sum.blackbox.fail + sum.sqli.high + sum.xss.high;

    // We send an email if there are issues, or just a daily report
    // Let's format an HTML email
    const htmlBody = `
      <h2>Daily Security Scan Report</h2>
      <p>Target: <strong>${siteUrl}</strong></p>
      <p>Date: ${new Date().toUTCString()}</p>
      
      <h3>Summary</h3>
      <ul>
        <li><strong>Headers:</strong> ${sum.headers.pass} Pass, <span style="color:red">${sum.headers.fail} Fail</span></li>
        <li><strong>OWASP:</strong> ${sum.owasp.pass} Pass, <span style="color:red">${sum.owasp.fail} Fail</span></li>
        <li><strong>CSRF:</strong> ${sum.csrf.pass} Pass, <span style="color:red">${sum.csrf.fail} Fail</span></li>
        <li><strong>Black-box:</strong> ${sum.blackbox.pass} Pass, <span style="color:red">${sum.blackbox.fail} Fail</span></li>
        <li><strong>SQLi:</strong> ${sum.sqli.findings} findings (<span style="color:red">${sum.sqli.high} high</span>)</li>
        <li><strong>XSS:</strong> ${sum.xss.findings} findings (<span style="color:red">${sum.xss.high} high</span>)</li>
      </ul>
      
      <p><strong>Total Critical/Failed Issues: ${totalFail}</strong></p>
      
      <p>Please log in to the admin dashboard for detailed JSON reports and remediation steps.</p>
    `;

    // Send email via nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host || "smtp.hostinger.com",
      port: parseInt(smtpConfig.port || "465", 10),
      secure: parseInt(smtpConfig.port || "465", 10) === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    const recipients = emails.split(",").map((e: string) => e.trim());
    
    console.log("Sending email to:", recipients);
    
    await transporter.sendMail({
      from: `"${smtpConfig.fromEmail || smtpConfig.user}" <${smtpConfig.user}>`,
      to: recipients.join(", "),
      subject: `Security Scan Report: ${siteUrl} (${totalFail > 0 ? "Issues Found" : "All Clear"})`,
      html: htmlBody,
    });

    return new Response("Scan complete and email sent.", { status: 200 });
  } catch (err: any) {
    console.error("Error running scheduled scan:", err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
});
