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
    { data: users,       count: totalUsers    },
    { data: plans                             },
    { data: subscribers, count: totalSubs     },
    { data: fetchLogs                         },
    { data: selections                        },
    { data: recentPlans                       },
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from("user_plans").select("profile, amount, started_at, user_id"),
    supabase.from("email_preferences").select("email, user_id, subscribed_at, unsubscribed", { count:"exact" }).eq("unsubscribed", false),
    supabase.from("fetch_log").select("*").order("fetched_at", { ascending:false }).limit(10),
    supabase.from("weekly_selections").select("profile, tickers, week_start, is_current").eq("is_current", true),
    supabase.from("user_plans").select("profile, amount, started_at, user_id").order("started_at", { ascending:false }).limit(20),
  ]);

  // Plan breakdown
  const planBreakdown = { conservative:0, balanced:0, aggressive:0 };
  (plans || []).forEach(p => { if (planBreakdown[p.profile] !== undefined) planBreakdown[p.profile]++; });

  // Amount breakdown
  const amountBreakdown = { 50:0, 100:0, 150:0 };
  (plans || []).forEach(p => { if (amountBreakdown[p.amount] !== undefined) amountBreakdown[p.amount]++; });

  // Recent signups with emails
  const recentUsers = (users?.users || [])
    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 20)
    .map(u => ({
      id:         u.id,
      email:      u.email,
      created_at: u.created_at,
      last_sign:  u.last_sign_in_at,
    }));



  return Response.json({
    stats: {
      totalUsers:   users?.users?.length || 0,
      totalPlans:   (plans || []).length,
      totalSubs:    totalSubs || 0,
      planBreakdown,
      amountBreakdown,
    },
    recentUsers,
    subscribers:  subscribers || [],
    fetchLogs:    fetchLogs || [],
    selections:   selections || [],
    recentPlans:  recentPlans || [],
    plans:        plans || [],
  });
}
