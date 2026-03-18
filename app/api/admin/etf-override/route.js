// app/api/admin/etf-override/route.js
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function isAdmin(cookieStore) {
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req) {
  const cookieStore = await cookies();
  if (!isAdmin(cookieStore)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { profile, tickers, allocations, note, active } = await req.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (active === false) {
    // Remove override
    await supabase.from("etf_overrides").update({ active: false }).eq("profile", profile);
    // Restore weekly_selections is_current from scoring engine
    return Response.json({ success: true, action: "removed" });
  }

  // Save override
  const { error: ovErr } = await supabase.from("etf_overrides").upsert({
    profile, tickers, allocations, override_note: note, set_at: new Date().toISOString(), active: true,
  }, { onConflict: "profile" });

  if (ovErr) return Response.json({ error: ovErr.message }, { status: 500 });

  // Also update weekly_selections so dashboard shows it immediately
  await supabase.from("weekly_selections").update({ is_current: false }).eq("profile", profile).eq("is_current", true);
  await supabase.from("weekly_selections").insert({
    profile, tickers, allocations,
    week_start: new Date().toISOString().split("T")[0],
    is_current: true,
    change_summary: `Manual override by admin: ${note || "no note"}`,
    changed: true,
  });

  return Response.json({ success: true, action: "set" });
}
