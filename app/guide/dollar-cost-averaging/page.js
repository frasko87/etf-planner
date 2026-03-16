import Link from "next/link";

export const metadata = {
  title: "What is Dollar-Cost Averaging? The Strategy Behind ETF.PLAN | ETF.PLAN",
  description: "Why investing the same amount every month beats trying to time the market. Simple explanation with real numbers.",
};

export default function DCAGuide() {
  const TABLE = [
    { month:"Jan", price:500,  invested:100, shares:0.20, total:100  },
    { month:"Feb", price:450,  invested:100, shares:0.22, total:200  },
    { month:"Mar", price:380,  invested:100, shares:0.26, total:300  },
    { month:"Apr", price:420,  invested:100, shares:0.24, total:400  },
    { month:"May", price:480,  invested:100, shares:0.21, total:500  },
    { month:"Jun", price:530,  invested:100, shares:0.19, total:600  },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,4vw,40px)", height:60, background:"rgba(248,248,245,0.96)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" className="pixel" style={{ fontSize:11, color:"var(--text)", textDecoration:"none" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</Link>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <Link href="/dashboard?tab=library" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", textDecoration:"none", padding:"7px 14px", border:"1px solid var(--border)", borderRadius:8 }}>← Library</Link>
        </div>
      </nav>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"clamp(32px,6vw,64px) clamp(16px,4vw,24px) 80px" }}>

        <div style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", marginBottom:24 }}>
          <Link href="/dashboard?tab=library" style={{ color:"var(--muted2)", textDecoration:"none" }}>← Library</Link>
          <span style={{ margin:"0 8px" }}>→</span>
          <span>Dollar-cost averaging</span>
        </div>

        <div style={{ display:"inline-flex", gap:8, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:100, padding:"5px 14px", marginBottom:20 }}>
          <span className="mono" style={{ fontSize:10, color:"#8b5cf6" }}>STRATEGY · 4 MIN READ</span>
        </div>

        <h1 style={{ fontFamily:"DM Sans", fontWeight:800, fontSize:"clamp(28px,6vw,50px)", color:"var(--text)", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:16 }}>
          Why you should never try to time the market
        </h1>
        <p style={{ fontFamily:"DM Sans", fontSize:"clamp(15px,2.5vw,18px)", color:"var(--muted)", lineHeight:1.8, marginBottom:40 }}>
          Dollar-cost averaging is the strategy of investing the same amount every month — regardless of whether the market is up or down. It sounds boring. It's actually brilliant.
        </p>

        {/* The big idea */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,36px)", marginBottom:24 }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:14 }}>THE BIG IDEA</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3vw,28px)", color:"white", marginBottom:16, letterSpacing:"-0.5px" }}>
            When prices drop, you automatically buy more
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginBottom:16 }}>
            If you invest $100/month and VOO drops from $500 to $400, your $100 buys you <strong style={{ color:"white" }}>0.25 shares instead of 0.20</strong>. You get 25% more shares for the same money.
          </p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.6)", lineHeight:1.8 }}>
            When the market recovers, those extra shares you bought cheap are now worth more. <strong style={{ color:"#00ff88" }}>Market dips become opportunities.</strong>
          </p>
        </div>

        {/* Real example table */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:24, boxShadow:"var(--shadow)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(17px,3vw,22px)", color:"var(--text)", marginBottom:6 }}>Real example: $100/month into VOO</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted)", marginBottom:20 }}>Notice what happens in March when the price drops — you buy the most shares.</p>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--bg3)" }}>
                  {["Month","VOO Price","You invest","Shares bought","Total invested"].map(h => (
                    <th key={h} style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", padding:"10px 12px", textAlign:"left", letterSpacing:0.5, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE.map((row,i) => (
                  <tr key={row.month} style={{ borderBottom:"1px solid var(--bg3)", background:row.price===380?"rgba(0,185,107,0.04)":"transparent" }}>
                    <td style={{ fontFamily:"DM Sans", fontWeight:500, fontSize:14, padding:"10px 12px" }}>{row.month}</td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:row.price===380?"#ff4757":"var(--text)" }}>
                      ${row.price} {row.price===380 && <span style={{ fontSize:10, color:"var(--green)", marginLeft:4 }}>📉 dip!</span>}
                    </td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:"var(--text)" }}>${row.invested}</td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:row.price===380?"var(--green)":"var(--text)", fontWeight:row.price===380?700:400 }}>
                      {row.shares.toFixed(2)} {row.price===380 && "← most!"}
                    </td>
                    <td style={{ fontFamily:"DM Mono", fontSize:13, padding:"10px 12px", color:"var(--muted)" }}>${row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", marginTop:16, lineHeight:1.7 }}>
            After 6 months: <strong style={{ color:"var(--text)" }}>$600 invested</strong>, bought <strong style={{ color:"var(--text)" }}>1.32 shares</strong>. Average price paid: ~$455. If VOO is back to $530 after 6 months, your $600 is worth <strong style={{ color:"var(--green)" }}>$699</strong>.
          </p>
        </div>

        {/* DCA vs lump sum */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:24, boxShadow:"var(--shadow)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(17px,3vw,22px)", color:"var(--text)", marginBottom:16 }}>DCA vs "waiting for the right time"</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { strategy:"Wait for the dip", desc:"Most people waiting for 'the right time' wait too long and miss the gains entirely. Even professional investors can't consistently time the market.", result:"Usually worse", bad:true },
              { strategy:"Invest everything at once", desc:"Lump sum investing beats DCA 2/3 of the time historically — but requires you to have a large sum and the courage to invest it all at a market peak.", result:"Good if you have the money", bad:false },
              { strategy:"Dollar-cost averaging (DCA)", desc:"Investing a fixed amount monthly removes the timing decision entirely. You buy more when cheap, less when expensive — automatically. Proven to work for most people.", result:"Best for regular savers", bad:false },
            ].map(row => (
              <div key={row.strategy} style={{ border:`1px solid ${row.bad?"rgba(255,71,87,0.2)":"var(--border)"}`, borderRadius:12, padding:"16px", background:row.bad?"rgba(255,71,87,0.02)":"white" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, flexWrap:"wrap", gap:8 }}>
                  <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:"clamp(14px,2vw,15px)", color:"var(--text)" }}>{row.strategy}</div>
                  <div className="mono" style={{ fontSize:10, padding:"2px 10px", borderRadius:6, background:row.bad?"rgba(255,71,87,0.08)":"rgba(0,185,107,0.08)", color:row.bad?"#ff4757":"var(--green)", border:`1px solid ${row.bad?"rgba(255,71,87,0.2)":"rgba(0,185,107,0.2)"}` }}>{row.result}</div>
                </div>
                <div style={{ fontFamily:"DM Sans", fontSize:"clamp(12px,1.8vw,13px)", color:"var(--muted)", lineHeight:1.75 }}>{row.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The habit */}
        <div style={{ background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:14, padding:"clamp(18px,3vw,24px)", marginBottom:32 }}>
          <h3 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(16px,2.5vw,20px)", color:"var(--text)", marginBottom:12 }}>
            🔁 The most important habit: automate it
          </h3>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(13px,2vw,15px)", color:"var(--muted)", lineHeight:1.8, marginBottom:10 }}>
            Set up a recurring bank transfer to your broker on the 1st of every month. Then log in, buy your ETFs, log out.
          </p>
          <p style={{ fontFamily:"DM Sans", fontSize:"clamp(13px,2vw,15px)", color:"var(--muted)", lineHeight:1.8, margin:0 }}>
            <strong style={{ color:"var(--text)" }}>Total time per month: ~2 minutes.</strong> We'll email you a reminder with exactly what to buy.
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
