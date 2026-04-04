// app/api/send-monthly-reminder/route.js
// FIXED: replaced supabase.auth.admin.sendRawEmail() (does not exist)
// with sendMonthlyReminder() from lib/email.js (uses Resend, which is configured)
// Called by GitHub Actions on the 1st of each month at 9 AM ET

import { sendMonthlyReminder } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    // Support both header-based and body-based secret (header preferred)
    const headerSecret = req.headers.get("x-cron-secret");
    const body = await req.json().catch(() => ({}));
    const bodySecret = body.secret;
    const secret = headerSecret || bodySecret;

    if (secret !== process.env.CRON_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const monthKey   = new Date().toISOString().slice(0, 7);
    const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Get all active subscribers with their plans
    // Uses the active_subscribers VIEW (join of email_preferences + user_plans)
    const { data: subscribers, error: subErr } = await supabase
      .from("active_subscribers")
      .select("email, user_id, profile, amount");

    if (subErr) {
      // active_subscribers view might not exist — fall back to manual join
      console.error("active_subscribers error:", subErr.message, "— trying manual join");

      const { data: prefs } = await supabase
        .from("email_preferences")
        .select("email, user_id")
        .eq("unsubscribed", false);

      const { data: plans } = await supabase
        .from("user_plans")
        .select("user_id, profile, amount");

      const planMap = {};
      (plans || []).forEach(p => { planMap[p.user_id] = p; });

      const fallbackSubs = (prefs || [])
        .filter(p => planMap[p.user_id])
        .map(p => ({ ...p, ...planMap[p.user_id] }));

      if (!fallbackSubs.length) {
        return Response.json({ sent: 0, message: "No subscribers found — run schema-email-preferences.sql in Supabase" });
      }

      return runSend(supabase, fallbackSubs, monthKey, monthLabel);
    }

    if (!subscribers?.length) {
      return Response.json({ sent: 0, message: "No active subscribers" });
    }

    return runSend(supabase, subscribers, monthKey, monthLabel);

  } catch (e) {
    console.error("Monthly reminder error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

async function runSend(supabase, subscribers, monthKey, monthLabel) {
  // Get current weekly selections
  const { data: selections } = await supabase
    .from("weekly_selections")
    .select("profile, tickers, allocations")
    .eq("is_current", true);

  const selByProfile = {};
  (selections || []).forEach(s => { selByProfile[s.profile] = s; });

  const FALLBACK = {
    conservative: { tickers: ["BND","SCHD","VTI","VOO"],  allocations: { BND:40, SCHD:30, VTI:20, VOO:10 } },
    balanced:     { tickers: ["VOO","VTI","QQQ","SCHD"],  allocations: { VOO:40, VTI:25, QQQ:25, SCHD:10 } },
    aggressive:   { tickers: ["QQQ","VGT","TQQQ","ARKK"], allocations: { QQQ:35, VGT:25, TQQQ:25, ARKK:15 } },
  };

  let sent = 0, failed = 0;
  const errors = [];

  for (const sub of subscribers) {
    if (!sub.email || !sub.profile) continue;

    try {
      const sel  = selByProfile[sub.profile];
      const fb   = FALLBACK[sub.profile] || FALLBACK.balanced;
      const name = sub.email.split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

      await sendMonthlyReminder({
        email:       sub.email,
        name,
        profile:     sub.profile,
        amount:      sub.amount || 100,
        tickers:     sel?.tickers     || fb.tickers,
        allocations: sel?.allocations || fb.allocations,
        monthLabel,
      });

      // Update last_reminder_at
      await supabase
        .from("email_preferences")
        .update({ last_reminder_at: new Date().toISOString() })
        .eq("email", sub.email);

      // Create / update the monthly action record
      const tickers = sel?.tickers || fb.tickers;
      const allocs  = sel?.allocations || fb.allocations;
      await supabase.from("user_monthly_actions").upsert({
        user_id:  sub.user_id,
        month_key: monthKey,
        profile:   sub.profile,
        amount:    sub.amount || 100,
        tickers,
        allocations: allocs,
        entry_prices: {},
        amounts_invested: Object.fromEntries(
          tickers.map(t => [t, Math.round((sub.amount || 100) * (allocs[t] || 25) / 100)])
        ),
      }, { onConflict: "user_id,month_key" });

      sent++;
    } catch (e) {
      console.error(`Monthly reminder failed for ${sub.email}:`, e.message);
      errors.push({ email: sub.email, error: e.message });
      failed++;
    }
  }

  console.log(`Monthly reminder: ${sent} sent, ${failed} failed`);
  return Response.json({ sent, failed, total: subscribers.length, month: monthKey, errors });
}
