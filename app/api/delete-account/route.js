import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    // Get the user from their session
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Verify the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service key to delete the auth user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return Response.json({ success: true });
  } catch(e) {
    console.error("Delete account error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
