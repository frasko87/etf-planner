"use client";
// components/ContentTracker.js
// Add this to BlogPost.js — tracks time on page and sets attribution data
// Attribution is saved to localStorage and read by Onboarding.js on signup

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContentTracker({ postSlug, postTitle, writerCode, locale }) {
  const startTime = useRef(Date.now());
  const tracked   = useRef(false);

  useEffect(() => {
    if (!postSlug) return;

    // ── 1. Store attribution in localStorage ──────────────────────────────────
    // Only set if no existing attribution (first-touch wins)
    const existing = localStorage.getItem("etfplan_attribution");
    if (!existing) {
      localStorage.setItem("etfplan_attribution", JSON.stringify({
        postSlug,
        postTitle,
        writerCode: writerCode || null,
        locale:     locale || "en",
        landingUrl: window.location.href,
        readAt:     new Date().toISOString(),
      }));
    }

    // ── 2. Track post view (anonymous — for view count) ───────────────────────
    if (!tracked.current) {
      tracked.current = true;
      const supabase = createClient();
      const sessionId = sessionStorage.getItem("etfplan_session") || Math.random().toString(36).slice(2);
      sessionStorage.setItem("etfplan_session", sessionId);

      supabase.from("post_views").insert({
        post_slug:   postSlug,
        writer_code: writerCode || null,
        locale:      locale || "en",
        session_id:  sessionId,
      }).then(() => {}).catch(() => {});
    }

    // ── 3. Track time on page — update attribution on exit ────────────────────
    const handleExit = () => {
      const seconds = Math.floor((Date.now() - startTime.current) / 1000);
      try {
        const attr = JSON.parse(localStorage.getItem("etfplan_attribution") || "{}");
        if (attr.postSlug === postSlug) {
          attr.timeOnPost = seconds;
          localStorage.setItem("etfplan_attribution", JSON.stringify(attr));
        }
      } catch {}
    };

    window.addEventListener("beforeunload", handleExit);
    return () => window.removeEventListener("beforeunload", handleExit);
  }, [postSlug, writerCode]);

  return null; // purely side-effect component
}

// Helper — called from Onboarding.js to get + clear attribution
export function getAndClearAttribution() {
  try {
    const raw = localStorage.getItem("etfplan_attribution");
    if (!raw) return null;
    const attr = JSON.parse(raw);
    // Don't clear yet — clear only after attribution is saved to DB
    return attr;
  } catch {
    return null;
  }
}

export function clearAttribution() {
  localStorage.removeItem("etfplan_attribution");
}
