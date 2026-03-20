// app/api/admin/unsubscribe-user/route.js
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function isAdmin(cookieStore) {
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req) {
  const cookieStore = await cookies();
  if (!isAdmin(cookieStore)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { error } = await supabase
    .from("email_preferences")
    .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
    .eq("email", email);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
