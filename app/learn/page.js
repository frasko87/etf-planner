import Link from "next/link";

export const metadata = {
  title: "What Are ETFs? The Smartest First Investment for Beginners | ETF.PLAN",
  description: "Learn what ETFs are, why they're the perfect first investment, and how to start with just $50/month. No experience needed. Real data, simple plans.",
  keywords: "what are ETFs, ETF investing for beginners, best ETFs 2025, how to invest in ETFs, S&P 500 ETF, index fund vs ETF, passive investing",
  openGraph: {
    title: "What Are ETFs? The Smartest First Investment for Beginners",
    description: "Everything you need to know about ETFs — what they are, why they work, and how to start with just $50/month.",
    type: "article",
  },
};

const PLATFORMS = [
  {
    name: "Robinhood",
    logo: "🟢",
    color: "#00c805",
    bg: "rgba(0,200,5,0.06)",
    border: "rgba(0,200,5,0.2)",
    minInvestment: "$1",
    fees: "Commission-free",
    best: "Best for beginners",
    pros: ["No account minimum", "Commission-free trades", "Fractional shares", "Clean mobile app"],
    cons: ["Limited research tools", "No retirement accounts on basic plan"],
    url: "https://robinhood.com",
  },
  {
    name: "Interactive Brokers",
    logo: "🔵",
    color: "#0066cc",
    bg: "rgba(0,102,204,0.06)",
    border: "rgba(0,102,204,0.2)",
    minInvestment: "$0",
    fees: "From $0",
    best: "Best for serious investors",
    pros: ["Access to global markets", "Advanced tools", "Low margin rates", "IBKR Lite is free"],
    cons: ["Interface can be complex for beginners", "Better suited for active traders"],
    url: "https://www.interactivebrokers.com",
  },
  {
    name: "eToro",
    logo: "🟤",
    color: "#2196a0",
    bg: "rgba(33,150,160,0.06)",
    border: "rgba(33,150,160,0.2)",
    minInvestment: "$10",
    fees: "Commission-free stocks & ETFs",
    best: "Best for social investing",
    pros: ["Copy top investors automatically", "Social trading features", "Fractional ETFs", "Easy to use"],
    cons: ["Withdrawal fee ($5)", "Spread on some assets"],
    url: "https://www.etoro.com",
  },
  {
    name: "Vanguard",
    logo: "🔴",
    color: "#8b0000",
    bg: "rgba(139,0,0,0.06)",
    border: "rgba(139,0,0,0.2)",
    minInvestment: "$1",
    fees: "Commission-free Vanguard ETFs",
    best: "Best for long-term investors",
    pros: ["Lowest expense ratios in the industry", "Owned by its investors", "VTI, VOO, SCHD direct", "Trusted for 50+ years"],
    cons: ["Older interface", "Less suited for active trading"],
    url: "https://investor.vanguard.com",
  },
];

const TOP_ETFS = [
  { ticker: "VTI",  name: "Vanguard Total Stock Market", color: "#00b96b", desc: "The entire US market in one fund. 3,700+ companies.", cagr: "13.5%", expense: "0.03%", risk: "Low" },
  { ticker: "VOO",  name: "Vanguard S&P 500",            color: "#3b82f6", desc: "The 500 biggest US companies. The gold standard.", cagr: "13.2%", expense: "0.03%", risk: "Low" },
  { ticker: "QQQ",  name: "Invesco Nasdaq-100",          color: "#8b5cf6", desc: "Top 100 tech & growth companies. High upside.", cagr: "18.0%", expense: "0.20%", risk: "Medium" },
  { ticker: "SCHD", name: "Schwab US Dividend Equity",   color: "#c9a84c", desc: "Companies that pay consistent dividends.", cagr: "12.0%", expense: "0.06%", risk: "Low" },
  { ticker: "VGT",  name: "Vanguard Information Tech",   color: "#ec4899", desc: "Pure tech exposure — Apple, Nvidia, Microsoft.", cagr: "20.0%", expense: "0.10%", risk: "Medium" },
];

const PAIN_POINTS = [
  {
    icon: "🧭",
    q: "\"I don't know where to start\"",
    a: "That's exactly why ETFs exist. Instead of picking individual stocks (which is genuinely hard), you buy a fund that holds hundreds of them at once. One purchase, instant diversification. ETF.PLAN tells you exactly which ones to buy and how much each month.",
  },
  {
    icon: "⏰",
    q: "\"I don't have time to manage investments\"",
    a: "ETFs are the ultimate set-and-forget investment. You buy once a month, hold. No daily monitoring, no earnings calls to track, no panic selling required. Our weekly scoring engine does the analysis — you just follow the plan.",
  },
  {
    icon: "💰",
    q: "I want to save money while I earn",
    a: "A savings account pays you 4-5% annually if you're lucky. The S&P 500 has returned an average of 10-13% per year over the last decade — after inflation. $100/month invested for 10 years at 12% CAGR becomes over $23,000. A savings account gets you $14,000. The math is clear.",
  },
];

const FAQS = [
  { q: "Are ETFs safe for beginners?", a: "ETFs are widely considered one of the safest ways to invest. Because they hold hundreds or thousands of stocks, no single company's failure can wipe out your investment. The S&P 500 has never had a 20-year period with a negative return in its history." },
  { q: "How much money do I need to start?", a: "Most brokers let you start with as little as $1 using fractional shares. ETF.PLAN is built around $50, $100 or $150/month — amounts that are realistic for most people starting out." },
  { q: "What's the difference between an ETF and a mutual fund?", a: "ETFs trade on the stock market like shares — you can buy and sell them any time during market hours. Mutual funds only trade once a day at closing price. ETFs also typically have lower fees and are more tax-efficient." },
  { q: "Do ETFs pay dividends?", a: "Many do. Dividend ETFs like SCHD are specifically designed to hold companies that pay regular dividends, giving you a passive income stream on top of price appreciation." },
  { q: "Can I lose all my money in ETFs?", a: "To lose everything in a broad market ETF like VTI or VOO, every major US company would have to go bankrupt simultaneously — which has never happened. Individual ETFs focused on single sectors carry more risk, which is why we show risk ratings for every fund." },
  { q: "How do ETFs make money?", a: "Two ways: price appreciation (the ETF's value goes up as the companies inside it grow) and dividends (companies pay cash back to shareholders, which the ETF passes on to you)." },
];

export default function LearnPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: 60, background: "rgba(248,248,245,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" className="pixel" style={{ fontSize: 11, color: "var(--text)" }}>
          ETF<span style={{ color: "var(--green)" }}>.</span>PLAN
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/learn" style={{ fontFamily: "DM Sans", fontSize: 14, color: "var(--green)", fontWeight: 500 }}>Learn</Link>
          <Link href="/login" style={{ fontFamily: "DM Sans", fontSize: 14, color: "var(--muted)" }}>Log in</Link>
          <Link href="/login?mode=signup" style={{ fontFamily: "DM Sans", fontSize: 14, fontWeight: 500, color: "white", background: "var(--green)", padding: "8px 18px", borderRadius: 8 }}>Start free</Link>
        </div>
      </nav>

      {/* ── Ticker tape ── */}
      <div style={{ overflow:"hidden", background:"var(--text)", padding:"9px 0" }}>
        <div style={{ display:"flex", gap:40, animation:"ticker 28s linear infinite", width:"max-content" }}>
          {[
            {ticker:"QQQ",ret:"+18.0%"},{ticker:"VTI",ret:"+13.5%"},{ticker:"VOO",ret:"+13.2%"},
            {ticker:"SCHD",ret:"+12.0%"},{ticker:"VGT",ret:"+20.0%"},{ticker:"BND",ret:"+4.8%"},
            {ticker:"QQQ",ret:"+18.0%"},{ticker:"VTI",ret:"+13.5%"},{ticker:"VOO",ret:"+13.2%"},
            {ticker:"SCHD",ret:"+12.0%"},{ticker:"VGT",ret:"+20.0%"},{ticker:"BND",ret:"+4.8%"},
          ].map((e,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, whiteSpace:"nowrap" }}>
              <span style={{ fontFamily:"DM Mono", fontSize:10, color:"rgba(255,255,255,0.45)" }}>{e.ticker}</span>
              <span style={{ fontFamily:"DM Mono", fontSize:11, color:"#00ff88", fontWeight:500 }}>{e.ret}</span>
              <span style={{ fontFamily:"DM Mono", fontSize:9, color:"rgba(255,255,255,0.15)" }}>|</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Hero */}
        <section style={{ padding: "72px 0 56px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--green2)", border: "1px solid rgba(0,185,107,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontFamily: "DM Mono", fontSize: 11, color: "var(--green)" }}>BEGINNER'S GUIDE TO ETF INVESTING</span>
          </div>
          <h1 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(36px,6vw,60px)", color: "var(--text)", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
            What Are ETFs?<br />
            <span style={{ color: "var(--green)" }}>The Smartest First Investment</span><br />
            You Can Make Today
          </h1>
          <p style={{ fontFamily: "DM Sans", fontSize: 18, color: "var(--muted)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 32px" }}>
            You don't need to pick stocks, time the market or watch financial news every day.
            ETFs let you invest in hundreds of companies at once — starting from $50/month.
          </p>
          <Link href="/login?mode=signup" style={{ display: "inline-block", fontFamily: "DM Sans", fontWeight: 600, fontSize: 16, color: "white", background: "var(--green)", padding: "14px 32px", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,185,107,0.3)" }}>
            Build My Plan — Free →
          </Link>
        </section>

        {/* What is an ETF */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 20 }}>
            So, what exactly is an ETF?
          </h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.85, marginBottom: 20 }}>
            An <strong style={{ color: "var(--text)" }}>ETF (Exchange-Traded Fund)</strong> is a basket of investments — stocks, bonds or commodities — that trades on the stock market like a regular share. When you buy one share of an ETF like <strong style={{ color: "var(--text)" }}>VTI</strong>, you instantly own a tiny piece of over 3,700 US companies including Apple, Microsoft, Amazon and thousands more.
          </p>
          <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.85, marginBottom: 20 }}>
            Think of it like this: instead of betting on a single horse to win the race, you buy a share of every horse in the race. Some will lose — but collectively, they almost always win over time.
          </p>
          <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.85 }}>
            The best part? ETFs are <strong style={{ color: "var(--text)" }}>passive</strong>. They simply track an index like the S&P 500. No fund manager making expensive decisions — just the market doing what it's done for 100+ years: growing.
          </p>
        </section>

        {/* Pain points */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 12 }}>
            Sound familiar?
          </h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.8, marginBottom: 36 }}>
            These are the most common reasons people delay investing. Here's the truth about each one.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PAIN_POINTS.map(p => (
              <div key={p.q} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 10 }}>{p.q}</div>
                    <div style={{ fontFamily: "DM Sans", fontSize: 15, color: "var(--muted)", lineHeight: 1.8 }}>{p.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why ETFs beat savings accounts */}
        <section style={{ marginBottom: 72, background: "var(--text)", borderRadius: 20, padding: "48px 40px" }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(24px,4vw,36px)", color: "white", letterSpacing: "-0.5px", marginBottom: 16 }}>
            $100/month: ETFs vs Savings Account
          </h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 36, lineHeight: 1.7 }}>
            Here's what happens to your money over time — same amount, very different outcomes.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "High-yield savings (4.5%)", vals: [{ t: "1 year", v: "$1,230" }, { t: "5 years", v: "$6,642" }, { t: "10 years", v: "$15,103" }], color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.05)" },
              { label: "Balanced ETF portfolio (13%)", vals: [{ t: "1 year", v: "$1,282" }, { t: "5 years", v: "$8,882" }, { t: "10 years", v: "$23,234" }], color: "#00ff88", bg: "rgba(0,255,136,0.08)" },
            ].map(col => (
              <div key={col.label} style={{ background: col.bg, borderRadius: 12, padding: "24px 20px", border: `1px solid ${col.color}33` }}>
                <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 14, color: col.color, marginBottom: 20 }}>{col.label}</div>
                {col.vals.map(v => (
                  <div key={v.t} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontFamily: "DM Mono", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{v.t}</span>
                    <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 18, color: col.color }}>{v.v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "DM Mono", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 16 }}>
            Based on historical averages. Past performance does not guarantee future results.
          </p>
        </section>

        {/* Top ETFs */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 12 }}>
            The ETFs we track and why they matter
          </h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.8, marginBottom: 36 }}>
            These are the most widely held, most trusted ETFs in the world. Each one has been vetted by millions of investors and financial institutions.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TOP_ETFS.map(etf => (
              <div key={etf.ticker} style={{ background: "white", border: `1.5px solid ${etf.color}33`, borderRadius: 14, padding: "20px 24px", boxShadow: "var(--shadow)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${etf.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "DM Mono", fontSize: 13, color: etf.color, fontWeight: 600 }}>{etf.ticker}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 16, color: "var(--text)", marginBottom: 3 }}>{etf.name}</div>
                    <div style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)" }}>{etf.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { l: "10Y CAGR", v: etf.cagr, c: "var(--green)" },
                    { l: "Expense", v: etf.expense, c: "var(--text)" },
                    { l: "Risk", v: etf.risk, c: etf.risk === "Low" ? "var(--green)" : "var(--gold)" },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "DM Mono", fontSize: 10, color: "var(--muted2)", marginBottom: 3 }}>{s.l}</div>
                      <div style={{ fontFamily: "DM Mono", fontSize: 14, fontWeight: 600, color: s.c }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How ETFs work */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 12 }}>
            How ETF investing actually works
          </h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.8, marginBottom: 36 }}>
            It's simpler than you think. Here's the full flow from zero to investor.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { n: "1", title: "Open a brokerage account", desc: "Sign up with one of the platforms below. Takes 10 minutes. Most require zero minimum balance.", color: "var(--green)" },
              { n: "2", title: "Fund your account", desc: "Transfer money from your bank. You can start with as little as $50. Set up auto-deposit so it happens monthly.", color: "var(--blue)" },
              { n: "3", title: "Buy your ETFs", desc: "Search the ticker symbol (e.g. VOO), enter the dollar amount, and hit buy. Done. You're now an investor.", color: "var(--gold)" },
              { n: "4", title: "Hold and repeat", desc: "Buy the same amount every month regardless of market conditions. This is called dollar-cost averaging — it's the most proven strategy for long-term wealth.", color: "#8b5cf6" },
            ].map(s => (
              <div key={s.n} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 24, boxShadow: "var(--shadow)" }}>
                <div style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 44, color: "var(--border2)", lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
                <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{s.desc}</div>
                <div style={{ marginTop: 16, height: 3, width: 40, background: s.color, borderRadius: 2 }} />
              </div>
            ))}
          </div>
        </section>

        {/* Platforms */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 12 }}>
            Where to buy ETFs
          </h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 17, color: "var(--muted)", lineHeight: 1.8, marginBottom: 36 }}>
            These are the platforms we recommend. All are regulated, trusted and offer commission-free ETF trading.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
            {PLATFORMS.map(p => (
              <div key={p.name} style={{ background: "white", border: `1.5px solid ${p.border}`, borderRadius: 16, padding: 24, boxShadow: "var(--shadow)" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: p.bg, border: `1px solid ${p.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {p.logo}
                    </div>
                    <div>
                      <div style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{p.name}</div>
                      <div style={{ fontFamily: "DM Mono", fontSize: 10, color: p.color, marginTop: 2 }}>{p.best}</div>
                    </div>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" style={{ fontFamily: "DM Mono", fontSize: 10, color: "var(--muted2)", padding: "5px 10px", border: "1px solid var(--border)", borderRadius: 6 }}>
                    Visit ↗
                  </a>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { l: "Min. Investment", v: p.minInvestment },
                    { l: "Trading Fees", v: p.fees },
                  ].map(s => (
                    <div key={s.l} style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontFamily: "DM Mono", fontSize: 9, color: "var(--muted2)", marginBottom: 4 }}>{s.l}</div>
                      <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                {/* Pros */}
                <div style={{ marginBottom: 12 }}>
                  {p.pros.map(pro => (
                    <div key={pro} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "var(--green)", fontSize: 12, flexShrink: 0 }}>✓</span>
                      <span style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)" }}>{pro}</span>
                    </div>
                  ))}
                </div>

                {/* Cons */}
                <div>
                  {p.cons.map(con => (
                    <div key={con} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "var(--muted2)", fontSize: 12, flexShrink: 0 }}>–</span>
                      <span style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted2)" }}>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "DM Mono", fontSize: 11, color: "var(--muted2)", marginTop: 16, textAlign: "center" }}>
            ETF.PLAN may receive affiliate commissions if you sign up through links on this page, at no extra cost to you. This does not affect our recommendations.
          </p>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 36 }}>
            Frequently asked questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map(faq => (
              <div key={faq.q} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 14, padding: "22px 24px", boxShadow: "var(--shadow)" }}>
                <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 16, color: "var(--text)", marginBottom: 10 }}>{faq.q}</div>
                <div style={{ fontFamily: "DM Sans", fontSize: 14, color: "var(--muted)", lineHeight: 1.75 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "var(--text)", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "clamp(28px,5vw,44px)", color: "white", marginBottom: 16, letterSpacing: "-0.5px" }}>
            Ready to start your first plan?
          </h2>
          <p style={{ fontFamily: "DM Sans", fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px" }}>
            ETF.PLAN builds you a personalised monthly investment plan based on real market data. Free to start. No experience needed.
          </p>
          <Link href="/login?mode=signup" style={{ display: "inline-block", fontFamily: "DM Sans", fontWeight: 600, fontSize: 16, color: "white", background: "var(--green)", padding: "15px 36px", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,185,107,0.4)" }}>
            Build My Free Plan →
          </Link>
          <div style={{ marginTop: 16, fontFamily: "DM Mono", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            Not financial advice. Past performance does not guarantee future results.
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <Link href="/" className="pixel" style={{ fontSize: 10, color: "var(--text)" }}>ETF<span style={{ color: "var(--green)" }}>.</span>PLAN</Link>
          <a href="https://www.instagram.com/etfplan/" target="_blank" rel="noreferrer" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", textDecoration:"none" }}>@etfplan</a>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap:"wrap", alignItems:"center" }}>
          <Link href="/" style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)" }}>Home</Link>
          <Link href="/learn" style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--green)" }}>Learn</Link>
          <Link href="/guide/what-are-etfs" style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)" }}>Guides</Link>
          <Link href="/privacy" style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)" }}>Privacy</Link>
          <Link href="/terms" style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)" }}>Terms</Link>
          <Link href="/login" style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--muted)" }}>Log in</Link>
          <Link href="/login?mode=signup" style={{ fontFamily: "DM Sans", fontSize: 13, color: "var(--green)", fontWeight:500 }}>Start free →</Link>
        </div>
      </footer>

    </div>
  );
}
