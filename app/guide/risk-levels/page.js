import Link from "next/link";

export const metadata = {
  title: "Conservative vs Balanced vs Aggressive — Which Plan is Right for You? | ETF.PLAN",
  description: "Simple guide to choosing your ETF risk level. What each plan means in plain English, with real numbers.",
};

const PLANS = [
  {
    key:"conservative", icon:"🛡️", label:"Conservative", rate:"~5%/yr", color:"#3b82f6",
    who:"You want to beat a savings account without much risk. You'd lose sleep if your portfolio dropped 20%.",
    etfs:["BND (Bonds 40%)","SCHD (Dividends 30%)","VTI (Total Market 20%)","VOO (S&P 500 10%)"],
    good:["Closest to a savings account — but better","Rarely drops more than 10% in a year","Pays dividends quarterly","Outperforms inflation every year historically"],
    bad:["Lower ceiling — won't hit 20%+ years","Slower growth than pure equity plans","BND (bonds) can lose value when rates rise"],
    example:{ invested:6000, value:6636, gain:636, years:5, monthly:100 },
  },
  {
    key:"balanced", icon:"⚖️", label:"Balanced", rate:"~9%/yr", color:"#c9a84c",
    who:"You want solid long-term growth but don't want to panic every time markets dip. The most popular choice.",
    etfs:["VOO (S&P 500 40%)","VTI (Total Market 25%)","QQQ (Nasdaq-100 25%)","SCHD (Dividends 10%)"],
    good:["Best risk/reward ratio for most investors","Includes tech growth upside via QQQ","Dividend income from SCHD","50-year track record of positive 10-year periods"],
    bad:["Can drop 20-30% in bad years (2022: -20%)","Less income than conservative","Requires patience — holds through volatility"],
    example:{ invested:6000, value:7597, gain:1597, years:5, monthly:100 },
  },
  {
    key:"aggressive", icon:"🚀", label:"Aggressive", rate:"~16%/yr", color:"#ff4757",
    who:"You have a long time horizon (10+ years), understand volatility, and won't panic sell in downturns.",
    etfs:["QQQ (Nasdaq-100 35%)","VGT (Info Tech 25%)","TQQQ (3x Leveraged 25%)","ARKK (Innovation 15%)"],
    good:["Highest potential returns","Maximum tech/growth exposure","TQQQ amplifies bull market gains"],
    bad:["TQQQ can drop 80%+ in crashes","ARKK dropped 75% from peak in 2022","Requires iron stomach — not for everyone","Only suitable for 10+ year horizon"],
    example:{ invested:6000, value:9225, gain:3225, years:5, monthly:100 },
    warning:true,
  },
];

const fmt = n => `$${n.toLocaleString()}`;

export default function RiskLevelsGuide() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,4vw,40px)", height:60, background:"rgba(248,248,245,0.96)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" className="pixel" style={{ fontSize:11, color:"var(--text)", textDecoration:"none" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</Link>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <Link href="/dashboard?tab=library" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", textDecoration:"none", padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8 }}>← Library</Link>
        </div>
      </nav>

      <div style={{ maxWidth:740, margin:"0 auto", padding:"clamp(32px,6vw,64px) clamp(16px,4vw,24px) 80px" }}>

        <div style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", marginBottom:24 }}>
          <Link href="/dashboard?tab=library" style={{ color:"var(--muted2)", textDecoration:"none" }}>← Library</Link>
          <span style={{ margin:"0 8px" }}>→</span>
          <span>Risk levels</span>
        </div>

        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
          <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>BEGINNER · 4 MIN READ</span>
        </div>

        <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(28px,6vw,50px)", color:"var(--text)", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:16 }}>
          Which risk level is right for you?
        </h1>
        <p style={{ fontFamily:"DM Sans", fontSize:"clamp(15px,2.5vw,18px)", color:"var(--muted)", lineHeight:1.8, marginBottom:40 }}>
          All three plans beat a savings account. The difference is how much they can go up — and how much they can dip along the way.
        </p>

        {/* Quick picker */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:28 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:14 }}>QUICK PICKER — WHICH SOUNDS LIKE YOU?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { q:'"I just want to beat my savings account without worrying."', a:"→ Conservative 🛡️", color:"#60a5fa" },
              { q:'"I want decent growth. I can handle some ups and downs."', a:"→ Balanced ⚖️",     color:"#c9a84c" },
              { q:'"I\'m in for 10+ years and want maximum growth."',          a:"→ Aggressive 🚀",  color:"#ff6b6b" },
            ].map(r => (
              <div key={r.q} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"12px 16px", flexWrap:"wrap", gap:8 }}>
                <span style={{ fontFamily:"DM Sans", fontSize:"clamp(13px,2vw,15px)", color:"rgba(255,255,255,0.7)", fontStyle:"italic", flex:1 }}>{r.q}</span>
                <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:14, color:r.color, whiteSpace:"nowrap" }}>{r.a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* $100/month comparison */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:28, boxShadow:"var(--shadow)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(17px,3vw,22px)", color:"var(--text)", marginBottom:6 }}>$100/month — what each plan gives you</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted)", marginBottom:20 }}>After 5 years of investing $100/month.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {PLANS.map((p, i) => (
              <div key={p.key} style={{ display:"grid", gridTemplateColumns:"auto 1fr auto auto", gap:14, alignItems:"center", padding:"14px 0", borderBottom:i<PLANS.length-1?"1px solid var(--bg3)":"none" }}>
                <span style={{ fontSize:22 }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"var(--text)" }}>{p.label}</div>
                  <div className="mono" style={{ fontSize:11, color:p.color }}>{p.rate} target</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:20, color:"var(--text)" }}>{fmt(p.example.value)}</div>
                  <div className="mono" style={{ fontSize:11, color:"var(--green)" }}>+{fmt(p.example.gain)} gain</div>
                </div>
                <div style={{ width:60, height:8, borderRadius:4, background:"var(--bg3)", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(p.example.value/9225)*100}%`, background:p.color, borderRadius:4 }}/>
                </div>
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize:10, color:"var(--muted2)", marginTop:14 }}>
            Based on target annual returns. Past performance ≠ future results.
          </p>
        </div>

        {/* Each plan in detail */}
        {PLANS.map(p => (
          <div key={p.key} style={{ background:"white", border:`2px solid ${p.color}22`, borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:16, boxShadow:"var(--shadow)" }}>
            {p.warning && (
              <div style={{ background:"rgba(255,71,87,0.08)", border:"1px solid rgba(255,71,87,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:16 }}>
                <p style={{ fontFamily:"DM Sans", fontSize:13, color:"#ff4757", margin:0 }}>⚠️ This plan includes leveraged ETFs (TQQQ) which can lose 80%+ in market crashes. Only choose this if you have 10+ years and can stomach big drops.</p>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:32 }}>{p.icon}</span>
                <div>
                  <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,26px)", color:"var(--text)", margin:0 }}>{p.label}</h2>
                  <div className="mono" style={{ fontSize:12, color:p.color, marginTop:2 }}>{p.rate} annual target</div>
                </div>
              </div>
              <div style={{ background:`${p.color}10`, border:`1px solid ${p.color}22`, borderRadius:12, padding:"12px 18px", textAlign:"center" }}>
                <div className="mono" style={{ fontSize:10, color:p.color, marginBottom:4 }}>5YR GAIN ($100/MO)</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:24, color:p.color }}>+{fmt(p.example.gain)}</div>
              </div>
            </div>

            <div style={{ fontFamily:"DM Sans", fontSize:"clamp(13px,2vw,15px)", color:"var(--text)", fontStyle:"italic", lineHeight:1.7, marginBottom:16, padding:"12px 16px", background:"var(--bg3)", borderRadius:10 }}>
              "{p.who}"
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,240px),1fr))", gap:10, marginBottom:16 }}>
              <div>
                <div className="mono" style={{ fontSize:10, color:"var(--muted2)", marginBottom:8, letterSpacing:1 }}>ETFs IN THIS PLAN</div>
                {p.etfs.map(e => (
                  <div key={e} style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--text)", marginBottom:5, display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:p.color, flexShrink:0 }}/>
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize:10, color:"var(--muted2)", marginBottom:8, letterSpacing:1 }}>PROS</div>
                {p.good.map(g => (
                  <div key={g} style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", marginBottom:5, display:"flex", gap:8 }}>
                    <span style={{ color:"var(--green)", flexShrink:0 }}>✓</span>{g}
                  </div>
                ))}
              </div>
              <div>
                <div className="mono" style={{ fontSize:10, color:"var(--muted2)", marginBottom:8, letterSpacing:1 }}>CONS</div>
                {p.bad.map(b => (
                  <div key={b} style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", marginBottom:5, display:"flex", gap:8 }}>
                    <span style={{ color:"var(--muted2)", flexShrink:0 }}>–</span>{b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign:"center" }}>
          <Link href="/dashboard?tab=library" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"var(--text)", background:"white", padding:"13px 28px", borderRadius:12, textDecoration:"none", border:"1px solid var(--border)", boxShadow:"var(--shadow)" }}>
            ← Back to Library
          </Link>
        </div>
      </div>
    </div>
  );
}
