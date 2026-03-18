// app/api/admin/stats/route.js
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function isAdmin(cookieStore) {
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isAdmin(cookieStore)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const [
    { data: users },
    { data: plans },
    { data: subscribers, count: totalSubs },
    { data: fetchLogs },
    { data: selections },
    { data: recentPlans },
    { data: broadcastLogs },
    { data: overrides },
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from("user_plans").select("profile, amount, started_at, user_id, admin_note"),
    supabase.from("email_preferences").select("email, user_id, subscribed_at, unsubscribed", { count:"exact" }).eq("unsubscribed", false),
    supabase.from("fetch_log").select("*").order("fetched_at", { ascending:false }).limit(10),
    supabase.from("weekly_selections").select("profile, tickers, allocations, week_start, is_current").eq("is_current", true),
    supabase.from("user_plans").select("profile, amount, started_at, user_id, admin_note").order("started_at", { ascending:false }).limit(20),
    supabase.from("broadcast_log").select("*").order("sent_at", { ascending:false }).limit(20),
    supabase.from("etf_overrides").select("*").eq("active", true),
  ]);

  // Plan breakdown
  const planBreakdown = { conservative:0, balanced:0, aggressive:0 };
  (plans || []).forEach(p => { if (planBreakdown[p.profile] !== undefined) planBreakdown[p.profile]++; });

  // Amount breakdown
  const amountBreakdown = { 50:0, 100:0, 150:0 };
  (plans || []).forEach(p => { if (amountBreakdown[p.amount] !== undefined) amountBreakdown[p.amount]++; });

  // Growth chart — signups per week for last 12 weeks
  const allUsers = users?.users || [];
  const now = new Date();
  const weeklyGrowth = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (11 - i) * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const count = allUsers.filter(u => {
      const d = new Date(u.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    return {
      week: weekStart.toLocaleDateString("en-US", { month:"short", day:"numeric" }),
      signups: count,
    };
  });

  // MRR calculation
  const mrr = (plans || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Recent signups
  const recentUsers = allUsers
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 20)
    .map(u => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign: u.last_sign_in_at }));

  return Response.json({
    stats: {
      totalUsers:   allUsers.length,
      totalPlans:   (plans || []).length,
      totalSubs:    totalSubs || 0,
      planBreakdown,
      amountBreakdown,
      mrr,
    },
    recentUsers,
    subscribers:    subscribers || [],
    fetchLogs:      fetchLogs || [],
    selections:     selections || [],
    recentPlans:    recentPlans || [],
    plans:          plans || [],
    weeklyGrowth:   weeklyGrowth,
    broadcastLogs:  broadcastLogs || [],
    overrides:      overrides || [],
  });
}
