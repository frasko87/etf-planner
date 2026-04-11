// app/api/attribution/route.js
// Called from Onboarding.js when user completes plan setup
// Reads attribution cookie set by blog post, saves to content_attribution table

import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { userId, userEmail, profile, amount } = await req.json();
    if (!userId) return Response.json({ error:"Missing userId" }, { status:400 });

    // Get attribution data from request body (sent from client-side localStorage)
    const body = await req.json().catch(() => ({}));
    const { postSlug, postTitle, writerCode, locale, landingUrl, timeOnPost } = body;

    if (!postSlug && !writerCode) {
      return Response.json({ skipped:true, reason:"No attribution data" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Look up writer by code
    let writerId = null;
    if (writerCode) {
      const { data: writer } = await supabase
        .from("writers")
        .select("id")
        .eq("writer_code", writerCode)
        .single();
      writerId = writer?.id || null;
    }

    // Save attribution
    const { error } = await supabase.from("content_attribution").upsert({
      user_id:      userId,
      email:        userEmail,
      writer_id:    writerId,
      writer_code:  writerCode || null,
      post_slug:    postSlug || null,
      post_title:   postTitle || null,
      locale:       locale || "en",
      landing_url:  landingUrl || null,
      time_on_post: timeOnPost || null,
      signed_up_at: new Date().toISOString(),
      plan_profile: profile || null,
      plan_amount:  amount || null,
    }, { onConflict:"user_id" });

    if (error) {
      console.error("Attribution save error:", error.message);
      return Response.json({ error: error.message }, { status:500 });
    }

    return Response.json({ saved:true, writerCode, postSlug });
  } catch (e) {
    console.error("Attribution error:", e);
    return Response.json({ error: e.message }, { status:500 });
  }
}
