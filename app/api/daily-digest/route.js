// app/api/daily-digest/route.js
// Sends a daily morning digest email to hello@etfplan.app
// Triggered by Vercel cron at 8:00 AM Madrid time (07:00 UTC)
// Protected by CRON_SECRET header

import { createClient } from "@supabase/supabase-js";

const RESEND_API = "https://api.resend.com/emails";
const ADMIN_EMAIL = "contact@franciscoestrada.com";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export async function GET(req) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchDigestData();
    const html = buildEmailHTML(data);

    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      timeZone: "Europe/Madrid",
    });

    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ETF.PLAN Digest <hello@etfplan.app>",
        to: ADMIN_EMAIL,
        subject: `📊 ETF.PLAN Daily — ${today}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Resend failed");
    }

    return Response.json({ ok: true, sent_to: ADMIN_EMAIL, date: today });
  } catch (err) {
    console.error("Daily digest error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function fetchDigestData() {
  const supabase = getSupabase();

  const now = new Date();
  // Yesterday window in UTC (Vercel runs at 07:00 UTC = 08:00 Madrid)
  const yesterdayStart = new Date(now);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  yesterdayStart.setUTCHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setUTCHours(23, 59, 59, 999);

  const ysISO = yesterdayStart.toISOString();
  const yeISO = yesterdayEnd.toISOString();

  // ── 1. Total users ──────────────────────────────────────────────────────────
  const { count: totalUsers } = await supabase
    .from("user_plans")
    .select("*", { count: "exact", head: true });

  // ── 2. New signups yesterday ─────────────────────────────────────────────────
  const { data: newSignups } = await supabase
    .from("user_plans")
    .select("user_id, profile, amount, started_at")
    .gte("started_at", ysISO)
    .lte("started_at", yeISO)
    .order("started_at", { ascending: false });

  // ── 3. MRR (sum of all monthly amounts) ──────────────────────────────────────
  const { data: allPlans } = await supabase
    .from("user_plans")
    .select("amount, profile");
  const mrr = allPlans?.reduce((s, p) => s + (p.amount || 0), 0) || 0;

  // Plan distribution
  const planDist = { conservative: 0, balanced: 0, aggressive: 0 };
  allPlans?.forEach(p => { if (planDist[p.profile] !== undefined) planDist[p.profile]++; });

  // ── 4. Page views yesterday ───────────────────────────────────────────────────
  const { data: pageViewEvents } = await supabase
    .from("events")
    .select("page, session_id, created_at")
    .eq("name", "page_view")
    .gte("created_at", ysISO)
    .lte("created_at", yeISO);

  const totalPageViews = pageViewEvents?.length || 0;
  const uniqueSessions = new Set(pageViewEvents?.map(e => e.session_id)).size;

  // Top pages
  const pageCounts = {};
  pageViewEvents?.forEach(e => {
    const p = e.page || "/";
    pageCounts[p] = (pageCounts[p] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // ── 5. Other events yesterday ─────────────────────────────────────────────────
  const { data: allEvents } = await supabase
    .from("events")
    .select("name, created_at")
    .gte("created_at", ysISO)
    .lte("created_at", yeISO)
    .neq("name", "page_view");

  const eventCounts = {};
  allEvents?.forEach(e => { eventCounts[e.name] = (eventCounts[e.name] || 0) + 1; });

  // ── 6. ETF data fetch status ──────────────────────────────────────────────────
  const { data: fetchLogs } = await supabase
    .from("fetch_log")
    .select("trigger, success_count, tickers_fetched, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  // ── 7. Emails sent yesterday ──────────────────────────────────────────────────
  const { count: emailsSent } = await supabase
    .from("email_sequence_log")
    .select("*", { count: "exact", head: true })
    .gte("sent_at", ysISO)
    .lte("sent_at", yeISO);

  // ── 8. Subscribers ────────────────────────────────────────────────────────────
  const { count: totalSubscribers } = await supabase
    .from("email_preferences")
    .select("*", { count: "exact", head: true })
    .eq("unsubscribed", false);

  // ── 9. Mark as bought activity ────────────────────────────────────────────────
  const { count: marksBought } = await supabase
    .from("user_monthly_actions")
    .select("*", { count: "exact", head: true })
    .gte("bought_at", ysISO)
    .lte("bought_at", yeISO);

  return {
    date: yesterdayStart,
    totalUsers: totalUsers || 0,
    newSignups: newSignups || [],
    mrr,
    planDist,
    totalPageViews,
    uniqueSessions,
    topPages,
    eventCounts,
    fetchLogs: fetchLogs || [],
    emailsSent: emailsSent || 0,
    totalSubscribers: totalSubscribers || 0,
    marksBought: marksBought || 0,
  };
}

// ── Email HTML builder ────────────────────────────────────────────────────────
function buildEmailHTML(d) {
  const dateStr = d.date.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
    timeZone: "Europe/Madrid",
  });

  const fmt = n => `$${Number(n).toLocaleString()}`;
  const pct = (n, total) => total > 0 ? Math.round((n / total) * 100) : 0;

  const planIcons = { conservative: "🛡️", balanced: "⚖️", aggressive: "🚀" };
  const planColors = { conservative: "#3b82f6", balanced: "#c9a84c", aggressive: "#00b96b" };

  const topPagesHTML = d.topPages.length > 0
    ? d.topPages.map(([page, count]) => `
        <tr>
          <td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#1a1a2e;border-bottom:1px solid #f0f0ea;">${page}</td>
          <td style="padding:8px 12px;text-align:right;font-family:monospace;font-size:12px;font-weight:700;color:#00b96b;border-bottom:1px solid #f0f0ea;">${count}</td>
        </tr>`).join("")
    : `<tr><td colspan="2" style="padding:12px;text-align:center;color:#aaaabc;font-size:13px;">No page views recorded</td></tr>`;

  const fetchStatusHTML = d.fetchLogs.length > 0
    ? d.fetchLogs.map(log => {
        const time = new Date(log.created_at).toLocaleTimeString("en-GB", {
          hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid"
        });
        const ok = (log.success_count || 0) > 0;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="font-family:monospace;font-size:12px;color:rgba(255,255,255,0.5);">${log.trigger || "manual"} · ${time}</span>
          <span style="font-family:monospace;font-size:12px;color:${ok ? "#00b96b" : "#ff4757"};">${ok ? "✓ " + log.success_count + " ETFs" : "⚠ failed"}</span>
        </div>`;
      }).join("")
    : `<div style="color:rgba(255,255,255,0.4);font-size:13px;text-align:center;padding:8px 0;">No fetch logs found</div>`;

  const newSignupsHTML = d.newSignups.length > 0
    ? d.newSignups.map(s => {
        const icon = planIcons[s.profile] || "📋";
        const color = planColors[s.profile] || "#00b96b";
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(0,185,107,0.05);border-radius:8px;margin-bottom:6px;">
          <span style="font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#1a1a2e;">${icon} ${s.profile} plan</span>
          <span style="font-family:monospace;font-size:13px;font-weight:700;color:${color};">$${s.amount}/mo</span>
        </div>`;
      }).join("")
    : `<div style="text-align:center;padding:12px;color:#aaaabc;font-size:13px;">No new signups yesterday</div>`;

  const keyEvents = Object.entries(d.eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const eventsHTML = keyEvents.length > 0
    ? keyEvents.map(([name, count]) => `
        <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f5f5f0;">
          <span style="font-family:monospace;font-size:12px;color:#7a7a8a;">${name}</span>
          <span style="font-family:monospace;font-size:12px;font-weight:700;color:#1a1a2e;">${count}</span>
        </div>`).join("")
    : `<div style="text-align:center;padding:8px;color:#aaaabc;font-size:12px;">No events recorded</div>`;

  const totalPlans = d.totalUsers;
  const distBar = (profile) => {
    const count = d.planDist[profile] || 0;
    const w = pct(count, totalPlans);
    return `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#7a7a8a;">${planIcons[profile]} ${profile}</span>
          <span style="font-family:monospace;font-size:12px;font-weight:700;color:${planColors[profile]};">${count} (${w}%)</span>
        </div>
        <div style="height:4px;background:#f0f0ea;border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${w}%;background:${planColors[profile]};border-radius:2px;"></div>
        </div>
      </div>`;
  };

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8f8f5; font-family: 'DM Sans', Arial, sans-serif; color: #1a1a2e; }
</style>
</head>
<body style="background:#f8f8f5;">
<div style="max-width:580px;margin:0 auto;padding:32px 16px 48px;">

  <!-- Logo -->
  <div style="font-family:monospace;font-size:13px;font-weight:700;letter-spacing:1px;color:#1a1a2e;margin-bottom:6px;">
    ETF<span style="color:#00b96b;">.</span>PLAN
  </div>
  <div style="font-family:monospace;font-size:10px;color:#aaaabc;letter-spacing:2px;margin-bottom:28px;">
    DAILY DIGEST · ${dateStr.toUpperCase()}
  </div>

  <!-- ── Hero stats ────────────────────────────────────────────── -->
  <div style="background:#1a1a2e;border-radius:16px;padding:28px 24px;margin-bottom:16px;">
    <div style="font-family:monospace;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-bottom:20px;">OVERVIEW</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
      ${[
        { l: "TOTAL USERS", v: d.totalUsers, c: "#00b96b" },
        { l: "MRR", v: fmt(d.mrr), c: "#c9a84c" },
        { l: "NEW SIGNUPS", v: d.newSignups.length, c: d.newSignups.length > 0 ? "#00b96b" : "rgba(255,255,255,0.5)" },
        { l: "SUBSCRIBERS", v: d.totalSubscribers, c: "rgba(255,255,255,0.7)" },
      ].map(s => `
        <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:14px;">
          <div style="font-family:monospace;font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:1.5px;margin-bottom:6px;">${s.l}</div>
          <div style="font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:26px;color:${s.c};">${s.v}</div>
        </div>`).join("")}
    </div>
  </div>

  <!-- ── Traffic ───────────────────────────────────────────────── -->
  <div style="background:white;border:1px solid #e8e8e2;border-radius:16px;padding:24px;margin-bottom:16px;">
    <div style="font-family:monospace;font-size:10px;color:#aaaabc;letter-spacing:2px;margin-bottom:16px;">YESTERDAY'S TRAFFIC</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
      ${[
        { l: "Page Views", v: d.totalPageViews },
        { l: "Unique Visitors", v: d.uniqueSessions },
        { l: "Mark as Bought", v: d.marksBought },
      ].map(s => `
        <div style="background:#f8f8f5;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-family:monospace;font-size:9px;color:#aaaabc;letter-spacing:1px;margin-bottom:4px;">${s.l.toUpperCase()}</div>
          <div style="font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:22px;color:#1a1a2e;">${s.v}</div>
        </div>`).join("")}
    </div>
    <div style="font-family:monospace;font-size:10px;color:#aaaabc;letter-spacing:1.5px;margin-bottom:10px;">TOP PAGES</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f8f8f5;">
        <th style="padding:8px 12px;text-align:left;font-family:monospace;font-size:9px;color:#aaaabc;letter-spacing:1px;">PAGE</th>
        <th style="padding:8px 12px;text-align:right;font-family:monospace;font-size:9px;color:#aaaabc;letter-spacing:1px;">VIEWS</th>
      </tr>
      ${topPagesHTML}
    </table>
  </div>

  <!-- ── New signups ───────────────────────────────────────────── -->
  <div style="background:white;border:1px solid #e8e8e2;border-radius:16px;padding:24px;margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-family:monospace;font-size:10px;color:#aaaabc;letter-spacing:2px;">NEW SIGNUPS YESTERDAY</div>
      <div style="font-family:monospace;font-size:14px;font-weight:700;color:${d.newSignups.length > 0 ? "#00b96b" : "#aaaabc"};">${d.newSignups.length}</div>
    </div>
    ${newSignupsHTML}
  </div>

  <!-- ── Plan distribution ─────────────────────────────────────── -->
  <div style="background:white;border:1px solid #e8e8e2;border-radius:16px;padding:24px;margin-bottom:16px;">
    <div style="font-family:monospace;font-size:10px;color:#aaaabc;letter-spacing:2px;margin-bottom:16px;">PLAN DISTRIBUTION (ALL TIME)</div>
    ${["conservative", "balanced", "aggressive"].map(distBar).join("")}
  </div>

  <!-- ── Key events ────────────────────────────────────────────── -->
  <div style="background:white;border:1px solid #e8e8e2;border-radius:16px;padding:24px;margin-bottom:16px;">
    <div style="font-family:monospace;font-size:10px;color:#aaaabc;letter-spacing:2px;margin-bottom:12px;">KEY EVENTS YESTERDAY</div>
    ${eventsHTML}
    <div style="margin-top:10px;display:flex;justify-content:space-between;">
      <span style="font-family:monospace;font-size:11px;color:#aaaabc;">Emails sent (drip)</span>
      <span style="font-family:monospace;font-size:11px;font-weight:700;color:#1a1a2e;">${d.emailsSent}</span>
    </div>
  </div>

  <!-- ── ETF data pipeline ─────────────────────────────────────── -->
  <div style="background:#1a1a2e;border-radius:16px;padding:24px;margin-bottom:24px;">
    <div style="font-family:monospace;font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-bottom:12px;">ETF DATA PIPELINE (LAST 3 RUNS)</div>
    ${fetchStatusHTML}
  </div>

  <!-- ── Footer ────────────────────────────────────────────────── -->
  <div style="text-align:center;font-size:12px;color:#aaaabc;line-height:1.8;">
    <div style="margin-bottom:8px;">
      <a href="https://etfplan.app/admin" style="color:#00b96b;text-decoration:none;font-weight:600;">Open Admin Panel →</a>
      &nbsp;·&nbsp;
      <a href="https://etfplan.app" style="color:#aaaabc;text-decoration:none;">etfplan.app</a>
    </div>
    <div>This digest is sent every morning at 8:00 AM Madrid time.</div>
    <div style="margin-top:4px;font-family:monospace;font-size:10px;">Not financial advice · Past performance ≠ future results</div>
  </div>

</div>
</body></html>`;
}
