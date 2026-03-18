// app/api/admin/newsletter/route.js
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { sendNewsletter } from "@/lib/email";

function isAdmin(cookieStore) {
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req) {
  const cookieStore = await cookies();
  if (!isAdmin(cookieStore)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, headline, body, ctaText, ctaUrl, segment, rawHtml } = await req.json();

  if (!subject || (!body && !rawHtml)) {
    return Response.json({ error: "Subject and body required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  let query = supabase.from("active_subscribers").select("email, profile");
  const { data: subscribers } = await query;

  const targets = segment && segment !== "all"
    ? (subscribers || []).filter(s => s.profile === segment)
    : (subscribers || []);

  let sent = 0, failed = 0;
  const results = [];

  for (const sub of targets) {
    try {
      const name = sub.email.split("@")[0].replace(/^./, c => c.toUpperCase());
      await sendNewsletter({
        email: sub.email,
        name,
        subject,
        headline: headline || "",
        body,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        rawHtml: rawHtml || null,
      });
      sent++;
      results.push({ email: sub.email, status: "sent" });
    } catch(e) {
      console.error(`Newsletter failed for ${sub.email}:`, e.message);
      failed++;
      results.push({ email: sub.email, status: "failed", error: e.message });
    }
  }

  // Log the broadcast
  await supabase.from("broadcast_log").insert({
    subject,
    headline: headline || "",
    segment:  segment || "all",
    sent_count:   sent,
    failed_count: failed,
    sent_at:  new Date().toISOString(),
  });

  return Response.json({ sent, failed, total: targets.length, results });
}
