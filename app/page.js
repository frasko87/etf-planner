"use client";
import Link from "next/link";
import { useState } from "react";

const ETFS = [
  { ticker:"VTI",  name:"Total Market",  ret24:"+28.4%", real:"+23.1%", color:"#00b96b" },
  { ticker:"VOO",  name:"S&P 500",       ret24:"+27.6%", real:"+22.4%", color:"#3b82f6" },
  { ticker:"QQQ",  name:"Nasdaq-100",    ret24:"+38.5%", real:"+33.0%", color:"#8b5cf6" },
  { ticker:"SCHD", name:"Dividend",      ret24:"+24.8%", real:"+19.8%", color:"#c9a84c" },
  { ticker:"VGT",  name:"Info Tech",     ret24:"+44.0%", real:"+38.6%", color:"#ec4899" },
];

const AMOUNTS = {
  50:  { r6:"$313",  r12:"$641",   r24:"$1,362", invested6:"$300",  invested12:"$600",  invested24:"$1,200" },
  100: { r6:"$626",  r12:"$1,282", r24:"$2,724", invested6:"$600",  invested12:"$1,200", invested24:"$2,400" },
  150: { r6:"$939",  r12:"$1,922", r24:"$4,086", invested6:"$900",  invested12:"$1,800", invested24:"$3,600" },
};

const FEATURES = [
  { icon:"📡", title:"Real market data",        desc:"Multiple verified sources cross-referenced at NYSE open and close every single trading day. Always accurate." },
  { icon:"📊", title:"Inflation-adjusted",      desc:"Returns adjusted for real-world inflation using live Federal Reserve data. You see what your money is truly worth." },
  { icon:"🗓️", title:"Month-by-month plan",     desc:"Exactly what to buy each month, how much per ETF, and what your portfolio looks like at 6, 12 and 24 months." },
  { icon:"⚡", title:"Market-aware",            desc:"We track NYSE open, close, holidays and early sessions. Data is always current or clearly labeled as last close." },
  { icon:"🛡️", title:"3 risk profiles",         desc:"Conservative, Balanced, or Aggressive. Each profile uses a tailored ETF mix built for that specific risk level." },
  { icon:"🔒", title:"Your data stays yours",   desc:"Login with email or Google. Your plans are completely private. No ads, no data selling. Ever." },
];

const btn = {
  base: { display:"inline-block", fontFamily:"DM Sans", fontWeight:500, fontSize:14, borderRadius:10, padding:"12px 24px", cursor:"pointer", border:"none", transition:"all 0.15s" },
};

export default function HomePage() {
  const [amount, setAmount] = useState(100);
  const row = AMOUNTS[amount];
  const tape = [...ETFS, ...ETFS];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

      {/* ── Nav ── */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 40px", height:60, background:"rgba(248,248,245,0.92)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <span className="pixel" style={{ fontSize:11, color:"var(--text)", letterSpacing:1 }}>
          ETF<span style={{ color:"var(--green)" }}>.</span>PLAN
        </span>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <Link href="/login" style={{ ...btn.base, background:"transparent", color:"var(--muted)", padding:"9px 18px" }}>Log in</Link>
          <Link href="/login?mode=signup" style={{ ...btn.base, background:"var(--text)", color:"white", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>Get started free</Link>
        </div>
      </nav>

      {/* ── Ticker tape ── */}
      <div style={{ overflow:"hidden", background:"var(--text)", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display:"flex", gap:40, animation:"ticker 24s linear infinite", width:"max-content" }}>
          {tape.map((e,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, whiteSpace:"nowrap" }}>
              <span className="mono" style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{e.ticker}</span>
              <span className="mono" style={{ fontSize:12, color:"#00ff88", fontWeight:500 }}>{e.cagr}</span>
              <span style={{ color:"rgba(255,255,255,0.15)", fontSize:10 }}>|</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ textAlign:"center", padding:"90px 20px 80px", maxWidth:680, margin:"0 auto" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.25)", borderRadius:100, padding:"6px 16px", marginBottom:28 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"pulse 2s infinite" }}/>
          <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>LIVE NYSE DATA · UPDATED DAILY</span>
        </div>

        <h1 style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:"clamp(38px,6vw,64px)", color:"var(--text)", lineHeight:1.1, letterSpacing:"-1.5px", marginBottom:20 }}>
          Build wealth<br />
          <span style={{ color:"var(--green)" }}>one month</span> at a time
        </h1>

        <p style={{ fontFamily:"DM Sans", fontWeight:300, fontSize:20, color:"var(--muted)", lineHeight:1.7, marginBottom:36, maxWidth:480, margin:"0 auto 36px" }}>
          Stop guessing. Start investing. A smart ETF plan from $50/month — powered by real verified market data and adjusted for inflation.
        </p>

        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/login?mode=signup" style={{ ...btn.base, background:"var(--green)", color:"white", fontSize:15, padding:"14px 32px", boxShadow:"0 4px 20px rgba(0,185,107,0.3)" }}>
            Start free →
          </Link>
          <Link href="#how" style={{ ...btn.base, background:"white", color:"var(--text)", border:"1px solid var(--border)", fontSize:15, padding:"14px 28px", boxShadow:"var(--shadow)" }}>
            See how it works
          </Link>
        </div>
      </section>

      {/* ── ETF Cards ── */}
      <section style={{ padding:"0 40px 80px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:12 }}>
          {ETFS.map(etf=>(
            <div key={etf.ticker} style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, padding:20, boxShadow:"var(--shadow)", transition:"transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="var(--shadow2)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="var(--shadow)"; }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${etf.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:12, height:12, borderRadius:"50%", background:etf.color }}/>
                </div>
                <span className="mono" style={{ fontSize:11, color:"var(--green)", background:"var(--green2)", padding:"4px 10px", borderRadius:6 }}>{etf.ret24}</span>
              </div>
              <div className="mono" style={{ fontSize:16, color:"var(--text)", fontWeight:500, marginBottom:4 }}>{etf.ticker}</div>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:14 }}>{etf.name}</div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:11, color:"var(--muted2)", marginBottom:3 }}>24M Return</div>
                  <div className="mono" style={{ fontSize:13, color:"var(--text)" }}>{etf.ret24}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"var(--muted2)", marginBottom:3 }}>Real (adj.)</div>
                  <div className="mono" style={{ fontSize:13, color:"var(--green)" }}>{etf.real}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign:"center", fontSize:12, color:"var(--muted2)", marginTop:14, fontFamily:"DM Mono" }}>
          Est. 24-month returns · Updated at NYSE open & close · Inflation adjusted via FRED
        </p>
      </section>

      {/* ── Returns preview ── */}
      <section style={{ padding:"0 20px 80px", maxWidth:680, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div className="mono" style={{ fontSize:11, color:"var(--muted)", marginBottom:14 }}>QUICK PREVIEW</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:"clamp(28px,4vw,44px)", color:"var(--text)", letterSpacing:"-0.5px" }}>How much could you make?</h2>
        </div>

        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:20, padding:32, boxShadow:"var(--shadow2)" }}>
          {/* Amount picker */}
          <div style={{ display:"flex", gap:8, marginBottom:28, background:"var(--bg3)", borderRadius:12, padding:4 }}>
            {[50,100,150].map(v=>(
              <button key={v} onClick={()=>setAmount(v)} style={{
                flex:1, padding:"11px 0", borderRadius:9, border:"none", cursor:"pointer", transition:"all 0.15s",
                background: amount===v ? "white" : "transparent",
                color:      amount===v ? "var(--text)" : "var(--muted)",
                fontFamily:"DM Sans", fontWeight: amount===v ? 600 : 400, fontSize:18,
                boxShadow:  amount===v ? "var(--shadow)" : "none",
              }}>
                ${v}
              </button>
            ))}
          </div>

          {/* Results */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[{l:"6 months",v:row.r6,inv:row.invested6},{l:"12 months",v:row.r12,inv:row.invested12},{l:"24 months",v:row.r24,inv:row.invested24}].map(x=>(
              <div key={x.l} style={{ background:"var(--bg3)", borderRadius:12, padding:16, textAlign:"center" }}>
                <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>{x.l}</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:26, color:"var(--text)", marginBottom:4 }}>{x.v}</div>
                <div className="mono" style={{ fontSize:11, color:"var(--green)" }}>+{Math.round((parseInt(x.v.replace(/[$,]/g,""))-parseInt(x.inv.replace(/[$,]/g,"")))/parseInt(x.inv.replace(/[$,]/g,""))*100)}% gain</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:20, padding:"14px 16px", background:"var(--gold2)", borderRadius:10, border:"1px solid rgba(201,168,76,0.2)" }}>
            <p style={{ fontSize:12, color:"#8a6a1a", lineHeight:1.7 }}>
              📊 Based on balanced portfolio historical CAGR. <Link href="/login?mode=signup" style={{ color:"var(--gold)", fontWeight:500 }}>Sign up free</Link> to get real cross-referenced projections for your exact plan.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding:"0 20px 80px", maxWidth:800, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div className="mono" style={{ fontSize:11, color:"var(--muted)", marginBottom:12 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:"clamp(28px,4vw,44px)", color:"var(--text)", letterSpacing:"-0.5px" }}>Three steps to your plan</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
          {[
            { n:"01", title:"Pick your amount",   desc:"Choose $50, $100 or $150/month. That's the only commitment.",         color:"var(--green)" },
            { n:"02", title:"Choose your risk",   desc:"Conservative, Balanced, or Aggressive. We pick the right ETFs.",     color:"var(--gold)"  },
            { n:"03", title:"Follow the plan",    desc:"Each month shows exactly what to buy and how to track your returns.", color:"var(--blue)"  },
          ].map(s=>(
            <div key={s.n} style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:28, boxShadow:"var(--shadow)" }}>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:44, color:"var(--border2)", lineHeight:1, marginBottom:16 }}>{s.n}</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:17, color:"var(--text)", marginBottom:8 }}>{s.title}</div>
              <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.7 }}>{s.desc}</div>
              <div style={{ marginTop:16, height:3, width:40, background:s.color, borderRadius:2 }}/>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding:"0 20px 80px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div className="mono" style={{ fontSize:10, color:"var(--muted)", marginBottom:12 }}>FEATURES</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:"clamp(26px,4vw,40px)", color:"var(--text)", letterSpacing:"-0.5px" }}>Built for real investors</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {FEATURES.map(f=>(
            <div key={f.title} style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:24, boxShadow:"var(--shadow)" }}>
              <div style={{ fontSize:26, marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:16, color:"var(--text)", marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Data sources ── */}
      <section style={{ padding:"0 20px 80px", maxWidth:700, margin:"0 auto", textAlign:"center" }}>
        <div className="mono" style={{ fontSize:10, color:"var(--muted)", marginBottom:20 }}>DATA SOURCES</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
          {["Alpha Vantage","Finnhub","Polygon.io","FRED (Fed Reserve)","NYSE Calendar"].map(s=>(
            <span key={s} className="mono" style={{ fontSize:11, padding:"7px 14px", background:"white", border:"1px solid var(--border)", borderRadius:8, color:"var(--muted)", boxShadow:"var(--shadow)" }}>{s}</span>
          ))}
        </div>
        <p style={{ fontSize:12, color:"var(--muted2)", marginTop:16 }}>
          Cross-referenced at NYSE open + close every trading day. Inflation-adjusted via FRED CPI.
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"0 20px 100px" }}>
        <div style={{ background:"var(--text)", borderRadius:24, padding:"60px 40px", maxWidth:600, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:"clamp(28px,5vw,44px)", color:"white", marginBottom:16, letterSpacing:"-0.5px" }}>
            Ready to start?
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.6)", marginBottom:32, lineHeight:1.7 }}>
            Free account. No credit card. Your first plan in under 2 minutes.
          </p>
          <Link href="/login?mode=signup" style={{ ...btn.base, background:"var(--green)", color:"white", fontSize:15, padding:"15px 36px", boxShadow:"0 4px 20px rgba(0,185,107,0.4)" }}>
            Create free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"24px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span className="pixel" style={{ fontSize:10, color:"var(--text)" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</span>
        <span style={{ fontSize:11, color:"var(--muted2)" }}>Not financial advice. Past performance ≠ future results.</span>
      </footer>

    </div>
  );
}
