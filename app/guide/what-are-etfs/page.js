import Link from "next/link";

export const metadata = {
  title: "What Are ETFs? Simple Guide for Beginners | ETF.PLAN",
  description: "ETFs explained simply. What they are, why they're safer than picking stocks, and how to start with $50/month. No jargon.",
};

export default function WhatAreETFs() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,4vw,40px)", height:60, background:"rgba(248,248,245,0.96)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" className="pixel" style={{ fontSize:11, color:"var(--text)", textDecoration:"none" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</Link>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <Link href="/dashboard?tab=library" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", textDecoration:"none", padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8 }}>← Library</Link>
        </div>
      </nav>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"clamp(32px,6vw,64px) clamp(16px,4vw,24px) 80px" }}>

        {/* Breadcrumb */}
        <div style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", marginBottom:24 }}>
          <Link href="/dashboard?tab=library" style={{ color:"var(--muted2)", textDecoration:"none" }}>← Library</Link>
          <span style={{ margin:"0 8px" }}>→</span>
          <span>What are ETFs?</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
            <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>BEGINNER · 3 MIN READ</span>
          </div>
          <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(30px,6vw,52px)", color:"var(--text)", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:16 }}>
            What is an ETF?
          </h1>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(16px,2.5vw,19px)", color:"var(--muted)", lineHeight:1.8 }}>
            The simplest, safest way to invest — and why millions of people use them instead of picking stocks.
          </p>
        </div>

        {/* The simple analogy */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,36px)", marginBottom:20 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:12 }}>THE SIMPLE EXPLANATION</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,26px)", color:"white", marginBottom:14, letterSpacing:"-0.3px" }}>
            Instead of betting on one horse 🏇
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginBottom:16 }}>
            Imagine a horse race with 500 horses. Picking the winner is hard — most people get it wrong. But what if you could <strong style={{ color:"white" }}>buy a tiny share of every horse in the race?</strong>
          </p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginBottom:0 }}>
            Some horses will lose. But collectively, they almost always win. That's an ETF. You buy <strong style={{ color:"#00ff88" }}>one thing</strong> and instantly own hundreds of companies.
          </p>
        </div>

        {/* What ETF stands for */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:20, boxShadow:"var(--shadow)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:20 }}>ETF = Exchange-Traded Fund</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { letter:"E", word:"Exchange", desc:"It trades on the stock market like a regular share — you can buy and sell any time markets are open." },
              { letter:"T", word:"Traded",   desc:"The price updates in real time throughout the day, not once at close like a mutual fund." },
              { letter:"F", word:"Fund",     desc:"It holds a basket of investments — stocks, bonds, or both — giving you instant diversification." },
            ].map(e => (
              <div key={e.letter} style={{ textAlign:"center", padding:"16px 12px", background:"var(--bg3)", borderRadius:12 }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:48, color:"var(--green)", lineHeight:1, marginBottom:6 }}>{e.letter}</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:8 }}>{e.word}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", lineHeight:1.7 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why better than stocks */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:20, boxShadow:"var(--shadow)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:16 }}>Why ETFs beat picking stocks</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {[
              { icon:"🎯", bad:"Pick Apple → Apple drops 30% → you lose 30%", good:"Buy VTI → Apple drops 30% → 3,699 other companies absorb the loss" },
              { icon:"🧠", bad:"Requires deep research on every company", good:"ETFs are passive — they track an index automatically, no expertise needed" },
              { icon:"💸", bad:"Buying 10 different stocks costs 10 transactions", good:"One ETF purchase = instant exposure to hundreds of companies" },
              { icon:"📊", bad:"S&P 500 beats 90% of professional fund managers long-term", good:"VOO/VTI simply track the S&P 500 — you automatically beat most pros" },
            ].map((row, i, arr) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"36px 1fr 1fr", gap:12, padding:"14px 0", borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none", alignItems:"start" }}>
                <span style={{ fontSize:20 }}>{row.icon}</span>
                <div style={{ fontFamily:"DM Sans", fontSize:"clamp(12px,1.8vw,13px)", color:"#ff4757", lineHeight:1.6 }}>❌ {row.bad}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:"clamp(12px,1.8vw,13px)", color:"var(--green)", lineHeight:1.6 }}>✅ {row.good}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Real example */}
        <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:20 }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:8 }}>Real example: VOO</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(13px,2vw,15px)", color:"var(--muted)", lineHeight:1.8, marginBottom:16 }}>
            When you buy one share of <strong style={{ color:"var(--text)" }}>VOO</strong> (Vanguard S&P 500 ETF), you instantly own a tiny piece of all 500 of these companies at once:
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {["Apple","Microsoft","Nvidia","Amazon","Alphabet","Meta","Berkshire Hathaway","Tesla","JPMorgan","Exxon","+ 490 more"].map(c => (
              <span key={c} style={{ fontFamily:"DM Sans", fontSize:13, padding:"5px 12px", background:"white", borderRadius:8, border:"1px solid var(--border)", color:c.includes("more")?"var(--green)":"var(--text)", fontWeight:c.includes("more")?600:400 }}>{c}</span>
            ))}
          </div>
          <p style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", marginTop:14 }}>
            Annual fee: 0.03% · That's $0.30 per $1,000 invested per year.
          </p>
        </div>

        {/* Key takeaway */}
        <div style={{ background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:14, padding:"20px 24px", marginBottom:32 }}>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"var(--text)", lineHeight:1.8, margin:0 }}>
            💡 <strong>The key insight:</strong> You don't need to know which company will win. You just need to believe the economy will be larger in 10 years than today. It has been every decade for the last 100 years.
          </p>
        </div>

        {/* Next steps */}
        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", marginBottom:16 }}>What to read next</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))", gap:10, marginBottom:32 }}>
          {[
            { title:"Pick your risk level", desc:"Conservative, Balanced or Aggressive?", href:"/guide/risk-levels", color:"#3b82f6" },
            { title:"Which platform to use", desc:"Where to actually open an account.", href:"/guide/platforms", color:"#c9a84c" },
            { title:"How to buy step by step", desc:"Open the app and follow these 4 steps.", href:"/dashboard", color:"#00b96b" },
          ].map(n => (
            <Link key={n.title} href={n.href} style={{ display:"block", textDecoration:"none", background:"white", border:`1.5px solid ${n.color}22`, borderRadius:12, padding:"16px", boxShadow:"var(--shadow)" }}>
              <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:4 }}>{n.title}</div>
              <div style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)" }}>{n.desc}</div>
              <div style={{ fontFamily:"DM Mono", fontSize:10, color:n.color, marginTop:8 }}>Read →</div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign:"center" }}>
          <Link href="/dashboard?tab=library" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"var(--text)", background:"white", padding:"13px 28px", borderRadius:12, textDecoration:"none", border:"1px solid var(--border)", boxShadow:"var(--shadow)" }}>
            ← Back to Library
          </Link>
        </div>

      </div>
    </div>
  );
}
