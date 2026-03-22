// app/privacy/page.js
// Fix: GA4 properly disclosed in section 4 (third-party services) and section 6 (cookies)
// Legal compliance — Google Analytics must be listed as a third-party data processor.
"use client";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight:"100vh", background:"#f8f8f5", fontFamily:"Arial, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background:"white", borderBottom:"1px solid #e8e8e2", padding:"0 clamp(16px,4vw,48px)", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" style={{ fontFamily:"monospace", fontWeight:700, fontSize:13, letterSpacing:3, color:"#1a1a2e", textDecoration:"none" }}>
          ETF<span style={{ color:"#00b96b" }}>.</span>PLAN
        </Link>
        <Link href="/" style={{ fontSize:13, color:"#7a7a8a", textDecoration:"none" }}>← Back home</Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth:720, margin:"0 auto", padding:"48px clamp(16px,4vw,48px) 80px" }}>
        <h1 style={{ fontSize:"clamp(28px,5vw,40px)", fontWeight:700, color:"#1a1a2e", marginBottom:8, letterSpacing:"-1px" }}>Privacy Policy</h1>
        <p style={{ fontSize:13, color:"#7a7a8a", marginBottom:40, fontFamily:"monospace" }}>Last updated: March 22, 2026</p>

        {[
          {
            title: "1. Who we are",
            body: "ETF.PLAN is a free investment planning tool operated by Francisco Estrada, based in Madrid, Spain. Our website is located at etfplan.app. You can contact us at hello@etfplan.app.",
          },
          {
            title: "2. What data we collect",
            body: "We collect the following information when you create an account:\n\n• Email address (required for account creation)\n• Name (if you sign in with Google)\n• Your selected investment plan (Conservative, Balanced, or Aggressive)\n• Monthly investment amount you choose ($50, $100, or $150)\n• ETF purchase history you manually record\n\nWe do not collect any financial account details, credit card numbers, or bank information.",
          },
          {
            title: "3. How we use your data",
            body: "We use your data to:\n\n• Provide you with a personalised ETF investment plan\n• Send you monthly email reminders with your ETF picks (if you subscribe)\n• Show you your portfolio tracking history\n• Improve the ETF.PLAN service\n• Analyse anonymised usage patterns via Google Analytics\n\nWe never sell your data to third parties. We never share your data with advertisers.",
          },
          {
            // FIXED: GA4 now explicitly listed in section 4
            title: "4. Third-party services",
            body: "We use the following third-party services to operate ETF.PLAN:\n\n• Supabase — database and authentication (supabase.com). Stores your account data, plan preferences, and portfolio history.\n• Resend — email delivery (resend.com). Your email address is shared to send monthly investment reminders.\n• Vercel — website hosting (vercel.com). Serves the ETF.PLAN web application.\n• Alpha Vantage & Finnhub — market data APIs (no personal data shared).\n• Google Analytics 4 (GA4) — website analytics provided by Google LLC (google.com/analytics). GA4 collects anonymised data about how visitors use our site, including pages visited, session duration, approximate location, and device type. This data is processed by Google under their Privacy Policy (policies.google.com/privacy). We use GA4 to understand usage patterns and improve the product.\n\nEach of these services has their own privacy policy. We only share the minimum data necessary for each service to function.",
          },
          {
            title: "5. Google sign-in",
            body: "If you choose to sign in with Google, we receive your email address and public profile name from Google. We do not access your Google Drive, Gmail, contacts, or any other Google services. We only use your Google account for authentication.",
          },
          {
            // FIXED: GA4 cookie usage now fully disclosed in section 6
            title: "6. Cookies and analytics",
            body: "We use the following types of cookies:\n\n• Essential cookies — required to keep you logged in to your account. Cannot be disabled.\n• Analytics cookies — Google Analytics 4 (GA4) uses cookies (_ga, _ga_*, _gid) to collect anonymised data about pages visited, session duration, and general location. This data is sent to Google's servers and processed in accordance with their Privacy Policy.\n\nWe do not use advertising cookies or tracking pixels for paid ad targeting. You can:\n• Opt out of Google Analytics tracking by installing the Google Analytics Opt-out browser add-on (tools.google.com/dlpage/gaoptout)\n• Manage cookie preferences via our cookie banner\n• Decline non-essential cookies when prompted",
          },
          {
            title: "7. Data retention",
            body: "We store your account data for as long as your account is active. You can delete your account at any time from the dashboard — this immediately and permanently removes all your data from our systems, including your plan, purchase history, and email preferences.",
          },
          {
            title: "8. Your rights (GDPR)",
            body: "If you are located in the European Union or European Economic Area, you have the following rights under GDPR:\n\n• Right to access your data\n• Right to correct your data\n• Right to delete your data (right to erasure)\n• Right to restrict processing\n• Right to data portability\n• Right to object to processing\n\nTo exercise any of these rights, email us at hello@etfplan.app and we will respond within 30 days.",
          },
          {
            title: "9. Data security",
            body: "All data is encrypted in transit using HTTPS. We use Supabase Row Level Security to ensure users can only access their own data. We do not store passwords — authentication is handled securely by Supabase or Google.",
          },
          {
            title: "10. Children",
            body: "ETF.PLAN is not directed at children under 16. We do not knowingly collect data from anyone under 16. If you believe a child has provided us with personal data, please contact us at hello@etfplan.app.",
          },
          {
            title: "11. Changes to this policy",
            body: "We may update this privacy policy from time to time. We will notify registered users by email of any significant changes. The date at the top of this page shows when it was last updated.",
          },
          {
            title: "12. Contact",
            body: "For any privacy-related questions or requests, contact us at:\n\nhello@etfplan.app\n\nETF.PLAN / Francisco Estrada\nMadrid, Spain",
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom:36 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#1a1a2e", marginBottom:12 }}>{section.title}</h2>
            <p style={{ fontSize:15, color:"#4a4a5a", lineHeight:1.8, whiteSpace:"pre-line" }}>{section.body}</p>
          </div>
        ))}

        <div style={{ borderTop:"1px solid #e8e8e2", paddingTop:32, marginTop:16 }}>
          <p style={{ fontSize:13, color:"#7a7a8a", lineHeight:1.7 }}>
            Questions? Email us at <a href="mailto:hello@etfplan.app" style={{ color:"#00b96b" }}>hello@etfplan.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}
