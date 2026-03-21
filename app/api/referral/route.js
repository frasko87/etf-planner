// app/api/referral/route.js
// GET: get user's referral code + stats
// POST: track a referral signup
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Generate deterministic referral code from user ID
  const code = user.id.replace(/-/g, "").slice(0, 8).toUpperCase();

  // Count how many signed up with this code
  const { count } = await supabaseAdmin
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_code", code);

  return Response.json({ code, referralLink: `https://etfplan.app/?ref=${code}`, signups: count || 0 });
}

export async function POST(req) {
  const { code, newUserId, newUserEmail } = await req.json();
  if (!code || !newUserId) return Response.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  await supabase.from("referrals").upsert({
    referrer_code: code.toUpperCase(),
    referred_user_id: newUserId,
    referred_email: newUserEmail,
    signed_up_at: new Date().toISOString(),
  }, { onConflict: "referred_user_id" });

  return Response.json({ success: true });
}
