"use client";
// lib/analytics.js
// Lightweight event tracker — stores in Supabase events table
// No 3rd party. All data shows up in your admin panel.

import { createClient } from "@/lib/supabase/client";

// Generate or retrieve session ID
function getSessionId() {
  if (typeof window === "undefined") return null;
  let sid = sessionStorage.getItem("etfplan_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("etfplan_sid", sid);
  }
  return sid;
}

export async function track(eventName, props = {}) {
  try {
    if (typeof window === "undefined") return;

    // Fire to GA4 immediately (synchronous)
    if (window.gtag) {
      window.gtag("event", eventName, props);
    }

    // Fire to our Supabase events table (async, non-blocking)
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    await supabase.from("events").insert({
      name:       eventName,
      user_id:    session?.user?.id || null,
      session_id: getSessionId(),
      page:       window.location.pathname,
      props:      props,
    });
  } catch (e) {
    // Never let tracking errors break the app
    console.debug("Track error:", e);
  }
}

// Track page view — call on route change
export async function trackPageView() {
  await track("page_view", {
    url:      window.location.href,
    referrer: document.referrer || "direct",
    title:    document.title,
  });
}
