// app/api/cms/posts/route.js
// Blog post CRUD for writers (scoped to their own posts)

import { createClient } from "@supabase/supabase-js";

function validateToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [writerId, writerCode, timestamp] = decoded.split(":");
    if (Date.now() - parseInt(timestamp) > 12 * 60 * 60 * 1000) return null;
    return { writerId: parseInt(writerId), writerCode };
  } catch { return null; }
}

async function getWriter(supabase, token) {
  const session = validateToken(token);
  if (!session) return null;
  const { data } = await supabase.from("writers").select("*").eq("id", session.writerId).eq("active", true).single();
  return data;
}

function autoSlug(title) {
  return (title || "").toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
}
function autoSlugES(title) {
  return (title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
}

export async function GET(req) {
  const token = req.headers.get("x-cms-token");
  if (!token) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const writer = await getWriter(supabase, token);
  if (!writer) return Response.json({ error:"Unauthorized" }, { status:401 });

  // Get this writer's posts with view/conversion counts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id,slug,slug_es,title,title_es,category,tags,reading_time,published,featured,published_at,created_at,seo_keywords,writer_code")
    .eq("writer_code", writer.writer_code)
    .order("created_at", { ascending: false });

  // Get view counts per post
  const slugs = (posts || []).map(p => p.slug);
  let viewMap = {}, convMap = {};

  if (slugs.length) {
    const { data: views } = await supabase
      .from("post_views")
      .select("post_slug")
      .in("post_slug", slugs);
    (views || []).forEach(v => { viewMap[v.post_slug] = (viewMap[v.post_slug]||0) + 1; });

    const { data: convs } = await supabase
      .from("content_attribution")
      .select("post_slug")
      .eq("writer_code", writer.writer_code);
    (convs || []).forEach(c => { convMap[c.post_slug] = (convMap[c.post_slug]||0) + 1; });
  }

  const postsWithStats = (posts || []).map(p => ({
    ...p,
    views:       viewMap[p.slug] || 0,
    conversions: convMap[p.slug] || 0,
  }));

  // Writer-level stats
  const totalViews       = Object.values(viewMap).reduce((a,b)=>a+b,0);
  const totalConversions = Object.values(convMap).reduce((a,b)=>a+b,0);
  const stats = {
    myPosts:     postsWithStats.length,
    published:   postsWithStats.filter(p=>p.published).length,
    views:       totalViews,
    conversions: totalConversions,
  };

  return Response.json({ posts: postsWithStats, stats });
}

export async function POST(req) {
  const token = req.headers.get("x-cms-token");
  if (!token) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const writer = await getWriter(supabase, token);
  if (!writer) return Response.json({ error:"Unauthorized" }, { status:401 });

  const body = await req.json();

  const payload = {
    title:        body.title,
    title_es:     body.title_es || null,
    excerpt:      body.excerpt || null,
    excerpt_es:   body.excerpt_es || null,
    content:      body.content || null,
    content_es:   body.content_es || null,
    category:     body.category || "guide",
    tags:         body.tags || [],
    seo_keywords: body.seo_keywords || [],
    reading_time: body.reading_time || 5,
    meta_title:   body.meta_title || null,
    meta_desc:    body.meta_desc || null,
    meta_title_es:body.meta_title_es || null,
    meta_desc_es: body.meta_desc_es || null,
    slug:         body.slug || autoSlug(body.title),
    slug_es:      body.slug_es || autoSlugES(body.title_es || body.title),
    published:    body.published || false,
    featured:     body.featured || false,
    writer_id:    writer.id,
    writer_code:  writer.writer_code,
    writer_name:  writer.name,
    updated_at:   new Date().toISOString(),
  };

  if (payload.published && !payload.published_at) {
    payload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase.from("blog_posts").insert(payload).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success:true, post: data });
}

export async function PATCH(req) {
  const token = req.headers.get("x-cms-token");
  if (!token) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const writer = await getWriter(supabase, token);
  if (!writer) return Response.json({ error:"Unauthorized" }, { status:401 });

  const body = await req.json();
  const { id, ...updates } = body;

  // Verify this post belongs to this writer
  const { data: existing } = await supabase.from("blog_posts").select("writer_code,published_at").eq("id", id).single();
  if (!existing || existing.writer_code !== writer.writer_code) {
    return Response.json({ error:"Not your post" }, { status:403 });
  }

  if (updates.published && !existing.published_at) {
    updates.published_at = new Date().toISOString();
  }
  updates.updated_at = new Date().toISOString();

  // Clean arrays
  if (typeof updates.tags === "string") updates.tags = updates.tags.split(",").map(t=>t.trim()).filter(Boolean);
  if (typeof updates.seo_keywords === "string") updates.seo_keywords = updates.seo_keywords.split(",").map(t=>t.trim()).filter(Boolean);

  const { data, error } = await supabase.from("blog_posts").update(updates).eq("id", id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success:true, post: data });
}

export async function DELETE(req) {
  const token = req.headers.get("x-cms-token");
  if (!token) return Response.json({ error:"Unauthorized" }, { status:401 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const writer = await getWriter(supabase, token);
  if (!writer) return Response.json({ error:"Unauthorized" }, { status:401 });

  const { id } = await req.json();

  const { data: existing } = await supabase.from("blog_posts").select("writer_code").eq("id", id).single();
  if (!existing || existing.writer_code !== writer.writer_code) {
    return Response.json({ error:"Not your post" }, { status:403 });
  }

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success:true });
}
