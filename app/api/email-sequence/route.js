// app/api/email-sequence/route.js
// Called by GitHub Actions cron daily — sends day 3, 7, 30 emails to users
import { createClient } from "@supabase/supabase-js";
import { sendDay3Email, sendDay7Email, sendDay30Email } from "@/lib/email";

export async function POST(req) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const now = new Date();
  const results = { day3: [], day7: [], day30: [], errors: [] };

  // Get all users with plans and their start dates
  const { data: plans } = await supabase
    .from("user_plans")
    .select("user_id, profile, amount, started_at, tickers, allocations")
    .not("started_at", "is", null);

  if (!plans?.length) return Response.json({ sent: 0, message: "No plans found" });

  // Get user emails
  const userIds = plans.map(p => p.user_id);
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const userMap = {};
  (users || []).forEach(u => { userMap[u.id] = u; });

  // Get email sequence log to avoid resending
  const { data: sentLog } = await supabase
    .from("email_sequence_log")
    .select("user_id, sequence_day")
    .in("user_id", userIds);

  const alreadySent = new Set((sentLog || []).map(s => `${s.user_id}_${s.sequence_day}`));

  for (const plan of plans) {
    const user = userMap[plan.user_id];
    if (!user?.email) continue;

    // Check email preferences
    const { data: pref } = await supabase
      .from("email_preferences")
      .select("unsubscribed")
      .eq("email", user.email)
      .single();
    if (pref?.unsubscribed) continue;

    const startDate = new Date(plan.started_at);
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const name = user.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    // Get tickers from weekly_selections as fallback
    const FALLBACK = {
      conservative: { tickers: ["BND","SCHD","VTI","VOO"], allocations: {BND:40,SCHD:30,VTI:20,VOO:10} },
      balanced:     { tickers: ["VOO","VTI","QQQ","SCHD"], allocations: {VOO:40,VTI:25,QQQ:25,SCHD:10} },
      aggressive:   { tickers: ["QQQ","VGT","TQQQ","ARKK"], allocations: {QQQ:35,VGT:25,TQQQ:25,ARKK:15} },
    };
    const fallback = FALLBACK[plan.profile] || FALLBACK.balanced;

    const emailData = {
      email: user.email,
      name,
      profile: plan.profile,
      amount: plan.amount,
      tickers: plan.tickers || fallback.tickers,
      allocations: plan.allocations || fallback.allocations,
    };

    try {
      // Day 3
      if (daysSinceStart >= 3 && daysSinceStart < 4 && !alreadySent.has(`${plan.user_id}_3`)) {
        await sendDay3Email(emailData);
        await supabase.from("email_sequence_log").insert({ user_id: plan.user_id, sequence_day: 3, sent_at: now.toISOString(), email: user.email });
        results.day3.push(user.email);
      }
      // Day 7
      if (daysSinceStart >= 7 && daysSinceStart < 8 && !alreadySent.has(`${plan.user_id}_7`)) {
        await sendDay7Email(emailData);
        await supabase.from("email_sequence_log").insert({ user_id: plan.user_id, sequence_day: 7, sent_at: now.toISOString(), email: user.email });
        results.day7.push(user.email);
      }
      // Day 30
      if (daysSinceStart >= 30 && daysSinceStart < 31 && !alreadySent.has(`${plan.user_id}_30`)) {
        await sendDay30Email(emailData);
        await supabase.from("email_sequence_log").insert({ user_id: plan.user_id, sequence_day: 30, sent_at: now.toISOString(), email: user.email });
        results.day30.push(user.email);
      }
    } catch(e) {
      results.errors.push({ email: user.email, error: e.message });
    }
  }

  const total = results.day3.length + results.day7.length + results.day30.length;
  console.log(`Email sequence: ${total} emails sent`, results);
  return Response.json({ sent: total, results });
}
