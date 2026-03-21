import Link from "next/link";

export const metadata = {
  title: "What Are ETFs? Complete Beginner's Guide (2026) | ETF.PLAN",
  description: "ETFs explained simply. What they are, how they work, why they beat picking stocks, and how to start investing from $50/month. No jargon.",
  openGraph: {
    title: "What Are ETFs? Complete Beginner's Guide",
    description: "ETFs explained simply — what they are, how they work, and how to start from $50/month.",
  },
};

export default function WhatAreETFs() {
  const P = ({ children, style = {} }) => (
    <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"var(--muted)", lineHeight:1.85, marginBottom:14, ...style }}>{children}</p>
  );
  const H2 = ({ children }) => (
    <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(19px,3vw,24px)", color:"var(--text)", marginBottom:14, letterSpacing:"-0.3px", lineHeight:1.25 }}>{children}</h2>
  );
  const Card = ({ children, bg="white", border=true }) => (
    <div style={{ background:bg, border:border?"1px solid var(--border)":"none", borderRadius:16, padding:"clamp(20px,3vw,32px)", marginBottom:20, boxShadow:bg==="white"?"var(--shadow)":"none" }}>{children}</div>
  );

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
          <span>What are ETFs?</span>
        </div>

        <div style={{ marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
            <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>BEGINNER GUIDE · 6 MIN READ</span>
          </div>
          <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(32px,6vw,54px)", color:"var(--text)", letterSpacing:"-2px", lineHeight:1.05, marginBottom:16 }}>What is an ETF?</h1>
          <P style={{ fontSize:"clamp(16px,2.5vw,19px)" }}>An ETF is one of the smartest, simplest ways to invest your money — and it's how millions of ordinary people build wealth without needing to know anything about the stock market. Here's everything you need to understand, in plain English.</P>
        </div>

        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,36px)", marginBottom:20 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:12 }}>THE SIMPLEST EXPLANATION</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,28px)", color:"white", marginBottom:14, letterSpacing:"-0.5px" }}>It's like buying a slice of the entire economy</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.85, marginBottom:14 }}>Imagine you could buy one single thing that contains a tiny piece of Apple, Microsoft, Nvidia, Amazon, Google, Tesla, and 494 other companies — all at once.</p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.85, marginBottom:14 }}>That's exactly what an ETF does. Instead of picking one company and hoping it succeeds, you own <strong style={{ color:"white" }}>hundreds of companies simultaneously</strong>. If one fails, the others carry it.</p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.85, marginBottom:0 }}>This is called <strong style={{ color:"#00ff88" }}>diversification</strong> — and it's the single most important concept in investing.</p>
        </div>

        <Card>
          <H2>ETF = Exchange-Traded Fund</H2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,160px),1fr))", gap:12, marginBottom:16 }}>
            {[
              { letter:"E", word:"Exchange", desc:"Trades on the stock market like a regular stock — buy and sell any time during market hours." },
              { letter:"T", word:"Traded",   desc:"Price updates in real time throughout the day, unlike a mutual fund which prices once per day." },
              { letter:"F", word:"Fund",     desc:"Holds a basket of assets — stocks, bonds, or both — giving you instant diversification." },
            ].map(e => (
              <div key={e.letter} style={{ textAlign:"center", padding:"16px 12px", background:"var(--bg3)", borderRadius:12 }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:48, color:"var(--green)", lineHeight:1, marginBottom:6 }}>{e.letter}</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:8 }}>{e.word}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", lineHeight:1.7 }}>{e.desc}</div>
              </div>
            ))}
          </div>
          <P>When you buy one share of VOO (Vanguard S&P 500 ETF), you instantly own a tiny piece of all 500 companies inside it. If Apple goes up, your share goes up a little. If Apple goes down, the other 499 companies soften the blow.</P>
        </Card>

        <Card>
          <H2>ETFs vs picking individual stocks</H2>
          <P>Most people who try to pick individual stocks underperform the market. Here's why ETFs win:</P>
          {[
            { icon:"🎯", title:"Risk", bad:"Buy Apple → Apple drops 30% → you lose 30%", good:"Buy VOO → Apple drops 30% → 499 other companies absorb the shock" },
            { icon:"📊", title:"Performance", bad:"90% of professional fund managers fail to beat the S&P 500 over 10 years", good:"VOO/VTI simply track the S&P 500 — you automatically beat most pros" },
            { icon:"💸", title:"Cost", bad:"Actively managed funds charge 1–2%/year in fees", good:"Broad ETFs like VTI charge 0.03%/year — 50x cheaper" },
            { icon:"⏰", title:"Time", bad:"Monitoring stocks requires hours of research weekly", good:"Set up monthly investing, check once a month. That's it." },
          ].map((row, i, arr) => (
            <div key={i} style={{ padding:"16px 0", borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:20 }}>{row.icon}</span>
                <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:14, color:"var(--text)" }}>{row.title}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"#ff4757", lineHeight:1.6, padding:"10px 12px", background:"rgba(255,71,87,0.05)", borderRadius:8 }}>❌ {row.bad}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"#00875a", lineHeight:1.6, padding:"10px 12px", background:"rgba(0,185,107,0.06)", borderRadius:8 }}>✅ {row.good}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <H2>How $100/month grows in a balanced ETF plan (~9%/yr)</H2>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {[
              { yr:"3 years", invested:"$3,600",  portfolio:"$4,146",  passive:"+$373/yr",  note:"Netflix + Spotify + gym", hl:false },
              { yr:"5 years", invested:"$6,000",  portfolio:"$7,599",  passive:"+$684/yr",  note:"Your phone bill, paid every year", hl:false },
              { yr:"10 years",invested:"$12,000", portfolio:"$19,497", passive:"+$1,755/yr", note:"Phone + car insurance every year", hl:true },
              { yr:"20 years",invested:"$24,000", portfolio:"$67,290", passive:"+$6,056/yr", note:"$500+/month in passive income", hl:true },
            ].map((row,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"70px 1fr auto", gap:12, alignItems:"center", padding:"12px 14px", borderRadius:10, background:row.hl?"var(--text)":"var(--bg3)", border:row.hl?"none":"1px solid var(--border)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:13, color:row.hl?"rgba(255,255,255,0.8)":"var(--text)" }}>{row.yr}</div>
                <div>
                  <div style={{ fontFamily:"DM Mono", fontSize:9, color:row.hl?"rgba(255,255,255,0.3)":"var(--muted2)", marginBottom:2 }}>EARNS PASSIVELY/YR</div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:18, color:"var(--green)" }}>{row.passive}</div>
                  <div style={{ fontFamily:"DM Sans", fontSize:11, color:row.hl?"rgba(255,255,255,0.35)":"var(--muted2)" }}>💡 {row.note}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"DM Mono", fontSize:9, color:row.hl?"rgba(255,255,255,0.3)":"var(--muted2)", marginBottom:2 }}>PORTFOLIO</div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:row.hl?"white":"var(--text)" }}>{row.portfolio}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:"14px 18px", background:"rgba(0,185,107,0.06)", borderRadius:10, border:"1px solid rgba(0,185,107,0.2)" }}>
            <P style={{ margin:0, color:"var(--text)", fontSize:14 }}>💡 <strong>At ~7.8 years your portfolio generates more per year than you put in</strong> — your money outworks you. This is compounding, and it only works if you start.</P>
          </div>
        </Card>

        <Card>
          <H2>Common questions about ETFs</H2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { q:"How much money do I need to start?", a:"Most brokers let you start with as little as $1 using fractional shares. ETF.PLAN is designed around $50–$150/month — realistic for most people." },
              { q:"Can I lose all my money in an ETF?", a:"For broad market ETFs like VOO or VTI, losing everything would require every major US company to go to zero — which would mean economic collapse. Diversified index ETFs are among the safest investments available." },
              { q:"What's the difference between ETFs and mutual funds?", a:"Both hold baskets of assets, but ETFs trade like stocks (any time), while mutual funds price once per day. ETFs also have much lower fees — 0.03% vs 1-2% for active mutual funds." },
              { q:"Do I pay taxes on ETF gains?", a:"Yes — when you sell at a profit you owe capital gains tax. ETFs are generally more tax-efficient than mutual funds. Consult a tax advisor for your specific situation." },
              { q:"How do I actually buy an ETF?", a:"Open a free brokerage account (Robinhood, eToro, Interactive Brokers). Search the ticker (e.g. 'VOO'). Enter the amount. Click buy. Takes 5 minutes." },
            ].map((faq,i) => (
              <div key={i} style={{ padding:"14px 16px", background:"var(--bg3)", borderRadius:10, border:"1px solid var(--border)" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:6 }}>{faq.q}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.75 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,32px)", marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>💡</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,26px)", color:"white", marginBottom:12, letterSpacing:"-0.5px" }}>Ready to build your plan?</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:480, margin:"0 auto 24px" }}>You don't need to know which company will win. You just need to start. Free plan, 2 minutes.</p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:"white", background:"var(--green)", padding:"13px 28px", borderRadius:10, textDecoration:"none", boxShadow:"0 4px 16px rgba(0,185,107,0.3)" }}>Build my free ETF plan →</Link>
        </div>

        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:16 }}>What to read next</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))", gap:12 }}>
          {[
            { title:"Pick your risk level", desc:"Conservative, Balanced or Aggressive — which is right for you?", href:"/guide/risk-levels", color:"#3b82f6", icon:"⚖️" },
            { title:"Which platform to use", desc:"Best free brokers to buy ETFs in 2026.", href:"/guide/platforms", color:"#c9a84c", icon:"🏦" },
            { title:"Dollar-cost averaging", desc:"Why investing the same amount monthly is the winning strategy.", href:"/guide/dollar-cost-averaging", color:"#8b5cf6", icon:"📈" },
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
