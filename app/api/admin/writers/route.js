// app/api/admin/writers/route.js
// Manage copywriter accounts from the admin panel

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function checkAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === process.env.ADMIN_PASSWORD;
}

export async function GET(req) {
  if (!await checkAdmin()) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Get all writers with post count and conversion count
  const { data: writers, error } = await supabase
    .from("writers")
    .select("id, name, email, writer_code, bio, active, created_at")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Enrich with stats
  const enriched = await Promise.all((writers || []).map(async (w) => {
    const [postsRes, convsRes] = await Promise.all([
      supabase.from("blog_posts").select("id", { count:"exact", head:true }).eq("writer_code", w.writer_code),
      supabase.from("content_attribution").select("id", { count:"exact", head:true }).eq("writer_code", w.writer_code),
    ]);
    return {
      ...w,
      post_count:       postsRes.count ?? 0,
      conversion_count: convsRes.count ?? 0,
    };
  }));

  return Response.json({ writers: enriched });
}

export async function POST(req) {
  if (!await checkAdmin()) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const body = await req.json();
  const { name, email, writer_code, bio, password_hash } = body;

  if (!name || !email || !writer_code || !password_hash) {
    return Response.json({ error: "Missing required fields: name, email, writer_code, password_hash" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("writers")
    .insert({
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      writer_code:   writer_code.toLowerCase().trim(),
      bio:           bio?.trim() || null,
      password_hash: password_hash,
      active:        true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "Email or writer code already exists" }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true, writer: data });
}

export async function PATCH(req) {
  if (!await checkAdmin()) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { id, ...updates } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await supabase
    .from("writers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true, writer: data });
}
