import Link from "next/link";

export const metadata = {
  title: "Best Platforms to Buy ETFs in 2026 — Robinhood, eToro, IBKR | ETF.PLAN",
  description: "Where to buy ETFs in 2026. Honest comparison of Robinhood, eToro, Interactive Brokers, and Vanguard. All free, all commission-free for ETFs. Pick the right one for you.",
  openGraph: {
    title: "Best Platforms to Buy ETFs in 2026",
    description: "Honest comparison of the top free ETF brokers — Robinhood, eToro, IBKR, Vanguard.",
  },
};

export default function Platforms() {
  const P = ({ children, style={} }) => <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"var(--muted)", lineHeight:1.85, marginBottom:14, ...style }}>{children}</p>;
  const H2 = ({ children }) => <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(19px,3vw,24px)", color:"var(--text)", marginBottom:14, letterSpacing:"-0.3px", lineHeight:1.25 }}>{children}</h2>;
  const Card = ({ children, bg="white", border=true }) => <div style={{ background:bg, border:border?"1px solid var(--border)":"none", borderRadius:16, padding:"clamp(20px,3vw,32px)", marginBottom:20, boxShadow:bg==="white"?"var(--shadow)":"none" }}>{children}</div>;

  const platforms = [
    {
      name:"Robinhood", emoji:"🟢", color:"#00c805",
      tagline:"Best for US beginners — simplest interface",
      good:["No account minimum","Fractional shares from $1","Clean, dead-simple mobile app","Instant deposits","Free options too"],
      bad:["US only","Customer support is slow","Limited research tools","No retirement accounts (IRA) on free tier"],
      etfs:"All major US ETFs (VOO, VTI, QQQ, SCHD, BND, VGT, TQQQ, ARKK)",
      minDeposit:"$0",
      fractional:"✅ Yes, from $1",
      countries:"🇺🇸 US only",
      verdict:"Start here if you're in the US and want the simplest possible experience.",
    },
    {
      name:"eToro", emoji:"🔵", color:"#0066dc",
      tagline:"Best for international users and social features",
      good:["Available in 100+ countries","Copy-trading feature","Fractional shares","Clean mobile and desktop","Crypto too if you want it"],
      bad:["$5 withdrawal fee","Wider spreads than IBKR","USD-denominated even for non-US users (FX fees)","Not ideal for large portfolios"],
      etfs:"Most major ETFs including VOO, QQQ, VTI, SCHD, VGT, ARKK",
      minDeposit:"$50",
      fractional:"✅ Yes",
      countries:"🌍 100+ countries (not US)",
      verdict:"Best option if you're outside the US. Easy to set up, mobile-first.",
    },
    {
      name:"Interactive Brokers", emoji:"⚫", color:"#1a1a2e",
      tagline:"Best for serious investors and non-US users who want full access",
      good:["Access to global markets","Lowest margin rates","Best for large portfolios","IBKR Lite: commission-free US ETFs","Available almost everywhere"],
      bad:["More complex interface","Less beginner-friendly","Can feel overwhelming at first"],
      etfs:"All US ETFs + global ETFs. Full access.",
      minDeposit:"$0",
      fractional:"✅ Yes (IBKR Lite)",
      countries:"🌍 200+ countries",
      verdict:"Upgrade to this when your portfolio grows. More powerful but steeper learning curve.",
    },
    {
      name:"Vanguard", emoji:"🔴", color:"#c0392b",
      tagline:"Best for buy-and-hold Vanguard ETF investors",
      good:["No commission on Vanguard ETFs","Investor-owned structure (lower costs long term)","Great for VOO, VTI, BND, SCHD","Trusted for 50+ years"],
      bad:["US only","No fractional shares","Older, clunkier interface","Limited ETF selection beyond Vanguard funds"],
      etfs:"All Vanguard ETFs (VOO, VTI, BND, SCHD, VEA, etc.) free. Others may have fees.",
      minDeposit:"$0 (most ETFs)",
      fractional:"❌ No",
      countries:"🇺🇸 US only",
      verdict:"Ideal if your whole plan uses Vanguard ETFs and you're in it for the long haul.",
    },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,4vw,40px)", height:60, background:"rgba(248,248,245,0.96)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" className="pixel" style={{ fontSize:11, color:"var(--text)", textDecoration:"none" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</Link>
        <Link href="/login?mode=signup" style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:13, color:"white", background:"var(--green)", padding:"8px 18px", borderRadius:8, textDecoration:"none" }}>Start free →</Link>
      </nav>

      <div style={{ maxWidth:740, margin:"0 auto", padding:"clamp(32px,6vw,64px) clamp(16px,4vw,24px) 80px" }}>

        <div style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", marginBottom:24 }}>
          <Link href="/" style={{ color:"var(--muted2)", textDecoration:"none" }}>Home</Link>
          <span style={{ margin:"0 8px" }}>→</span>
          <span>Which platform to use</span>
        </div>

        <div style={{ marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
            <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>PLATFORM GUIDE · 5 MIN READ</span>
          </div>
          <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(32px,6vw,54px)", color:"var(--text)", letterSpacing:"-2px", lineHeight:1.05, marginBottom:16 }}>Where to buy your ETFs</h1>
          <P style={{ fontSize:"clamp(16px,2.5vw,19px)" }}>All four platforms below are free to open, commission-free for ETFs, and regulated. The right one depends on where you live and what matters to you.</P>
        </div>

        {/* Quick picker */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,32px)", marginBottom:20 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:16 }}>IN A HURRY? PICK BY SITUATION</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { situation:"I'm in the US and want the simplest app", rec:"→ Robinhood", color:"#00c805" },
              { situation:"I'm outside the US", rec:"→ eToro or IBKR", color:"#0066dc" },
              { situation:"I'm serious and want the most powerful platform", rec:"→ Interactive Brokers", color:"#c9a84c" },
              { situation:"I only want Vanguard ETFs (VOO, VTI, BND)", rec:"→ Vanguard", color:"#c0392b" },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"rgba(255,255,255,0.05)", borderRadius:10, flexWrap:"wrap", gap:8 }}>
                <span style={{ fontFamily:"DM Sans", fontSize:13, color:"rgba(255,255,255,0.65)" }}>{s.situation}</span>
                <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:13, color:s.color }}>{s.rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform cards */}
        {platforms.map((p,pi) => (
          <Card key={p.name}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:16 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span style={{ fontSize:24 }}>{p.emoji}</span>
                  <h2 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(20px,3vw,26px)", color:"var(--text)", margin:0 }}>{p.name}</h2>
                </div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)" }}>{p.tagline}</div>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontFamily:"DM Mono", fontSize:10, padding:"3px 10px", background:`${p.color}10`, border:`1px solid ${p.color}22`, borderRadius:6, color:p.color }}>Min: {p.minDeposit}</span>
                <span style={{ fontFamily:"DM Mono", fontSize:10, padding:"3px 10px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:6, color:"var(--muted)" }}>{p.countries}</span>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:"DM Mono", fontSize:9, color:"var(--green)", marginBottom:8, letterSpacing:1 }}>PROS</div>
                {p.good.map((g,i) => <div key={i} style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", marginBottom:4, lineHeight:1.5 }}>✅ {g}</div>)}
              </div>
              <div>
                <div style={{ fontFamily:"DM Mono", fontSize:9, color:"#ff4757", marginBottom:8, letterSpacing:1 }}>CONS</div>
                {p.bad.map((b,i) => <div key={i} style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", marginBottom:4, lineHeight:1.5 }}>⚠️ {b}</div>)}
              </div>
            </div>

            <div style={{ padding:"10px 14px", background:"var(--bg3)", borderRadius:8, border:"1px solid var(--border)", marginBottom:10 }}>
              <span style={{ fontFamily:"DM Mono", fontSize:9, color:"var(--muted2)", marginRight:8, letterSpacing:1 }}>ETFS AVAILABLE:</span>
              <span style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)" }}>{p.etfs}</span>
            </div>

            <div style={{ padding:"10px 14px", background:"rgba(0,185,107,0.06)", borderRadius:8, border:"1px solid rgba(0,185,107,0.15)" }}>
              <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--text)", fontWeight:500 }}>💡 {p.verdict}</span>
            </div>
          </Card>
        ))}

        {/* How to buy step by step */}
        <Card>
          <H2>How to buy an ETF — step by step (Robinhood example)</H2>
          <P>Once you have an account, here's exactly what to do. This takes about 5 minutes:</P>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { n:"1", t:"Open the app and tap 'Search'", d:"Type the ticker symbol — e.g. 'VOO' for Vanguard S&P 500 ETF. You'll see the ETF with its current price and chart." },
              { n:"2", t:"Tap 'Buy'", d:"On Robinhood, tap the green Buy button. On eToro, tap the Trade button." },
              { n:"3", t:"Enter the dollar amount (not shares)", d:"Select 'Invest in dollars' and type your amount — e.g. $40. Most platforms support fractional shares so you don't need to buy a whole share." },
              { n:"4", t:"Review and confirm", d:"Check the order summary. The execution price may vary slightly from the displayed price (normal — this is called slippage, usually a few cents)." },
              { n:"5", t:"Repeat for each ETF in your plan", d:"For your balanced plan: buy VOO ($40), VTI ($25), QQQ ($25), SCHD ($10). Done in 10 minutes." },
              { n:"6", t:"Come back to ETF.PLAN and mark as bought", d:"Once purchased, go to your dashboard and click 'Mark as bought'. This starts tracking your real portfolio gains from your actual entry prices." },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", gap:14, padding:"14px 16px", background:"var(--bg3)", borderRadius:12, border:"1px solid var(--border)" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontFamily:"DM Mono", fontSize:12, color:"white", fontWeight:700 }}>{s.n}</span>
                </div>
                <div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:4 }}>{s.t}</div>
                  <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <Card>
          <H2>Common questions about ETF platforms</H2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { q:"Is my money safe on these platforms?", a:"All four platforms are regulated by financial authorities (SEC in the US, FCA in the UK, CySEC in Europe). Your funds are typically insured up to $500,000 (SIPC in the US) or equivalent in other jurisdictions. They don't take your money — they hold it in your name." },
              { q:"Do I need to pay tax on ETF gains?", a:"Yes — capital gains tax applies when you sell. The rate depends on your country and holding period. This is separate from the broker — they just execute trades, you handle taxes. Consult a tax advisor." },
              { q:"Can I use multiple platforms?", a:"Yes. Some investors split between platforms for diversification or to access different markets. But for simplicity, pick one and stick with it when starting out." },
              { q:"What about Fidelity, Charles Schwab, or TD Ameritrade?", a:"All excellent US options, especially for retirement accounts (IRA/401k). Fidelity and Schwab have zero-expense-ratio index funds. For pure ETF investing, any of these work — the key is just to start." },
              { q:"I'm not in the US or Europe — what do I use?", a:"Interactive Brokers is available in 200+ countries and is the most globally accessible. eToro is also available in many markets. Check their websites to confirm your country is supported." },
            ].map((faq,i) => (
              <div key={i} style={{ padding:"14px 16px", background:"var(--bg3)", borderRadius:10, border:"1px solid var(--border)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:6 }}>{faq.q}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.75 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,32px)", marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🏦</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,26px)", color:"white", marginBottom:12, letterSpacing:"-0.5px" }}>Get your ETF picks first</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:480, margin:"0 auto 24px" }}>ETF.PLAN tells you exactly which ETFs to buy each month and how much. Open your broker, follow the picks. Free plan.</p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:"white", background:"var(--green)", padding:"13px 28px", borderRadius:10, textDecoration:"none", boxShadow:"0 4px 16px rgba(0,185,107,0.3)" }}>Get my ETF plan free →</Link>
        </div>

        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:16 }}>Continue reading</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))", gap:12 }}>
          {[
            { title:"What are ETFs?", desc:"New to investing? Start here.", href:"/guide/what-are-etfs", color:"#00b96b", icon:"🧭" },
            { title:"Pick your risk level", desc:"Conservative, Balanced or Aggressive?", href:"/guide/risk-levels", color:"#3b82f6", icon:"⚖️" },
            { title:"Dollar-cost averaging", desc:"Why monthly investing beats timing the market.", href:"/guide/dollar-cost-averaging", color:"#8b5cf6", icon:"📈" },
          ].map(n => (
            <Link key={n.title} href={n.href} style={{ display:"block", textDecoration:"none", background:"white", border:`1.5px solid ${n.color}22`, borderRadius:12, padding:"18px", boxShadow:"var(--shadow)" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{n.icon}</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:4 }}>{n.title}</div>
              <div style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", marginBottom:10, lineHeight:1.5 }}>{n.desc}</div>
              <div style={{ fontFamily:"DM Mono", fontSize:10, color:n.color }}>Read guide →</div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
