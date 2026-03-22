import "./globals.css";

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata = {
  title: "ETF.PLAN — Build Wealth One Month at a Time",
  description: "Put in $100/month for 10 years. Your portfolio generates +$1,755/year passively — that's your phone bill, car insurance, and all your subscriptions paid. Free plan, 2 min setup.",
  metadataBase: new URL("https://etfplan.app"),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: "KG7a0kWH83vNJCwa590sgdPc4WlV5TBwUppzGVPF5fw" },
  openGraph: {
    title: "ETF.PLAN — $100/month today. +$1,755/year forever.",
    description: "Start with $50/month. In 10 years your portfolio pays your phone bill, car insurance and streaming — every year, automatically.",
    url: "https://etfplan.app",
    siteName: "ETF.PLAN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ETF.PLAN — Build passive income from $50/month" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETF.PLAN — $100/month today. +$1,755/year forever.",
    description: "Free personalised ETF plan. Your money starts working harder than you do.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://etfplan.app" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "ETF.PLAN" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-apple.png", sizes: "180x180", type: "image/png" }],
  },
};

// ─── Viewport — SEPARATE export (fixes 3 ⚠ build warnings) ──────────────────
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ─── Structured data ──────────────────────────────────────────────────────────
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ETF.PLAN",
    "url": "https://etfplan.app",
    "description": "Free personalised ETF investment planner. Tells you exactly which ETFs to buy each month.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Do I need a brokerage account to use ETF.PLAN?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — ETF.PLAN tells you what to buy, but you execute the trades yourself on a platform like Robinhood, eToro, or Interactive Brokers. All are free to open and commission-free for ETFs." } },
      { "@type": "Question", "name": "Is my money safe with ETF.PLAN?", "acceptedAnswer": { "@type": "Answer", "text": "Your money never touches ETF.PLAN — we don't hold any funds. You invest directly through your regulated brokerage. We only track what you tell us you bought." } },
      { "@type": "Question", "name": "Can I lose money investing in ETFs?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — any investment can go down short term. But over 10 years, the S&P 500 has never had a negative return on a 10-year hold. The ~9% balanced return is a historical average. The longer you hold, the safer it gets." } },
      { "@type": "Question", "name": "How much money do I need to start?", "acceptedAnswer": { "@type": "Answer", "text": "ETF.PLAN is designed around $50, $100 or $150/month. Most brokers let you start with as little as $1 using fractional shares. ETF.PLAN itself is free." } },
      { "@type": "Question", "name": "Is ETF.PLAN free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, ETF.PLAN is 100% free. The core personalised ETF plan will always be free." } },
      { "@type": "Question", "name": "How often do the ETF picks change?", "acceptedAnswer": { "@type": "Answer", "text": "Our scoring engine runs every market day. Picks update weekly based on momentum, stability and trend scores across 42 ETFs." } },
    ],
  },
];

import CookieBanner from "@/components/CookieBanner";
import { Suspense } from "react";
import PageTracker from "@/components/PageTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
