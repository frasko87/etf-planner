// app/api/admin/writers/route.js
// Manage copywriter accounts from the admin panel
// Supports: GET (list), POST (create + send welcome email), PATCH (update), DELETE (remove)

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function checkAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === process.env.ADMIN_PASSWORD;
}

// ── Welcome email sent to new writers ────────────────────────────────────────
async function sendWriterWelcomeEmail({ name, email, password, writer_code }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://etfplan.app";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8f5;font-family:'DM Sans',Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">

  <div style="font-family:monospace;font-size:13px;font-weight:700;color:#1a1a2e;letter-spacing:1px;margin-bottom:28px;">
    ETF<span style="color:#00b96b">.</span>PLAN <span style="font-size:10px;color:#aaaabc;letter-spacing:2px;">CONTENT STUDIO</span>
  </div>

  <div style="background:#1a1a2e;border-radius:16px;padding:32px;margin-bottom:16px;">
    <p style="font-family:monospace;font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin:0 0 12px;">YOUR WRITER ACCOUNT IS READY</p>
    <h1 style="color:white;font-size:24px;font-weight:700;margin:0 0 12px;letter-spacing:-0.5px;">Welcome to ETF.PLAN, ${name}! ✍️</h1>
    <p style="color:rgba(255,255,255,0.55);font-size:15px;line-height:1.75;margin:0 0 24px;">
      Your writer account has been created. Here are your login credentials — keep them safe.
    </p>

    <div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        ${[
          ["CMS URL",       `<a href="${siteUrl}/cms" style="color:#00b96b;text-decoration:none;font-family:monospace;">${siteUrl}/cms</a>`],
          ["Email",         `<span style="font-family:monospace;color:white;">${email}</span>`],
          ["Password",      `<span style="font-family:monospace;color:white;background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px;">${password}</span>`],
          ["Writer code",   `<span style="font-family:monospace;color:#00b96b;">${writer_code}</span>`],
          ["Tracking link", `<a href="${siteUrl}/?writer=${writer_code}" style="color:#00b96b;font-family:monospace;font-size:12px;text-decoration:none;">${siteUrl}/?writer=${writer_code}</a>`],
        ].map(([k,v]) => `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <td style="padding:10px 0;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:1px;width:120px;">${k.toUpperCase()}</td>
            <td style="padding:10px 0;font-size:14px;">${v}</td>
          </tr>`).join("")}
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${siteUrl}/cms" style="display:inline-block;background:#00b96b;color:white;font-weight:700;font-size:15px;padding:13px 28px;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(0,185,107,0.3);">
        Log into the CMS →
      </a>
    </div>
  </div>

  <div style="background:white;border:1px solid #e8e8e2;border-radius:14px;padding:24px;margin-bottom:16px;">
    <h2 style="font-size:16px;font-weight:700;color:#1a1a2e;margin:0 0 12px;">What you can do in the CMS</h2>
    ${[
      ["✍️ Write articles", "Create posts in English and Spanish. Save drafts, publish when ready."],
      ["📊 Track performance", "See views and signups attributed to each of your articles."],
      ["🔗 Share your tracking link", `Any signup via ${siteUrl}/?writer=${writer_code} is credited to you.`],
    ].map(([icon_title, desc]) => `
      <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
        <div style="font-size:13px;font-weight:700;color:#1a1a2e;min-width:140px;">${icon_title}</div>
        <div style="font-size:13px;color:#7a7a8a;line-height:1.6;">${desc}</div>
      </div>`).join("")}
  </div>

  <p style="text-align:center;font-size:12px;color:#aaaabc;line-height:1.7;">
    Questions? Reply to this email or contact <a href="mailto:contact@franciscoestrada.com" style="color:#00b96b;">contact@franciscoestrada.com</a><br>
    Not financial advice. ETF.PLAN · <a href="${siteUrl}" style="color:#00b96b;">${siteUrl}</a>
  </p>

</div>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from:    "ETF.PLAN <hello@etfplan.app>",
      to:      email,
      subject: `Your ETF.PLAN writer account is ready ✍️`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Email send failed: ${res.status}`);
  }
  return true;
}

// ── GET — list all writers with stats ────────────────────────────────────────
export async function GET(req) {
  if (!await checkAdmin()) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: writers, error } = await supabase
    .from("writers")
    .select("id, name, email, writer_code, bio, active, created_at")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const enriched = await Promise.all((writers || []).map(async (w) => {
    const [postsRes, convsRes] = await Promise.all([
      supabase.from("blog_posts").select("id", { count:"exact", head:true }).eq("writer_code", w.writer_code),
      supabase.from("content_attribution").select("id", { count:"exact", head:true }).eq("writer_code", w.writer_code),
    ]);
    return { ...w, post_count: postsRes.count ?? 0, conversion_count: convsRes.count ?? 0 };
  }));

  return Response.json({ writers: enriched });
}

// ── POST — create writer + send welcome email ─────────────────────────────────
export async function POST(req) {
  if (!await checkAdmin()) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const body = await req.json();
  const { name, email, writer_code, bio, password_hash } = body;

  if (!name || !email || !writer_code || !password_hash) {
    return Response.json({ error: "Fill in: name, email, writer code and password" }, { status: 400 });
  }

  // Create in DB
  const { data, error } = await supabase
    .from("writers")
    .insert({
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      writer_code:   writer_code.toLowerCase().replace(/[^a-z0-9]/g, ""),
      bio:           bio?.trim() || null,
      password_hash: password_hash,
      active:        true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return Response.json({ error: "Email or writer code already exists" }, { status: 400 });
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Send welcome email (non-blocking — don't fail the creation if email fails)
  let emailSent = false;
  let emailError = null;
  try {
    await sendWriterWelcomeEmail({
      name:        data.name,
      email:       data.email,
      password:    password_hash,
      writer_code: data.writer_code,
    });
    emailSent = true;
  } catch (e) {
    emailError = e.message;
    console.error("Writer welcome email failed:", e.message);
  }

  return Response.json({ success: true, writer: data, emailSent, emailError });
}

// ── PATCH — update writer (active status, password, bio) ─────────────────────
export async function PATCH(req) {
  if (!await checkAdmin()) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { id, ...updates } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await supabase
    .from("writers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true, writer: data });
}

// ── DELETE — permanently remove a writer ─────────────────────────────────────
export async function DELETE(req) {
  if (!await checkAdmin()) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  // Get writer info first for the response
  const { data: writer } = await supabase
    .from("writers")
    .select("name, email, writer_code")
    .eq("id", id)
    .single();

  // Note: blog_posts.writer_id has ON DELETE SET NULL so posts are kept, just unlinked
  const { error } = await supabase
    .from("writers")
    .delete()
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true, deleted: writer });
}
