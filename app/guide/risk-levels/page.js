import Link from "next/link";

export const metadata = {
  title: "Conservative vs Balanced vs Aggressive Investing: Which Risk Level? | ETF.PLAN",
  description: "Not sure how much investment risk to take? This guide explains the 3 risk levels in plain English — with real numbers, real ETFs, and a simple quiz to find your match.",
  openGraph: {
    title: "Conservative, Balanced or Aggressive? How to Pick Your Risk Level",
    description: "Real numbers for each plan. Find the right risk level for your situation in 2 minutes.",
  },
};

export default function RiskLevels() {
  const P = ({ children, style={} }) => <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"var(--muted)", lineHeight:1.85, marginBottom:14, ...style }}>{children}</p>;
  const H2 = ({ children }) => <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(19px,3vw,24px)", color:"var(--text)", marginBottom:14, letterSpacing:"-0.3px", lineHeight:1.25 }}>{children}</h2>;
  const Card = ({ children, bg="white", border=true }) => <div style={{ background:bg, border:border?"1px solid var(--border)":"none", borderRadius:16, padding:"clamp(20px,3vw,32px)", marginBottom:20, boxShadow:bg==="white"?"var(--shadow)":"none" }}>{children}</div>;

  const plans = [
    {
      icon:"🛡️", name:"Conservative", rate:"~5%/yr", color:"#3b82f6", risk:"Very Low",
      etfs:["BND 40%","SCHD 30%","VTI 20%","VOO 10%"],
      passive5yr:346, passive10yr:877, port5yr:6920, port10yr:16024,
      maxDrawdown:"~8-12%",
      bestFor:"People within 5 years of needing the money, or anyone who would panic and sell if their portfolio dropped 15%.",
      notFor:"People with 10+ year horizon who want maximum growth.",
      pros:["Most stable — won't drop much even in crashes","Includes bonds as a shock absorber","Dividend income from SCHD paid quarterly","Closest to a savings account, but better"],
      cons:["Lower long-term growth ceiling","Bonds drag returns in bull markets","May not keep pace with inflation in bad bond environments"],
    },
    {
      icon:"⚖️", name:"Balanced", rate:"~9%/yr", color:"#c9a84c", risk:"Low–Med",
      etfs:["VOO 40%","VTI 25%","QQQ 25%","SCHD 10%"],
      passive5yr:684, passive10yr:1755, port5yr:7599, port10yr:19497,
      maxDrawdown:"~20-30%",
      bestFor:"Most people. 5–20 year horizon. You can handle seeing your portfolio drop temporarily and you won't panic sell.",
      notFor:"People who need the money within 3 years, or anyone who will lose sleep over a 20% temporary drop.",
      pros:["Sweet spot of growth vs stability","Mixes large-cap growth (VOO/QQQ) with dividend income (SCHD)","Most popular plan — proven risk/return profile","~9% historically matches what most financial advisors target"],
      cons:["Will drop 20-30% in major crashes","Requires patience to hold through downturns","Higher volatility than conservative"],
    },
    {
      icon:"🚀", name:"Aggressive", rate:"~16%/yr", color:"#ff4757", risk:"Medium",
      etfs:["QQQ 35%","VGT 25%","TQQQ 25%","ARKK 15%"],
      passive5yr:1476, passive10yr:6057, port5yr:9225, port10yr:30860,
      maxDrawdown:"~40-60%",
      bestFor:"People with 10+ year horizon, high risk tolerance, and the discipline NOT to sell during crashes. TQQQ is 3x leveraged — it can drop 60%+ in a bear market.",
      notFor:"Anyone who might need the money within 5 years. Anyone who would panic during a 40% drop.",
      pros:["Highest long-term growth potential","Tech-heavy — benefits from AI/software mega-trends","TQQQ amplifies gains in bull markets","15yr CAGR historically ~16%+"],
      cons:["TQQQ can drop 60-80% in crashes — it has before","Requires genuine long-term discipline","NOT suitable if you'll need money within 5 years","High volatility means rough years mentally"],
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
          <span>Risk levels</span>
        </div>

        <div style={{ marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
            <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>BEGINNER GUIDE · 5 MIN READ</span>
          </div>
          <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(32px,6vw,54px)", color:"var(--text)", letterSpacing:"-2px", lineHeight:1.05, marginBottom:16 }}>Conservative, Balanced or Aggressive?</h1>
          <P style={{ fontSize:"clamp(16px,2.5vw,19px)" }}>All three plans beat a regular savings account. The difference is how much they can fluctuate — and how long you need to hold. Here's everything you need to decide.</P>
        </div>

        {/* Quick picker */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,36px)", marginBottom:20 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:16 }}>QUICK PICKER — WHICH SOUNDS LIKE YOU?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { match:"🛡️ Conservative", desc:"I don't want to see my portfolio drop more than 10%. I might need this money within 5 years. I'd rather grow slowly than risk a big drop.", color:"#3b82f6" },
              { match:"⚖️ Balanced", desc:"I'm fine with temporary drops of 20-30% as long as I recover. I'm investing for 5-15 years. I won't panic sell.", color:"#c9a84c" },
              { match:"🚀 Aggressive", desc:"I have 10+ years. I genuinely won't touch this money. I can watch my portfolio drop 40% and still hold without selling.", color:"#ff4757" },
            ].map((s,i) => (
              <div key={i} style={{ padding:"14px 16px", background:"rgba(255,255,255,0.05)", borderRadius:10, border:`1px solid ${s.color}33` }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:14, color:s.color, marginBottom:6 }}>{s.match}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The plans */}
        {plans.map((plan,pi) => (
          <Card key={plan.name}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:28 }}>{plan.icon}</span>
                  <h2 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(20px,3vw,26px)", color:"var(--text)", margin:0 }}>{plan.name}</h2>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"DM Mono", fontSize:11, color:plan.color, background:`${plan.color}12`, padding:"3px 10px", borderRadius:6 }}>{plan.rate}</span>
                  <span style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", background:"var(--bg3)", padding:"3px 10px", borderRadius:6, border:"1px solid var(--border)" }}>{plan.risk} risk</span>
                  <span style={{ fontFamily:"DM Mono", fontSize:11, color:"#ff4757", background:"rgba(255,71,87,0.06)", padding:"3px 10px", borderRadius:6 }}>Max drop: {plan.maxDrawdown}</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {plan.etfs.map(e => (
                  <span key={e} style={{ fontFamily:"DM Mono", fontSize:11, padding:"4px 10px", background:`${plan.color}10`, border:`1px solid ${plan.color}22`, borderRadius:6, color:plan.color }}>{e}</span>
                ))}
              </div>
            </div>

            {/* Numbers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10, marginBottom:18 }}>
              {[
                { l:"Portfolio at 5yr", v:`$${plan.port5yr.toLocaleString()}`, note:"($100/mo)" },
                { l:"Portfolio at 10yr", v:`$${plan.port10yr.toLocaleString()}`, note:"($100/mo)" },
                { l:"Passive income/yr (5yr)", v:`+$${plan.passive5yr}/yr`, green:true },
                { l:"Passive income/yr (10yr)", v:`+$${plan.passive10yr.toLocaleString()}/yr`, green:true },
              ].map(s => (
                <div key={s.l} style={{ background:"var(--bg3)", borderRadius:10, padding:"12px", textAlign:"center", border:"1px solid var(--border)" }}>
                  <div style={{ fontFamily:"DM Mono", fontSize:9, color:"var(--muted2)", marginBottom:4, letterSpacing:0.5 }}>{s.l.toUpperCase()}</div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:s.green?"var(--green)":"var(--text)" }}>{s.v}</div>
                  {s.note && <div style={{ fontFamily:"DM Mono", fontSize:9, color:"var(--muted2)", marginTop:2 }}>{s.note}</div>}
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--green)", marginBottom:8, letterSpacing:1 }}>BEST FOR</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7, padding:"12px 14px", background:"rgba(0,185,107,0.04)", borderRadius:8, border:"1px solid rgba(0,185,107,0.12)" }}>{plan.bestFor}</div>
              </div>
              <div>
                <div style={{ fontFamily:"DM Mono", fontSize:10, color:"#ff4757", marginBottom:8, letterSpacing:1 }}>NOT FOR</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7, padding:"12px 14px", background:"rgba(255,71,87,0.03)", borderRadius:8, border:"1px solid rgba(255,71,87,0.1)" }}>{plan.notFor}</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <div style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", marginBottom:8, letterSpacing:1 }}>PROS</div>
                {plan.pros.map((p,i) => (
                  <div key={i} style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", lineHeight:1.6, marginBottom:4 }}>✅ {p}</div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", marginBottom:8, letterSpacing:1 }}>CONS</div>
                {plan.cons.map((c,i) => (
                  <div key={i} style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", lineHeight:1.6, marginBottom:4 }}>⚠️ {c}</div>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {/* Comparison table */}
        <Card>
          <H2>Side-by-side comparison ($100/month for 10 years)</H2>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--text)" }}>
                  {["",  "Conservative 🛡️", "Balanced ⚖️", "Aggressive 🚀"].map(h => (
                    <th key={h} style={{ fontFamily:"DM Mono", fontSize:10, color:"rgba(255,255,255,0.5)", padding:"10px 14px", textAlign:"left", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label:"Target return",     vals:["~5%/yr", "~9%/yr", "~16%/yr"] },
                  { label:"Portfolio at 5yr",  vals:["$6,920", "$7,599", "$9,225"] },
                  { label:"Portfolio at 10yr", vals:["$16,024", "$19,497", "$30,860"] },
                  { label:"Passive income/yr", vals:["+$877/yr", "+$1,755/yr", "+$6,057/yr"] },
                  { label:"Max drawdown",      vals:["~8-12%", "~20-30%", "~40-60%"] },
                  { label:"Key ETFs",          vals:["BND, SCHD, VTI, VOO", "VOO, VTI, QQQ, SCHD", "QQQ, VGT, TQQQ, ARKK"] },
                  { label:"Min hold period",   vals:["3+ years", "5+ years", "10+ years"] },
                ].map((row,i) => (
                  <tr key={i} style={{ background:i%2===0?"var(--bg3)":"white", borderBottom:"1px solid var(--border)" }}>
                    <td style={{ fontFamily:"DM Mono", fontSize:11, padding:"10px 14px", color:"var(--muted2)", letterSpacing:0.5 }}>{row.label.toUpperCase()}</td>
                    {row.vals.map((v,j) => (
                      <td key={j} style={{ fontFamily:"DM Sans", fontSize:13, padding:"10px 14px", color:"var(--text)", fontWeight:row.label.includes("passive") || row.label.includes("Portfolio")?"700":"400" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <H2>Common questions about risk levels</H2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { q:"Can I change my risk level after signing up?", a:"Yes — you can change your plan at any time from your dashboard. ETF.PLAN will immediately show you the new ETF picks for your updated plan." },
              { q:"What happens to my portfolio if I switch?", a:"Your historical tracked data stays as-is. Going forward, we'll show picks based on your new plan. You decide when to actually rebalance your broker holdings." },
              { q:"Is Balanced really safe enough for a beginner?", a:"Balanced is the most popular choice for a reason. Yes, it can drop 20-30% in a crash — but over 5-10 years, it has historically recovered every time and delivered strong returns. The key is not panic selling." },
              { q:"Why does Aggressive include TQQQ (3x leveraged)?", a:"TQQQ delivers 3x the daily return of the Nasdaq-100. In bull markets this accelerates gains dramatically. In bear markets it can drop 60-80%. It's only appropriate for a small portion of a long-term portfolio for people who genuinely won't touch the money." },
              { q:"What's the minimum timeline for each plan?", a:"Conservative: 3+ years. Balanced: 5+ years. Aggressive: 10+ years. If you need the money sooner, keep it in a savings account or high-yield savings instead." },
            ].map((faq,i) => (
              <div key={i} style={{ padding:"14px 16px", background:"var(--bg3)", borderRadius:10, border:"1px solid var(--border)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:6 }}>{faq.q}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.75 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,32px)", marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⚖️</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,26px)", color:"white", marginBottom:12, letterSpacing:"-0.5px" }}>Ready to pick your plan?</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:480, margin:"0 auto 24px" }}>Sign up free — takes 2 minutes. You choose your risk level, we handle the rest.</p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:"white", background:"var(--green)", padding:"13px 28px", borderRadius:10, textDecoration:"none", boxShadow:"0 4px 16px rgba(0,185,107,0.3)" }}>Start my plan free →</Link>
        </div>

        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:16 }}>Continue reading</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))", gap:12 }}>
          {[
            { title:"What are ETFs?", desc:"New to investing? Start here.", href:"/guide/what-are-etfs", color:"#00b96b", icon:"🧭" },
            { title:"Which platform to use", desc:"Best free brokers for ETFs.", href:"/guide/platforms", color:"#c9a84c", icon:"🏦" },
            { title:"Dollar-cost averaging", desc:"Why investing monthly is the winning strategy.", href:"/guide/dollar-cost-averaging", color:"#8b5cf6", icon:"📈" },
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
