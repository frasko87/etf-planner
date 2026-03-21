"use client";
// components/GoogleAnalytics.js
// Tracks: visitors, locations, devices, referrers, sessions, bounce rate
// All automatically — just add your GA4 Measurement ID to env vars

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Send custom events to GA4
export function trackGA(eventName, params = {}) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", eventName, params);
}

// Track page views on route changes
function GAPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    const url = pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");
    window.gtag("config", GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
      <GAPageTracker />
    </>
  );
}
