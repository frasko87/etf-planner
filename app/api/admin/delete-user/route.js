import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req) {
  // Verify admin session
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, email } = await req.json();
  if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Delete all user data
  await supabase.from("user_monthly_actions").delete().eq("user_id", userId);
  await supabase.from("user_plans").delete().eq("user_id", userId);
  if (email) {
    await supabase.from("email_preferences").delete().eq("email", email);
  }

  // Delete auth user
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
