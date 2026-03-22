// app/layout.js
// Fix: viewport moved OUT of metadata export into its own export const viewport = {}
// This clears all 3 build warnings:
//   ⚠ Unsupported metadata viewport is configured in metadata export in /admin/login
//   ⚠ Unsupported metadata viewport is configured in metadata export in /_not-found
//   ⚠ Unsupported metadata viewport is configured in metadata export in /admin
// All three inherit from this root layout, so fixing it here fixes all of them.

import "./globals.css";

// ── Metadata — viewport block REMOVED from here ──────────────────────────────
export const metadata = {
  title: "ETF.PLAN — Build Wealth One Month at a Time",
  description: "Put in $100/month for 10 years. Your portfolio generates +$1,755/year passively — that's your phone bill, car insurance, and all your subscriptions paid. Free plan, 2 min setup.",
  metadataBase: new URL("https://etfplan.app"),
  verification: {
    google: "KG7a0kWH83vNJCwa590sgdPc4WlV5TBwUppzGVPF5fw",
  },
  openGraph: {
    title: "ETF.PLAN — $100/month today. +$1,755/year forever.",
    description: "Start with $50/month. In 10 years your portfolio pays your phone bill, car insurance and streaming — every year, automatically.",
    url: "https://etfplan.app",
    siteName: "ETF.PLAN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ETF.PLAN — Build passive income from $50/month",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETF.PLAN — $100/month today. +$1,755/year forever.",
    description: "Free personalised ETF plan. Your money starts working harder than you do.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://etfplan.app",
  },
  // ← viewport REMOVED from here
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ETF.PLAN",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-apple.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

// ── Viewport — SEPARATE export (Next.js 13+ requirement) ─────────────────────
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import CookieBanner from "@/components/CookieBanner";
import { Suspense } from "react";
import PageTracker from "@/components/PageTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieBanner />
        <Suspense fallback={null}>
          <PageTracker />
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
