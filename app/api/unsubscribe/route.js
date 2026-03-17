// app/api/unsubscribe/route.js
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://etfplan.app";

  if (!email) {
    return new Response("Invalid unsubscribe link.", { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Record unsubscribe
    await supabase.from("email_preferences").upsert({
      email,
      unsubscribed: true,
      unsubscribed_at: new Date().toISOString(),
    });

    // Return a clean confirmation page
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Unsubscribed — ETF.PLAN</title>
  <style>
    body{margin:0;background:#f8f8f5;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{background:white;border-radius:16px;padding:40px;max-width:420px;width:100%;text-align:center;border:1px solid #e8e8e2;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
    h1{font-size:22px;color:#1a1a2e;margin-bottom:10px}
    p{color:#7a7a8a;font-size:14px;line-height:1.7;margin-bottom:20px}
    a{display:inline-block;background:#00b96b;color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:48px;margin-bottom:16px">👋</div>
    <h1>You're unsubscribed</h1>
    <p>You've been removed from all ETF.PLAN marketing emails. You'll still receive transactional emails (like account security and password resets).</p>
    <p>Changed your mind? You can re-subscribe from your dashboard settings.</p>
    <a href="${SITE_URL}/dashboard">Go to dashboard</a>
    <p style="margin-top:16px;font-size:12px;color:#aaaabc">ETF.PLAN · Not financial advice</p>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    return new Response("Something went wrong. Please try again.", { status: 500 });
  }
}
