// app/api/delete-account/route.js
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Verify the user with anon key
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Delete with service key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    await supabaseAdmin.from("user_monthly_actions").delete().eq("user_id", user.id);
    await supabaseAdmin.from("user_plans").delete().eq("user_id", user.id);
    await supabaseAdmin.from("email_preferences").delete().eq("email", user.email);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return Response.json({ success: true });
  } catch(e) {
    console.error("Delete account error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
