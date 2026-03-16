// app/api/send-monthly-reminder/route.js
import { sendMonthlyReminder } from "../../../lib/email";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { secret } = await req.json().catch(()=>({}));
    if (secret !== process.env.CRON_SECRET) {
      return Response.json({ error:"Unauthorized" }, { status:401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const monthKey   = new Date().toISOString().slice(0,7);
    const monthLabel = new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});

    const { data: subscribers } = await supabase
      .from("active_subscribers")
      .select("*");

    if (!subscribers?.length) return Response.json({ sent:0 });

    const { data: selections } = await supabase
      .from("weekly_selections").select("*").eq("is_current", true);

    const selByProfile = {};
    (selections||[]).forEach(s=>{ selByProfile[s.profile]=s; });

    const FALLBACK = {
      conservative: { tickers:["BND","SCHD","VTI","VOO"],  allocs:{ BND:40,SCHD:30,VTI:20,VOO:10 } },
      balanced:     { tickers:["VOO","VTI","QQQ","SCHD"],  allocs:{ VOO:40,VTI:25,QQQ:25,SCHD:10 } },
      aggressive:   { tickers:["QQQ","VGT","TQQQ","ARKK"], allocs:{ QQQ:35,VGT:25,TQQQ:25,ARKK:15 } },
    };

    let sent = 0, failed = 0;

    for (const sub of subscribers) {
      if (!sub.email || !sub.profile) continue;
      try {
        const sel     = selByProfile[sub.profile];
        const fb      = FALLBACK[sub.profile] || FALLBACK.balanced;
        const name1   = sub.email.split("@")[0].replace(/^./, c=>c.toUpperCase());
        await sendMonthlyReminder({
          email: sub.email, name: name1, profile: sub.profile,
          amount: sub.amount||100, tickers: sel?.tickers||fb.tickers,
          allocations: sel?.allocations||fb.allocs, monthLabel,
        });
        await supabase.from("email_preferences")
          .upsert({ email:sub.email, last_reminder_at:new Date().toISOString() });
        await supabase.from("user_monthly_actions").upsert({
          user_id:sub.user_id, month_key:monthKey, profile:sub.profile,
          amount:sub.amount||100, tickers:sel?.tickers||fb.tickers,
          allocations:sel?.allocations||fb.allocs, entry_prices:{},
          amounts_invested:Object.fromEntries((sel?.tickers||fb.tickers).map(t=>[t,Math.round((sub.amount||100)*((sel?.allocations||fb.allocs)[t]||25)/100)])),
        });
        sent++;
      } catch(e) { console.error(sub.email, e.message); failed++; }
    }

    return Response.json({ sent, failed, total:subscribers.length, month:monthKey });
  } catch(e) {
    return Response.json({ error:e.message }, { status:500 });
  }
}
