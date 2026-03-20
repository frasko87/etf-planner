// app/api/admin/delete-user/route.js
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function isAdmin(cookieStore) {
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req) {
  const cookieStore = await cookies();
  if (!isAdmin(cookieStore)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, email } = await req.json();
  if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  await supabase.from("user_monthly_actions").delete().eq("user_id", userId);
  await supabase.from("user_plans").delete().eq("user_id", userId);
  if (email) {
    await supabase.from("email_preferences").delete().eq("email", email);
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
