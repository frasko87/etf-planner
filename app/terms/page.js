"use client";
import Link from "next/link";

export default function TermsOfService() {
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
        <h1 style={{ fontSize:"clamp(28px,5vw,40px)", fontWeight:700, color:"#1a1a2e", marginBottom:8, letterSpacing:"-1px" }}>Terms of Service</h1>
        <p style={{ fontSize:13, color:"#7a7a8a", marginBottom:40, fontFamily:"monospace" }}>Last updated: March 20, 2026</p>

        {[
          {
            title: "1. Acceptance of terms",
            body: "By creating an account or using ETF.PLAN (etfplan.app), you agree to these Terms of Service. If you do not agree, please do not use the service. We reserve the right to update these terms at any time with notice to registered users."
          },
          {
            title: "2. What ETF.PLAN is",
            body: "ETF.PLAN is an educational and informational tool that helps you understand and track Exchange Traded Fund (ETF) investment strategies. It provides:\n\n• Personalised ETF plan suggestions based on your risk profile\n• Monthly ETF picks based on market data and scoring algorithms\n• Portfolio tracking tools for investments you self-report\n• Educational content about ETF investing\n\nETF.PLAN is a free service."
          },
          {
            title: "3. Not financial advice",
            body: "IMPORTANT: ETF.PLAN does not provide financial advice, investment advice, tax advice, or legal advice.\n\nAll content on ETF.PLAN is for informational and educational purposes only. Nothing on this site should be construed as a recommendation to buy or sell any security.\n\nPast performance of any ETF or investment strategy shown on this site does not guarantee future results. All investing involves risk, including the possible loss of principal.\n\nBefore making any investment decisions, you should consult a qualified financial advisor who is licensed in your jurisdiction."
          },
          {
            title: "4. Your account",
            body: "You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. You must be at least 18 years old to use ETF.PLAN.\n\nWe reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or illegal activity."
          },
          {
            title: "5. Your data",
            body: "The investment data you enter into ETF.PLAN (such as ETF purchases you mark as bought) is self-reported by you. We do not verify the accuracy of this data. ETF.PLAN is not connected to any brokerage or financial institution.\n\nYou own your data. You can delete your account and all associated data at any time from the dashboard settings."
          },
          {
            title: "6. Market data",
            body: "Price and performance data shown on ETF.PLAN is sourced from third-party providers (Alpha Vantage, Finnhub) and may be delayed or inaccurate. We do not guarantee the accuracy, completeness, or timeliness of any market data displayed.\n\nDo not make investment decisions based solely on data shown on this platform."
          },
          {
            title: "7. Limitation of liability",
            body: "ETF.PLAN and its operator (Francisco Estrada) are not liable for any financial losses, investment losses, or damages resulting from your use of this service or reliance on any information provided.\n\nThe service is provided 'as is' without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that any specific ETF selection methodology will produce profitable results."
          },
          {
            title: "8. Intellectual property",
            body: "The ETF.PLAN name, logo, design, and proprietary content are owned by Francisco Estrada. You may not copy, reproduce, or redistribute any part of the platform without written permission.\n\nMarket data, ETF names, and ticker symbols are the property of their respective owners."
          },
          {
            title: "9. Email communications",
            body: "By creating an account, you agree to receive transactional emails related to your account (such as email confirmation). Monthly newsletter emails are opt-in — you can unsubscribe at any time using the link in any email or from your account settings."
          },
          {
            title: "10. Governing law",
            body: "These terms are governed by the laws of Spain. Any disputes arising from these terms or your use of ETF.PLAN shall be subject to the jurisdiction of the courts of Madrid, Spain."
          },
          {
            title: "11. Contact",
            body: "For questions about these terms, contact us at:\n\nhello@etfplan.app\n\nETF.PLAN / Francisco Estrada\nMadrid, Spain"
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
