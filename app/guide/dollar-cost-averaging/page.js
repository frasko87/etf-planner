import Link from "next/link";

export const metadata = {
  title: "Dollar-Cost Averaging: The Strategy That Beats Timing the Market | ETF.PLAN",
  description: "Dollar-cost averaging explained. Why investing $100 every month beats trying to time the market — backed by 50 years of data. Simple strategy, powerful results.",
  openGraph: {
    title: "Dollar-Cost Averaging: Why You Should Never Try to Time the Market",
    description: "Invest the same amount every month. That's the whole strategy. Here's why it works.",
  },
};

export default function DollarCostAveraging() {
  const P = ({ children, style={} }) => <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"var(--muted)", lineHeight:1.85, marginBottom:14, ...style }}>{children}</p>;
  const H2 = ({ children }) => <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(19px,3vw,24px)", color:"var(--text)", marginBottom:14, letterSpacing:"-0.3px", lineHeight:1.25 }}>{children}</h2>;
  const Card = ({ children, bg="white", border=true }) => <div style={{ background:bg, border:border?"1px solid var(--border)":"none", borderRadius:16, padding:"clamp(20px,3vw,32px)", marginBottom:20, boxShadow:bg==="white"?"var(--shadow)":"none" }}>{children}</div>;

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
          <span>Dollar-cost averaging</span>
        </div>

        <div style={{ marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
            <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>STRATEGY GUIDE · 5 MIN READ</span>
          </div>
          <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(32px,6vw,54px)", color:"var(--text)", letterSpacing:"-2px", lineHeight:1.05, marginBottom:16 }}>Why you should never try to time the market</h1>
          <P style={{ fontSize:"clamp(16px,2.5vw,19px)" }}>Dollar-cost averaging is the strategy of investing the same fixed amount every single month — regardless of whether the market is up, down, or sideways. It sounds boring. It's also why it works.</P>
        </div>

        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,36px)", marginBottom:20 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:12 }}>THE CORE IDEA</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,28px)", color:"white", marginBottom:14, letterSpacing:"-0.5px" }}>Stop trying to find the perfect moment. There isn't one.</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.85, marginBottom:14 }}>Most people wait for the "right time" to invest. They wait for the market to drop, or for the news to get better, or for their situation to feel more stable. Years pass. They never start.</p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.85, marginBottom:0 }}>Dollar-cost averaging eliminates this problem entirely. <strong style={{ color:"white" }}>You invest every month, no matter what.</strong> When prices are high, you buy less. When prices are low, you buy more. Over time, your average cost per share smooths out — and the compounding does the rest.</p>
        </div>

        <Card>
          <H2>How DCA works — a real example</H2>
          <P>Say you invest $100/month in VOO (S&P 500 ETF). Here's what happens in a volatile 6-month period:</P>
          <div style={{ overflowX:"auto", marginBottom:16 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--text)" }}>
                  {["Month","VOO Price","You invest","Shares bought","Total shares"].map(h => (
                    <th key={h} style={{ fontFamily:"DM Mono", fontSize:10, color:"rgba(255,255,255,0.5)", padding:"10px 12px", textAlign:"left", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { month:"January",  price:"$500", invest:"$100", shares:"0.20", total:"0.20", note:"" },
                  { month:"February", price:"$450", invest:"$100", shares:"0.22", total:"0.42", note:"📉 Market dips — you buy more" },
                  { month:"March",    price:"$400", invest:"$100", shares:"0.25", total:"0.67", note:"📉 Crash — you buy even more" },
                  { month:"April",    price:"$420", invest:"$100", shares:"0.24", total:"0.91", note:"🔄 Recovery starts" },
                  { month:"May",      price:"$480", invest:"$100", shares:"0.21", total:"1.12", note:"📈 Bouncing back" },
                  { month:"June",     price:"$520", invest:"$100", shares:"0.19", total:"1.31", note:"📈 New high" },
                ].map((row,i) => (
                  <tr key={i} style={{ background:i%2===0?"var(--bg3)":"white", borderBottom:"1px solid var(--border)" }}>
                    <td style={{ fontFamily:"DM Sans", fontSize:13, padding:"10px 12px", color:"var(--text)", fontWeight:500 }}>{row.month}</td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:"var(--muted)" }}>{row.price}</td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:"var(--green)", fontWeight:600 }}>{row.invest}</td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:"var(--muted)" }}>{row.shares}</td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:"var(--text)", fontWeight:600 }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ padding:"14px 16px", background:"var(--bg3)", borderRadius:10, border:"1px solid var(--border)" }}>
              <div style={{ fontFamily:"DM Mono", fontSize:9, color:"var(--muted2)", marginBottom:4, letterSpacing:1 }}>TOTAL INVESTED</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:22, color:"var(--text)" }}>$600</div>
            </div>
            <div style={{ padding:"14px 16px", background:"rgba(0,185,107,0.06)", borderRadius:10, border:"1px solid rgba(0,185,107,0.2)" }}>
              <div style={{ fontFamily:"DM Mono", fontSize:9, color:"var(--muted2)", marginBottom:4, letterSpacing:1 }}>PORTFOLIO VALUE (at $520)</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:22, color:"var(--green)" }}>$681 (+13.5%)</div>
            </div>
          </div>
          <P style={{ marginTop:14, marginBottom:0, fontSize:13 }}>Even though prices went DOWN in months 2 and 3, you ended up positive because those dips let you accumulate more shares at lower prices. The crash was actually good for you.</P>
        </Card>

        <Card>
          <H2>Why timing the market doesn't work</H2>
          <P>Everyone thinks they can spot the bottom. Even professional fund managers — paid millions to do exactly this — mostly fail.</P>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {[
              { icon:"📊", stat:"90%", desc:"of professional fund managers underperform the S&P 500 index over 10 years (SPIVA report, S&P Global)" },
              { icon:"💸", stat:"$1M+", desc:"that an average investor loses trying to time the market over a 30-year career, vs just investing consistently (Dalbar study)" },
              { icon:"📅", stat:"10 days", desc:"— missing just the 10 best days in the market over 20 years cuts your returns nearly in half. Most of those days happen during crashes, when people are selling, not buying." },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", gap:14, padding:"14px 16px", background:"var(--bg3)", borderRadius:12, border:"1px solid var(--border)" }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:20, color:"var(--green)", marginBottom:4 }}>{s.stat}</div>
                  <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <P>The only reliable strategy is to <strong style={{ color:"var(--text)" }}>not try to time the market</strong>. Invest consistently. Stay in. Let time do its work.</P>
        </Card>

        <Card>
          <H2>DCA vs lump sum: which wins?</H2>
          <P>Studies show lump sum investing (putting all your money in at once) outperforms DCA about 2/3 of the time — but only if you actually have a large sum to invest. For most people, DCA wins for two reasons:</P>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { title:"Most people don't have a lump sum", body:"If you're building wealth from your salary, you invest what you have each month. DCA isn't a choice — it's the only realistic option for most people starting out." },
              { title:"DCA removes emotion from the equation", body:"When the market drops 20%, most people panic and sell. DCA investors just keep buying. Removing the decision-making is itself a massive advantage." },
              { title:"DCA reduces timing risk", body:"If you invest your lump sum the day before a crash, you lose big. DCA spreads that risk across many months, smoothing out your average purchase price." },
            ].map((s,i) => (
              <div key={i} style={{ padding:"14px 16px", background:"var(--bg3)", borderRadius:10, border:"1px solid var(--border)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:6 }}>{s.title}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <H2>What $100/month looks like over time (DCA, 9% avg)</H2>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
            {[
              { yr:"1 year",  in:"$1,200",  val:"$1,260",  gain:"+$60",    note:"Small — but you've started" },
              { yr:"3 years", in:"$3,600",  val:"$4,146",  gain:"+$546",   note:"Covers your annual streaming bills" },
              { yr:"5 years", in:"$6,000",  val:"$7,599",  gain:"+$1,599", note:"Your phone bill paid every year passively" },
              { yr:"10 years",in:"$12,000", val:"$19,497", gain:"+$7,497", note:"Phone + car insurance every year, passively", hl:true },
              { yr:"20 years",in:"$24,000", val:"$67,290", gain:"+$43,290",note:"$500+/month passive income — forever", hl:true },
            ].map((row,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"70px 1fr 1fr 1fr", gap:8, alignItems:"center", padding:"10px 12px", borderRadius:10, background:row.hl?"var(--text)":"var(--bg3)", border:row.hl?"none":"1px solid var(--border)" }}>
                <span style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:13, color:row.hl?"rgba(255,255,255,0.8)":"var(--text)" }}>{row.yr}</span>
                <span style={{ fontFamily:"DM Mono", fontSize:12, color:row.hl?"rgba(255,255,255,0.4)":"var(--muted2)" }}>{row.in} in</span>
                <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:14, color:row.hl?"white":"var(--text)" }}>{row.val}</span>
                <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:13, color:"var(--green)" }}>{row.gain}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:"12px 16px", background:"rgba(0,185,107,0.06)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:10 }}>
            <P style={{ margin:0, fontSize:13, color:"var(--text)" }}>💡 The gains accelerate over time because your returns generate their own returns. At year 10, your portfolio adds more value each year than the $1,200 you put in. <strong>Your money outworks you.</strong></P>
          </div>
        </Card>

        <Card>
          <H2>Common questions about DCA</H2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { q:"How often should I invest with DCA?", a:"Monthly is ideal for most people — it matches salary cycles and is frequent enough to smooth out volatility. ETF.PLAN is built around monthly investing: we tell you what to buy on the 1st of every month." },
              { q:"Should I stop investing when the market crashes?", a:"No — and this is the hardest part. When markets crash, DCA investors should actually feel good: they're buying more shares at lower prices. The worst thing you can do is stop or sell during a dip." },
              { q:"What if I invest more some months?", a:"That's fine. The core principle is consistency, not a fixed amount. If you can put in $200 one month and $100 the next, both are great. Just don't skip months entirely." },
              { q:"Does DCA work in a bear market?", a:"Yes — especially in a bear market. Each monthly investment buys more shares at lower prices. When the market recovers (historically, it always has), those extra shares multiply your gains." },
              { q:"How is this different from what ETF.PLAN does?", a:"ETF.PLAN implements DCA automatically. We score 42 ETFs daily, pick the best ones for your risk profile, and tell you exactly what to buy each month. You execute on your broker. We handle the strategy." },
            ].map((faq,i) => (
              <div key={i} style={{ padding:"14px 16px", background:"var(--bg3)", borderRadius:10, border:"1px solid var(--border)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:6 }}>{faq.q}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.75 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,32px)", marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📅</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,26px)", color:"white", marginBottom:12, letterSpacing:"-0.5px" }}>Start your monthly plan today</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:480, margin:"0 auto 24px" }}>ETF.PLAN tells you exactly what to buy each month. You invest, we track. Free forever.</p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:"white", background:"var(--green)", padding:"13px 28px", borderRadius:10, textDecoration:"none", boxShadow:"0 4px 16px rgba(0,185,107,0.3)" }}>Build my free plan →</Link>
        </div>

        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:16 }}>Continue reading</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))", gap:12 }}>
          {[
            { title:"What are ETFs?", desc:"Start here if you're completely new to investing.", href:"/guide/what-are-etfs", color:"#00b96b", icon:"🧭" },
            { title:"Pick your risk level", desc:"Conservative, Balanced or Aggressive?", href:"/guide/risk-levels", color:"#3b82f6", icon:"⚖️" },
            { title:"Which platform to use", desc:"Best free brokers to buy ETFs.", href:"/guide/platforms", color:"#c9a84c", icon:"🏦" },
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
