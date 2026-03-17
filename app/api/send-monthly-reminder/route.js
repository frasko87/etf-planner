// app/api/send-monthly-reminder/route.js
// Called by GitHub Actions on the 1st of each month at 9 AM ET
// Sends each user their monthly "Time to invest!" email

import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const PROFILE_META = {
  conservative: { label:"Conservative", icon:"🛡️", color:"#3b82f6", rate:"~5%" },
  balanced:     { label:"Balanced",     icon:"⚖️", color:"#c9a84c", rate:"~9%" },
  aggressive:   { label:"Aggressive",   icon:"🚀", color:"#ff4757", rate:"~16%" },
};

const FALLBACK_ALLOCS = {
  conservative: { BND:40, SCHD:30, VTI:20, VOO:10 },
  balanced:     { VOO:40, VTI:25, QQQ:25, SCHD:10 },
  aggressive:   { QQQ:35, VGT:25, TQQQ:25, ARKK:15 },
};

function buildEmailHTML({ name, profile, amount, tickers, allocations, monthLabel, siteUrl }) {
  const pm = PROFILE_META[profile] || PROFILE_META.balanced;
  const allocs = allocations || FALLBACK_ALLOCS[profile] || {};

  const etfRows = tickers.map(t => {
    const pct = allocs[t] || 25;
    const dollars = Math.round(amount * pct / 100);
    return `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0ec;">
          <span style="font-family:monospace;font-weight:600;color:#1a1a2e;">${t}</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0ec;text-align:right;">
          <span style="font-family:monospace;color:#7a7a8a;">${pct}%</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0ec;text-align:right;">
          <strong style="font-family:monospace;color:#1a1a2e;">$${dollars}</strong>
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8f5;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-family:monospace;font-size:14px;font-weight:700;color:#1a1a2e;letter-spacing:1px;">
        ETF<span style="color:#00b96b;">.</span>PLAN
      </div>
    </div>

    <!-- Main card -->
    <div style="background:#1a1a2e;border-radius:16px;padding:32px;margin-bottom:16px;">
      <div style="font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px;margin-bottom:12px;">
        ${monthLabel.toUpperCase()} · YOUR MONTHLY PLAN
      </div>
      <h1 style="color:white;font-size:24px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px;">
        Time to invest, ${name}! ${pm.icon}
      </h1>
      <p style="color:rgba(255,255,255,0.55);font-size:14px;margin:0 0 24px;line-height:1.7;">
        Your ${pm.label} plan (${pm.rate}/yr target) is ready for this month.
        Here's exactly what to buy:
      </p>

      <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:rgba(255,255,255,0.08);">
            <th style="padding:10px 16px;text-align:left;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;font-weight:400;">ETF</th>
            <th style="padding:10px 16px;text-align:right;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;font-weight:400;">ALLOC</th>
            <th style="padding:10px 16px;text-align:right;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;font-weight:400;">BUY</th>
          </tr>
        </thead>
        <tbody style="color:white;">
          ${tickers.map(t => {
            const pct = allocs[t] || 25;
            const dollars = Math.round(amount * pct / 100);
            return `<tr>
              <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:monospace;font-weight:600;color:white;">${t}</td>
              <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;font-family:monospace;color:rgba(255,255,255,0.5);">${pct}%</td>
              <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;font-family:monospace;font-weight:700;color:#00ff88;">$${dollars}</td>
            </tr>`;
          }).join("")}
          <tr>
            <td colspan="2" style="padding:12px 16px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.4);">TOTAL THIS MONTH</td>
            <td style="padding:12px 16px;text-align:right;font-family:monospace;font-weight:700;font-size:16px;color:white;">$${amount}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Steps -->
    <div style="background:white;border:1px solid #e8e8e2;border-radius:14px;padding:24px;margin-bottom:16px;">
      <p style="font-family:monospace;font-size:10px;color:#aaaabc;letter-spacing:2px;margin:0 0 16px;">HOW TO INVEST</p>
      ${["Open your broker app (Robinhood, eToro, Vanguard, etc.)", "Search each ticker above and buy the listed dollar amount", "Come back next month — we'll track your results"].map((s,i) => `
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
          <div style="width:22px;height:22px;border-radius:50%;background:#00b96b;color:white;font-family:monospace;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:600;">${i+1}</div>
          <span style="font-size:14px;color:#7a7a8a;line-height:1.6;padding-top:2px;">${s}</span>
        </div>`).join("")}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${siteUrl}/dashboard" style="display:inline-block;background:#00b96b;color:white;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
        View full plan on ETF.PLAN →
      </a>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:11px;color:#aaaabc;line-height:1.7;">
      Not financial advice. Past performance does not guarantee future results.<br>
      You're receiving this because you set up a plan on ETF.PLAN.<br>
      <a href="${siteUrl}/dashboard" style="color:#00b96b;">Manage your plan</a>
    </p>
  </div>
</body>
</html>`;
}

export async function POST(req) {
  try {
    const { secret } = await req.json().catch(() => ({}));
    if (secret !== process.env.CRON_SECRET) {
      return Response.json({ error:"Unauthorized" }, { status:401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const monthLabel = new Date().toLocaleDateString("en-US", { month:"long", year:"numeric" });
    const monthKey   = new Date().toISOString().slice(0, 7);
    const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || "https://etfplan.app";

    // Get all users with plans
    const { data: plans } = await supabase
      .from("user_plans")
      .select("user_id, profile, amount");

    if (!plans?.length) return Response.json({ sent:0 });

    // Get current selections
    const { data: selections } = await supabase
      .from("weekly_selections")
      .select("*")
      .eq("is_current", true);

    const selByProfile = {};
    (selections || []).forEach(s => { selByProfile[s.profile] = s; });

    let sent = 0;
    for (const plan of plans) {
      try {
        // Get user email
        const { data: { user } } = await supabase.auth.admin.getUserById(plan.user_id);
        if (!user?.email) continue;

        const name = user.email.split("@")[0];
        const sel  = selByProfile[plan.profile];
        const FALLBACK = { conservative:["BND","SCHD","VTI","VOO"], balanced:["VOO","VTI","QQQ","SCHD"], aggressive:["QQQ","VGT","TQQQ","ARKK"] };
        const tickers   = sel?.tickers    || FALLBACK[plan.profile] || [];
        const allocations = sel?.allocations || null;

        const html = buildEmailHTML({
          name, profile:plan.profile, amount:plan.amount,
          tickers, allocations, monthLabel, siteUrl,
        });

        // Send via Supabase (uses configured SMTP)
        const { error } = await supabase.auth.admin.sendRawEmail({
          to:      user.email,
          subject: `⏰ Time to invest this month — ${monthLabel} plan is ready`,
          html,
        });

        // Record in monthly actions
        await supabase.from("user_monthly_actions").upsert({
          user_id:   plan.user_id,
          month_key: monthKey,
          profile:   plan.profile,
          amount:    plan.amount,
          tickers,
          allocations: allocations || null,
          entry_prices: {},
          amounts_invested: Object.fromEntries(
            tickers.map((t,i) => [t, Math.round(plan.amount * ((allocations?.[t])||[40,30,20,10][i]||25) / 100)])
          ),
        });

        if (!error) sent++;
      } catch(e) {
        console.error(`Failed for user ${plan.user_id}:`, e.message);
      }
    }

    return Response.json({ sent, total:plans.length, month:monthKey });
  } catch(e) {
    return Response.json({ error:e.message }, { status:500 });
  }
}
