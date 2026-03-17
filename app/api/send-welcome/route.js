// app/api/send-welcome/route.js
import { sendWelcomeEmail } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Get user info
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user?.email) return Response.json({ error: "User not found" }, { status: 404 });

    // Check if unsubscribed
    const { data: pref } = await supabase
      .from("email_preferences")
      .select("unsubscribed")
      .eq("email", user.email)
      .single();
    if (pref?.unsubscribed) return Response.json({ skipped: true });

    // Get their plan
    const { data: plan } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (!plan) return Response.json({ error: "No plan found" }, { status: 404 });

    // Get current selections
    const { data: sel } = await supabase
      .from("weekly_selections")
      .select("*")
      .eq("profile", plan.profile)
      .eq("is_current", true)
      .single();

    const FALLBACK = {
      conservative: { tickers:["BND","SCHD","VTI","VOO"],  allocs:{ BND:40,SCHD:30,VTI:20,VOO:10 } },
      balanced:     { tickers:["VOO","VTI","QQQ","SCHD"],  allocs:{ VOO:40,VTI:25,QQQ:25,SCHD:10 } },
      aggressive:   { tickers:["QQQ","VGT","TQQQ","ARKK"], allocs:{ QQQ:35,VGT:25,TQQQ:25,ARKK:15 } },
    }[plan.profile] || { tickers:["VOO","VTI","QQQ","SCHD"], allocs:{ VOO:40,VTI:25,QQQ:25,SCHD:10 } };

    const name  = user.email.split("@")[0];
    const name1 = name.charAt(0).toUpperCase() + name.slice(1);

    // Register in email_preferences
    await supabase.from("email_preferences").upsert({
      email:           user.email,
      user_id:         userId,
      unsubscribed:    false,
      welcome_sent:    true,
      welcome_sent_at: new Date().toISOString(),
      source:          "onboarding",
    }, { onConflict: "email" });

    await sendWelcomeEmail({
      email:       user.email,
      name:        name1,
      profile:     plan.profile,
      amount:      plan.amount,
      tickers:     sel?.tickers    || FALLBACK.tickers,
      allocations: sel?.allocations || FALLBACK.allocs,
    });

    return Response.json({ sent: true, to: user.email });
  } catch (e) {
    console.error("Welcome email error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
