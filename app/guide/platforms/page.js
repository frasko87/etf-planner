import Link from "next/link";

export const metadata = {
  title: "Best Platforms to Buy ETFs in 2026 | ETF.PLAN",
  description: "Robinhood, eToro, Vanguard or Interactive Brokers? Simple comparison to help you pick the right one in 2 minutes.",
};

const PLATFORMS = [
  {
    name:"Robinhood", emoji:"🟢", color:"#00c805", bg:"rgba(0,200,5,0.04)", border:"rgba(0,200,5,0.2)",
    tagline:"Best for complete beginners", min:"$1", fees:"Free",
    url:"https://robinhood.com",
    best_for:"First-time investors who want the simplest possible experience.",
    steps:["Download the Robinhood app","Tap 'Sign up' and enter your email","Verify your identity (passport or ID)","Connect your bank account","Transfer money and search your ETF ticker"],
    pros:["No account minimum","Fractional shares — buy $25 of VOO even if it costs $600/share","Clean, beginner-friendly app","Commission-free"],
    cons:["Limited research tools","No ISA or pension accounts","US stocks only"],
    verdict:"✅ Pick this if you want to get started in under 10 minutes with zero complexity.",
  },
  {
    name:"eToro", emoji:"🔵", color:"#2196a0", bg:"rgba(33,150,160,0.04)", border:"rgba(33,150,160,0.2)",
    tagline:"Best for social + beginner", min:"$10", fees:"Free for ETFs",
    url:"https://www.etoro.com",
    best_for:"Beginners who want to see what other investors are doing.",
    steps:["Go to etoro.com and click 'Join now'","Complete identity verification","Deposit minimum $10","Search your ETF (e.g. 'VOO') in the search bar","Click 'Trade' and enter dollar amount"],
    pros:["Copy other investors automatically","Commission-free ETFs","Available in more countries than Robinhood","Fractional shares"],
    cons:["$5 withdrawal fee","Spread on some assets","Interface can feel cluttered"],
    verdict:"✅ Pick this if you're outside the US or want to follow other investors while learning.",
  },
  {
    name:"Vanguard", emoji:"🔴", color:"#8b0000", bg:"rgba(139,0,0,0.04)", border:"rgba(139,0,0,0.2)",
    tagline:"Best for long-term investors", min:"$1", fees:"Free for Vanguard ETFs",
    url:"https://investor.vanguard.com",
    best_for:"Investors focused on Vanguard ETFs (VTI, VOO, BND, SCHD) for the long term.",
    steps:["Go to investor.vanguard.com","Click 'Open an account'","Complete identity verification (takes 5-10 min)","Fund via bank transfer (1-3 business days)","Search ETF ticker and place order"],
    pros:["Owned by its investors — lowest fees in the industry","Best for VTI, VOO, BND, SCHD specifically","Trusted institution with 50+ year track record","Retirement accounts available"],
    cons:["Older interface — less polished than Robinhood","Bank transfers take 1-3 days","Not great for non-Vanguard ETFs"],
    verdict:"✅ Pick this if your plan is heavy on VTI/VOO and you're in it for 10+ years.",
  },
  {
    name:"Interactive Brokers", emoji:"🟤", color:"#0066cc", bg:"rgba(0,102,204,0.04)", border:"rgba(0,102,204,0.2)",
    tagline:"Best for serious/global investors", min:"$0", fees:"From $0",
    url:"https://www.interactivebrokers.com",
    best_for:"Investors outside the US who need global market access.",
    steps:["Go to interactivebrokers.com","Click 'Open account' and select IBKR Lite (free)","Complete identity verification","Connect bank and deposit","Use the 'Client Portal' to search and buy ETFs"],
    pros:["Access to 150 markets globally","IBKR Lite is commission-free","Best margin rates if you ever need them","Available in almost every country"],
    cons:["Complex interface — steep learning curve","Not ideal for absolute beginners","Better suited for experienced investors"],
    verdict:"✅ Pick this if you're outside the US/EU or want access to international markets.",
  },
];

export default function PlatformsGuide() {
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
          <span>Which platform to use</span>
        </div>

        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
          <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>BEGINNER · 3 MIN READ</span>
        </div>

        <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(28px,6vw,50px)", color:"var(--text)", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:16 }}>
          Where should you buy your ETFs?
        </h1>
        <p style={{ fontFamily:"DM Sans", fontSize:"clamp(15px,2.5vw,18px)", color:"var(--muted)", lineHeight:1.8, marginBottom:32 }}>
          All four platforms are regulated, free to use and commission-free for ETFs. Pick the one that fits where you live and how you invest.
        </p>

        {/* Quick pick */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:28 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:14 }}>IN A HURRY? PICK BY SITUATION</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { s:"I'm in the US and want the simplest app", r:"Robinhood 🟢" },
              { s:"I'm in Europe or want social features", r:"eToro 🔵" },
              { s:"I want the lowest fees, long-term only", r:"Vanguard 🔴" },
              { s:"I'm outside US/EU or want global access", r:"Interactive Brokers 🟤" },
            ].map(row => (
              <div key={row.s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"10px 16px", flexWrap:"wrap", gap:8 }}>
                <span style={{ fontFamily:"DM Sans", fontSize:"clamp(12px,2vw,14px)", color:"rgba(255,255,255,0.65)" }}>{row.s}</span>
                <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:14, color:"white", whiteSpace:"nowrap" }}>{row.r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform cards */}
        {PLATFORMS.map(p => (
          <div key={p.name} id={p.name.toLowerCase().replace(" ","-")} style={{ background:"white", border:`2px solid ${p.border}`, borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:16, boxShadow:"var(--shadow)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:28 }}>{p.emoji}</span>
                <div>
                  <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,22px)", color:"var(--text)", margin:0 }}>{p.name}</h2>
                  <div style={{ fontFamily:"DM Mono", fontSize:11, color:p.color, marginTop:2 }}>{p.tagline}</div>
                </div>
              </div>
              <a href={p.url} target="_blank" rel="noreferrer" style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:13, color:"white", background:p.color, padding:"8px 16px", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap" }}>
                Open account ↗
              </a>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,180px),1fr))", gap:8, marginBottom:16 }}>
              {[{l:"Min. deposit",v:p.min},{l:"ETF fees",v:p.fees}].map(s=>(
                <div key={s.l} style={{ background:"var(--bg3)", borderRadius:8, padding:"10px 12px" }}>
                  <div className="mono" style={{ fontSize:9, color:"var(--muted2)", marginBottom:3 }}>{s.l}</div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:15, color:"var(--text)" }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{ background:`${p.bg}`, border:`1px solid ${p.border}`, borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
              <div className="mono" style={{ fontSize:9, color:p.color, marginBottom:4, letterSpacing:1 }}>HOW TO SIGN UP</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {p.steps.map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <span style={{ fontFamily:"DM Mono", fontSize:9, color:"white", fontWeight:600 }}>{i+1}</span>
                    </div>
                    <span style={{ fontFamily:"DM Sans", fontSize:"clamp(12px,1.8vw,13px)", color:"var(--muted)", lineHeight:1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,200px),1fr))", gap:10, marginBottom:14 }}>
              <div>
                {p.pros.map(pr => <div key={pr} style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", marginBottom:4, display:"flex", gap:6 }}><span style={{ color:"var(--green)", flexShrink:0 }}>✓</span>{pr}</div>)}
              </div>
              <div>
                {p.cons.map(co => <div key={co} style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", marginBottom:4, display:"flex", gap:6 }}><span style={{ color:"var(--muted2)", flexShrink:0 }}>–</span>{co}</div>)}
              </div>
            </div>

            <div style={{ fontFamily:"DM Sans", fontSize:"clamp(12px,2vw,14px)", color:"var(--text)", lineHeight:1.7, padding:"10px 14px", background:"var(--bg3)", borderRadius:8 }}>
              {p.verdict}
            </div>
          </div>
        ))}

        <div style={{ background:"var(--bg3)", borderRadius:14, padding:"16px 20px", marginBottom:32 }}>
          <p style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted2)", margin:0, lineHeight:1.7 }}>
            ⚠️ ETF.PLAN is not affiliated with any of these platforms and receives no commissions. All are regulated and have millions of users.
          </p>
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
