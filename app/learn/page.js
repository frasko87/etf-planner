import Link from "next/link";

export const metadata = {
  title: "What Are ETFs? The Beginner's Guide to ETF Investing | ETF.PLAN",
  description: "Learn what ETFs are, why they beat savings accounts, and how to start investing with $50/month. Plain English guide for first-time investors. Includes top ETFs, platforms and a step-by-step plan.",
  keywords: "what are ETFs, ETF investing beginners, best ETFs 2025, how to start investing, S&P 500 ETF explained, index fund vs ETF, passive investing guide, VOO VTI QQQ explained, ETF vs savings account",
  openGraph: {
    title: "What Are ETFs? The Beginner's Guide to ETF Investing",
    description: "Everything you need to know about ETFs — in plain English. Why they work, which ones to buy, and how to start with $50/month.",
    type: "article",
  },
};

const NAV_LINKS = [
  { href:"/",        label:"Home"         },
  { href:"/learn",   label:"What are ETFs?", active:true },
  { href:"/login",   label:"Log in"       },
];

const PLATFORMS = [
  {
    name:"Robinhood", color:"#00c805", bg:"rgba(0,200,5,0.06)", border:"rgba(0,200,5,0.2)",
    icon:"🟢", best:"Best for beginners", min:"$1", fees:"Commission-free",
    pros:["No account minimum","Commission-free trades","Fractional shares","Clean mobile app"],
    cons:["Limited research tools","No retirement accounts on basic plan"],
    url:"https://robinhood.com",
  },
  {
    name:"Interactive Brokers", color:"#0066cc", bg:"rgba(0,102,204,0.06)", border:"rgba(0,102,204,0.2)",
    icon:"🔵", best:"Best for serious investors", min:"$0", fees:"From $0",
    pros:["Access to global markets","Advanced tools","Low margin rates","IBKR Lite is free"],
    cons:["Interface can be complex","Better for active traders"],
    url:"https://www.interactivebrokers.com",
  },
  {
    name:"eToro", color:"#2196a0", bg:"rgba(33,150,160,0.06)", border:"rgba(33,150,160,0.2)",
    icon:"🟤", best:"Best for social investing", min:"$10", fees:"Commission-free ETFs",
    pros:["Copy top investors automatically","Social trading features","Fractional ETFs","Easy to use"],
    cons:["Withdrawal fee ($5)","Spread on some assets"],
    url:"https://www.etoro.com",
  },
  {
    name:"Vanguard", color:"#8b0000", bg:"rgba(139,0,0,0.06)", border:"rgba(139,0,0,0.2)",
    icon:"🔴", best:"Best for long-term investors", min:"$1", fees:"Commission-free Vanguard ETFs",
    pros:["Lowest expense ratios in the industry","Owned by its investors","VTI, VOO, SCHD direct","Trusted 50+ years"],
    cons:["Older interface","Less suited for active trading"],
    url:"https://investor.vanguard.com",
  },
];

const TOP_ETFS = [
  { ticker:"VTI",  name:"Vanguard Total Stock Market", color:"#00b96b", desc:"The entire US market. 3,700+ companies in one fund.", cagr:"13.5%", expense:"0.03%", risk:"Low"    },
  { ticker:"VOO",  name:"Vanguard S&P 500",            color:"#3b82f6", desc:"The 500 biggest US companies. The gold standard.",    cagr:"13.2%", expense:"0.03%", risk:"Low"    },
  { ticker:"BND",  name:"Vanguard Total Bond Market",  color:"#64748b", desc:"US investment-grade bonds. Portfolio anchor for ~5%.", cagr:"4.8%",  expense:"0.03%", risk:"Very Low"},
  { ticker:"QQQ",  name:"Invesco Nasdaq-100",          color:"#8b5cf6", desc:"Top 100 tech & growth companies. High upside.",        cagr:"18.0%", expense:"0.20%", risk:"Medium" },
  { ticker:"SCHD", name:"Schwab US Dividend Equity",   color:"#c9a84c", desc:"Consistent dividend payers. Income + growth.",         cagr:"12.0%", expense:"0.06%", risk:"Low"    },
];

const PAIN_POINTS = [
  { icon:"🧭", q:"\"I don't know where to start\"",
    a:"That's exactly why ETFs exist. Instead of picking individual stocks, you buy a fund that holds hundreds at once. One purchase, instant diversification. ETF.PLAN tells you exactly which ones to buy each month and in what amounts." },
  { icon:"⏰", q:"\"I don't have time to manage investments\"",
    a:"ETFs are the ultimate set-and-forget investment. You buy once a month, hold. No daily monitoring, no earnings calls, no panic selling. Our engine scores 42 ETFs daily — you just follow the monthly plan." },
  { icon:"💰", q:"I want my savings to actually grow",
    a:"A high-yield savings account pays 4–5% annually. The S&P 500 has averaged 10–13% per year over the last decade. $100/month invested at 12% for 10 years becomes over $23,000. A savings account gets you $14,000. The math is clear." },
];

const FAQS = [
  { q:"Are ETFs safe for beginners?",
    a:"ETFs are widely considered one of the safest ways to invest. Because they hold hundreds or thousands of stocks, no single company failure can wipe out your investment. The S&P 500 has never had a 20-year period with a negative return." },
  { q:"How much money do I need to start?",
    a:"Most brokers let you start with as little as $1 using fractional shares. ETF.PLAN is built around $50, $100 or $150/month — realistic amounts for most people starting out." },
  { q:"What's the difference between an ETF and a mutual fund?",
    a:"ETFs trade on the stock market like shares — buy and sell any time during market hours. Mutual funds only trade once a day at closing price. ETFs also have lower fees and are more tax-efficient." },
  { q:"Do ETFs pay dividends?",
    a:"Many do. Dividend ETFs like SCHD are specifically designed to hold companies that pay regular dividends, giving you passive income on top of price appreciation." },
  { q:"Can I lose all my money in ETFs?",
    a:"To lose everything in a broad market ETF like VTI or VOO, every major US company would have to go bankrupt simultaneously — which has never happened. Leveraged ETFs carry more risk, which is why we clearly label them." },
  { q:"How do I actually buy an ETF?",
    a:"Open a brokerage account (5 minutes), fund it from your bank, search the ticker symbol (e.g. VOO), enter the dollar amount, click buy. You're now an investor. ETF.PLAN tells you exactly which ticker to buy each month." },
];

const s = { section:{ padding:"0 clamp(16px,4vw,20px)", maxWidth:860, margin:"0 auto" } };

export default function LearnPage() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>

      {/* ── Nav ── */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,4vw,40px)", height:60, background:"rgba(248,248,245,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" className="pixel" style={{ fontSize:11, color:"var(--text)" }}>
          ETF<span style={{ color:"var(--green)" }}>.</span>PLAN
        </Link>
        <div style={{ display:"flex", gap:"clamp(4px,2vw,20px)", alignItems:"center" }}>
          {NAV_LINKS.map(l=>(
            <Link key={l.href} href={l.href} style={{ fontFamily:"DM Sans", fontSize:14, color: l.active ? "var(--green)" : "var(--muted)", fontWeight: l.active ? 600 : 400, padding:"8px 4px" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/login?mode=signup" style={{ fontFamily:"DM Sans", fontWeight:500, fontSize:13, color:"white", background:"var(--green)", padding:"9px clamp(10px,2vw,18px)", borderRadius:8, display:"none" }}>
            Start free
          </Link>
          <Link href="/login?mode=signup" style={{ fontFamily:"DM Sans", fontWeight:500, fontSize:13, color:"white", background:"var(--green)", padding:"9px clamp(10px,2vw,18px)", borderRadius:8 }}>
            Start free
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"0 clamp(16px,4vw,24px) 80px" }}>

        {/* ── Hero ── */}
        <section style={{ padding:"clamp(48px,7vw,80px) 0 clamp(36px,5vw,56px)", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.25)", borderRadius:100, padding:"6px 16px", marginBottom:24 }}>
            <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>BEGINNER'S GUIDE · ETF INVESTING 101</span>
          </div>
          <h1 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(30px,6vw,56px)", color:"var(--text)", lineHeight:1.1, letterSpacing:"-1.5px", marginBottom:20 }}>
            What Are ETFs?<br/>
            <span style={{ color:"var(--green)" }}>The Smartest First Investment</span><br/>
            You Can Make Today
          </h1>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(15px,2.5vw,18px)", color:"var(--muted)", lineHeight:1.8, maxWidth:560, margin:"0 auto 32px" }}>
            You don't need to pick stocks, time the market, or watch financial news every day. ETFs let you invest in hundreds of companies at once — starting from $50/month.
          </p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:600, fontSize:16, color:"white", background:"var(--green)", padding:"14px 32px", borderRadius:12, boxShadow:"0 4px 20px rgba(0,185,107,0.3)" }}>
            Build my free plan →
          </Link>
        </section>

        {/* ── What is an ETF ── */}
        <section style={{ marginBottom:"clamp(48px,7vw,72px)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,38px)", color:"var(--text)", letterSpacing:"-0.5px", marginBottom:20 }}>
            So, what exactly is an ETF?
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,17px)", color:"var(--muted)", lineHeight:1.9, marginBottom:16 }}>
            An <strong style={{ color:"var(--text)" }}>ETF (Exchange-Traded Fund)</strong> is a basket of investments — stocks, bonds or commodities — that trades on the stock market like a regular share. When you buy one share of <strong style={{ color:"var(--text)" }}>VTI</strong>, you instantly own a tiny piece of over 3,700 US companies including Apple, Microsoft, Amazon and thousands more.
          </p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,17px)", color:"var(--muted)", lineHeight:1.9, marginBottom:16 }}>
            Think of it this way: instead of betting on one horse, you buy a share of every horse in the race. Some will lose — but collectively, they almost always win over time.
          </p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,17px)", color:"var(--muted)", lineHeight:1.9 }}>
            The best part? ETFs are <strong style={{ color:"var(--text)" }}>passive</strong>. They simply track an index like the S&P 500. No expensive fund manager making decisions — just the market doing what it's done for 100+ years: growing.
          </p>
        </section>

        {/* ── Pain points ── */}
        <section style={{ marginBottom:"clamp(48px,7vw,72px)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,38px)", color:"var(--text)", letterSpacing:"-0.5px", marginBottom:12 }}>
            Sound familiar?
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:16, color:"var(--muted)", lineHeight:1.8, marginBottom:28 }}>
            These are the most common reasons people delay investing. Here's the truth about each one.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {PAIN_POINTS.map(p=>(
              <div key={p.q} style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px) clamp(16px,3vw,32px)", boxShadow:"var(--shadow)" }}>
                <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <span style={{ fontSize:26, flexShrink:0 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(15px,2.5vw,18px)", color:"var(--text)", marginBottom:10 }}>{p.q}</div>
                    <div style={{ fontFamily:"DM Sans", fontSize:"clamp(13px,2vw,15px)", color:"var(--muted)", lineHeight:1.8 }}>{p.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ETFs vs savings ── */}
        <section style={{ marginBottom:"clamp(48px,7vw,72px)", background:"var(--text)", borderRadius:20, padding:"clamp(32px,5vw,48px) clamp(20px,4vw,40px)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(22px,4vw,34px)", color:"white", letterSpacing:"-0.5px", marginBottom:14 }}>
            $100/month: ETFs vs Savings Account
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:14, color:"rgba(255,255,255,0.5)", marginBottom:28, lineHeight:1.7 }}>
            Same amount invested. Very different outcomes over time.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,240px),1fr))", gap:14 }}>
            {[
              { label:"High-yield savings (4.5%)", vals:[{t:"1 year",v:"$1,230"},{t:"5 years",v:"$6,642"},{t:"10 years",v:"$15,103"}], color:"rgba(255,255,255,0.35)", bg:"rgba(255,255,255,0.04)" },
              { label:"Balanced ETF portfolio (9%)", vals:[{t:"1 year",v:"$1,256"},{t:"5 years",v:"$7,597"},{t:"10 years",v:"$19,351"}], color:"#00ff88", bg:"rgba(0,255,136,0.06)" },
            ].map(col=>(
              <div key={col.label} style={{ background:col.bg, borderRadius:12, padding:"clamp(18px,3vw,24px) clamp(14px,2vw,20px)", border:`1px solid ${col.color}33` }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:col.color, marginBottom:18 }}>{col.label}</div>
                {col.vals.map(v=>(
                  <div key={v.t} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                    <span className="mono" style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{v.t}</span>
                    <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:20, color:col.color }}>{v.v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:14 }}>
            Based on historical averages. Past performance does not guarantee future results.
          </p>
        </section>

        {/* ── Top ETFs ── */}
        <section style={{ marginBottom:"clamp(48px,7vw,72px)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,38px)", color:"var(--text)", letterSpacing:"-0.5px", marginBottom:12 }}>
            The ETFs we track and why they matter
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:16, color:"var(--muted)", lineHeight:1.8, marginBottom:28 }}>
            These are the most widely held, most trusted ETFs in the world — vetted by millions of investors and institutions.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {TOP_ETFS.map(etf=>(
              <div key={etf.ticker} style={{ background:"white", border:`1.5px solid ${etf.color}33`, borderRadius:14, padding:"clamp(16px,2.5vw,20px) clamp(14px,2.5vw,24px)", boxShadow:"var(--shadow)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${etf.color}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span className="mono" style={{ fontSize:12, color:etf.color, fontWeight:600 }}>{etf.ticker}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:2 }}>{etf.name}</div>
                    <div style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)" }}>{etf.desc}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:clamp(12,20), flexWrap:"wrap" }}>
                  {[{l:"10Y CAGR",v:etf.cagr,c:"var(--green)"},{l:"Expense",v:etf.expense,c:"var(--text)"},{l:"Risk",v:etf.risk,c:etf.risk==="Low"||etf.risk==="Very Low"?"var(--green)":"var(--gold)"}].map(s=>(
                    <div key={s.l} style={{ textAlign:"right" }}>
                      <div className="mono" style={{ fontSize:9, color:"var(--muted2)", marginBottom:2 }}>{s.l}</div>
                      <div className="mono" style={{ fontSize:14, fontWeight:600, color:s.c }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ marginBottom:"clamp(48px,7vw,72px)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,38px)", color:"var(--text)", letterSpacing:"-0.5px", marginBottom:12 }}>
            How ETF investing actually works
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:16, color:"var(--muted)", lineHeight:1.8, marginBottom:28 }}>
            From zero to investor in four simple steps.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))", gap:14 }}>
            {[
              {n:"1",title:"Open a brokerage account",desc:"Sign up with one of the platforms below. Takes 10 minutes. Zero minimum balance.",color:"var(--green)"},
              {n:"2",title:"Fund your account",desc:"Transfer money from your bank. Start with $50. Set up auto-deposit monthly.",color:"#3b82f6"},
              {n:"3",title:"Buy your ETFs",desc:"Search the ticker (e.g. VOO), enter the amount, click buy. You're an investor.",color:"var(--gold)"},
              {n:"4",title:"Hold and repeat",desc:"Buy the same amount every month. This is dollar-cost averaging — the most proven long-term strategy.",color:"#8b5cf6"},
            ].map(s=>(
              <div key={s.n} style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(18px,3vw,24px)", boxShadow:"var(--shadow)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:44, color:"var(--border2)", lineHeight:1, marginBottom:12 }}>{s.n}</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:8 }}>{s.title}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{s.desc}</div>
                <div style={{ marginTop:14, height:3, width:36, background:s.color, borderRadius:2 }}/>
              </div>
            ))}
          </div>
        </section>

        {/* ── Platforms ── */}
        <section style={{ marginBottom:"clamp(48px,7vw,72px)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,38px)", color:"var(--text)", letterSpacing:"-0.5px", marginBottom:12 }}>
            Where to buy ETFs
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:16, color:"var(--muted)", lineHeight:1.8, marginBottom:28 }}>
            All regulated, trusted, and commission-free for ETF trading.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,340px),1fr))", gap:14 }}>
            {PLATFORMS.map(p=>(
              <div key={p.name} style={{ background:"white", border:`1.5px solid ${p.border}`, borderRadius:16, padding:"clamp(18px,3vw,24px)", boxShadow:"var(--shadow)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:p.bg, border:`1px solid ${p.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{p.icon}</div>
                    <div>
                      <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:17, color:"var(--text)" }}>{p.name}</div>
                      <div className="mono" style={{ fontSize:10, color:p.color, marginTop:2 }}>{p.best}</div>
                    </div>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", padding:"5px 10px", border:"1px solid var(--border)", borderRadius:6, whiteSpace:"nowrap" }}>Visit ↗</a>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                  {[{l:"Min. Investment",v:p.min},{l:"Trading Fees",v:p.fees}].map(s=>(
                    <div key={s.l} style={{ background:"var(--bg3)", borderRadius:8, padding:"10px 12px" }}>
                      <div className="mono" style={{ fontSize:9, color:"var(--muted2)", marginBottom:3 }}>{s.l}</div>
                      <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:13, color:"var(--text)" }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                {p.pros.map(pro=>(
                  <div key={pro} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <span style={{ color:"var(--green)", fontSize:11, flexShrink:0 }}>✓</span>
                    <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)" }}>{pro}</span>
                  </div>
                ))}
                {p.cons.map(con=>(
                  <div key={con} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <span style={{ color:"var(--muted2)", fontSize:11, flexShrink:0 }}>–</span>
                    <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted2)" }}>{con}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize:11, color:"var(--muted2)", marginTop:14, textAlign:"center" }}>
            ETF.PLAN is not affiliated with any platform. No commissions received.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section style={{ marginBottom:"clamp(48px,7vw,72px)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,38px)", color:"var(--text)", letterSpacing:"-0.5px", marginBottom:28 }}>
            Frequently asked questions
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {FAQS.map(faq=>(
              <div key={faq.q} style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, padding:"clamp(18px,3vw,22px) clamp(16px,3vw,24px)", boxShadow:"var(--shadow)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:"clamp(14px,2vw,16px)", color:"var(--text)", marginBottom:10 }}>{faq.q}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:"clamp(13px,2vw,14px)", color:"var(--muted)", lineHeight:1.8 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background:"var(--text)", borderRadius:20, padding:"clamp(40px,6vw,56px) clamp(24px,5vw,40px)", textAlign:"center" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,40px)", color:"white", marginBottom:14, letterSpacing:"-0.5px" }}>
            Ready to start your first plan?
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:15, color:"rgba(255,255,255,0.55)", marginBottom:28, lineHeight:1.7, maxWidth:440, margin:"0 auto 28px" }}>
            ETF.PLAN builds you a personalised monthly investment plan based on real market data. Free to start. No experience needed.
          </p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:600, fontSize:16, color:"white", background:"var(--green)", padding:"15px 36px", borderRadius:12, boxShadow:"0 4px 20px rgba(0,185,107,0.4)" }}>
            Build my free plan →
          </Link>
          <p className="mono" style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:14 }}>
            Not financial advice · Past performance ≠ future results
          </p>
        </section>

      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"24px clamp(16px,4vw,40px)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <Link href="/" className="pixel" style={{ fontSize:10, color:"var(--text)" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</Link>
        <div style={{ display:"flex", gap:clamp(12,20), flexWrap:"wrap" }}>
          <Link href="/"      style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)" }}>Home</Link>
          <Link href="/learn" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--green)", fontWeight:500 }}>What are ETFs?</Link>
          <Link href="/login" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)" }}>Log in</Link>
          <Link href="/login?mode=signup" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--green)", fontWeight:500 }}>Start free →</Link>
        </div>
      </footer>

    </div>
  );
}

// Fix clamp usage in JS (not CSS)
function clamp(min, max) {
  return `clamp(${min}px, 2vw, ${max}px)`;
}
