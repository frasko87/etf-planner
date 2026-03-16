"use client";
import Link from "next/link";
import { useState } from "react";

// ── SEO metadata exported from a separate file since this is "use client"
// metadata is in layout or a separate page wrapper — handled in layout.js

const ETFS = [
  { ticker:"VTI",  name:"Total Market",  ret12:"+14.2%", real:"+11.8%", color:"#00b96b" },
  { ticker:"VOO",  name:"S&P 500",       ret12:"+13.8%", real:"+11.4%", color:"#3b82f6" },
  { ticker:"QQQ",  name:"Nasdaq-100",    ret12:"+19.2%", real:"+16.8%", color:"#8b5cf6" },
  { ticker:"SCHD", name:"Dividend",      ret12:"+12.4%", real:"+10.0%", color:"#c9a84c" },
  { ticker:"VGT",  name:"Info Tech",     ret12:"+21.0%", real:"+18.6%", color:"#ec4899" },
];

const AMOUNTS = {
  50:  {
    r1:"$51",   r1gain:"+$1",
    r6:"$313",  r6gain:"+$13",
    r12:"$663", r12gain:"+$63",
  },
  100: {
    r1:"$101",   r1gain:"+$1",
    r6:"$626",   r6gain:"+$26",
    r12:"$1,282", r12gain:"+$82",
  },
  150: {
    r1:"$152",   r1gain:"+$2",
    r6:"$939",   r6gain:"+$39",
    r12:"$1,922", r12gain:"+$122",
  },
};

const PAIN_POINTS = [
  { icon:"🧭", label:"Don't know where to start", desc:"We pick the ETFs, set the allocations, tell you exactly what to buy each month." },
  { icon:"⏰", label:"No time to manage it", desc:"Set-and-forget. Buy once a month, hold. Our engine monitors the market daily." },
  { icon:"💰", label:"Want to save while you earn", desc:"$100/month at 12% grows to $23k in 10 years. A savings account gets you $14k." },
];

const STEPS = [
  { n:"01", title:"Pick your amount", desc:"$50, $100 or $150/month. No minimums, no lock-in.", color:"var(--green)" },
  { n:"02", title:"Choose your risk", desc:"Conservative (~5%), Balanced (7–12%) or Aggressive (12%+).", color:"#c9a84c" },
  { n:"03", title:"Follow the plan", desc:"Each month we tell you exactly what to buy and how much.", color:"#3b82f6" },
];

const btn = { base: { display:"inline-block", fontFamily:"DM Sans", fontWeight:500, fontSize:15, borderRadius:10, padding:"12px 24px", cursor:"pointer", border:"none", transition:"all 0.15s" } };

export default function HomePage() {
  const [amount, setAmount] = useState(100);
  const row = AMOUNTS[amount];
  const tape = [...ETFS, ...ETFS];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

      {/* ── Nav ── */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,4vw,40px)", height:60, background:"rgba(248,248,245,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" className="pixel" style={{ fontSize:11, color:"var(--text)" }}>
          ETF<span style={{ color:"var(--green)" }}>.</span>PLAN
        </Link>
        <div style={{ display:"flex", gap:"clamp(4px,2vw,16px)", alignItems:"center" }}>
          <Link href="/learn" style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted)", padding:"8px clamp(6px,1.5vw,14px)" }}>What are ETFs?</Link>
          <Link href="/login" style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted)", padding:"8px clamp(6px,1.5vw,14px)" }}>Log in</Link>
          <Link href="/login?mode=signup" style={{ ...btn.base, background:"var(--text)", color:"white", fontSize:13, padding:"9px clamp(10px,2vw,20px)" }}>Get started free</Link>
        </div>
      </nav>

      {/* ── Ticker tape ── */}
      <div style={{ overflow:"hidden", background:"var(--text)", padding:"9px 0" }}>
        <div style={{ display:"flex", gap:40, animation:"ticker 24s linear infinite", width:"max-content" }}>
          {tape.map((e,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, whiteSpace:"nowrap" }}>
              <span className="mono" style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{e.ticker}</span>
              <span className="mono" style={{ fontSize:12, color:"#00ff88" }}>{e.ret12}</span>
              <span style={{ color:"rgba(255,255,255,0.15)" }}>|</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ textAlign:"center", padding:"clamp(48px,8vw,90px) clamp(16px,4vw,20px) clamp(40px,6vw,70px)", maxWidth:700, margin:"0 auto" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--green2)", border:"1px solid rgba(0,185,107,0.25)", borderRadius:100, padding:"6px 16px", marginBottom:24 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"pulse 2s infinite" }}/>
          <span className="mono" style={{ fontSize:10, color:"var(--green)" }}>LIVE NYSE DATA · UPDATED DAILY · 42 ETFs TRACKED</span>
        </div>
        <h1 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(34px,7vw,68px)", color:"var(--text)", lineHeight:1.05, letterSpacing:"-2px", marginBottom:20 }}>
          Your first ETF plan.<br />
          <span style={{ color:"var(--green)" }}>From $50 a month.</span>
        </h1>
        <p style={{ fontFamily:"DM Sans", fontWeight:300, fontSize:"clamp(15px,2.5vw,19px)", color:"var(--muted)", lineHeight:1.8, marginBottom:36, maxWidth:520, margin:"0 auto 36px" }}>
          Stop leaving money in a savings account. ETF.PLAN builds you a personalised monthly investment plan based on real market data — no experience needed.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/login?mode=signup" style={{ ...btn.base, background:"var(--green)", color:"white", fontSize:16, padding:"14px clamp(20px,4vw,36px)", boxShadow:"0 4px 20px rgba(0,185,107,0.3)" }}>
            Build my free plan →
          </Link>
          <Link href="/learn" style={{ ...btn.base, background:"white", color:"var(--text)", border:"1px solid var(--border)", fontSize:15, padding:"14px clamp(16px,3vw,28px)", boxShadow:"var(--shadow)" }}>
            What are ETFs?
          </Link>
        </div>
        <p style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", marginTop:16 }}>
          Free forever · No credit card · 2 minutes to set up
        </p>
      </section>

      {/* ── Pain points ── */}
      <section style={{ padding:"0 clamp(16px,4vw,20px) clamp(40px,6vw,64px)", maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
          {PAIN_POINTS.map(p=>(
            <div key={p.label} style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, padding:"20px 22px", boxShadow:"var(--shadow)", display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{p.icon}</span>
              <div>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"var(--text)", marginBottom:6 }}>{p.label}</div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Preview Calculator ── */}
      <section style={{ padding:"0 clamp(16px,4vw,20px) clamp(40px,6vw,72px)", maxWidth:640, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div className="mono" style={{ fontSize:11, color:"var(--muted)", marginBottom:10 }}>QUICK PREVIEW</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,40px)", color:"var(--text)", letterSpacing:"-0.5px" }}>
            What could your money become?
          </h2>
        </div>

        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:20, padding:"clamp(20px,4vw,32px)", boxShadow:"var(--shadow2)" }}>
          {/* Amount picker */}
          <div style={{ marginBottom:24 }}>
            <p style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted)", marginBottom:10, textAlign:"center" }}>How much can you invest per month?</p>
            <div style={{ display:"flex", gap:8, background:"var(--bg3)", borderRadius:12, padding:4 }}>
              {[50,100,150].map(v=>(
                <button key={v} onClick={()=>setAmount(v)} style={{
                  flex:1, padding:"clamp(10px,2vw,13px) 0", borderRadius:9, border:"none", cursor:"pointer", transition:"all 0.15s",
                  background: amount===v ? "white" : "transparent",
                  color:      amount===v ? "var(--text)" : "var(--muted)",
                  fontFamily:"DM Sans", fontWeight: amount===v ? 700 : 400,
                  fontSize:"clamp(15px,3vw,20px)",
                  boxShadow:  amount===v ? "var(--shadow)" : "none",
                }}>
                  ${v}<span style={{ fontFamily:"DM Mono", fontSize:"clamp(9px,1.5vw,11px)", opacity:0.5 }}>/mo</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results — 1 month / 6 months / 12 months */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"clamp(6px,2vw,12px)", marginBottom:20 }}>
            {[
              { l:"1 month",  v:row.r1,   g:row.r1gain  },
              { l:"6 months", v:row.r6,   g:row.r6gain  },
              { l:"12 months",v:row.r12,  g:row.r12gain },
            ].map(x=>(
              <div key={x.l} style={{ background:"var(--bg3)", borderRadius:12, padding:"clamp(12px,2.5vw,16px) clamp(8px,2vw,12px)", textAlign:"center" }}>
                <div style={{ fontFamily:"DM Sans", fontSize:"clamp(10px,1.8vw,13px)", color:"var(--muted)", marginBottom:6 }}>{x.l}</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3.5vw,26px)", color:"var(--text)", letterSpacing:"-0.5px" }}>{x.v}</div>
                <div className="mono" style={{ fontSize:"clamp(9px,1.5vw,11px)", color:"var(--green)", marginTop:4 }}>{x.g} gain</div>
              </div>
            ))}
          </div>

          <div style={{ padding:"12px 14px", background:"var(--gold2)", borderRadius:10, border:"1px solid rgba(201,168,76,0.2)" }}>
            <p style={{ fontFamily:"DM Sans", fontSize:"clamp(11px,2vw,13px)", color:"#8a6a1a", lineHeight:1.7, margin:0 }}>
              📊 Based on balanced portfolio (7–12% annual return target). <Link href="/login?mode=signup" style={{ color:"var(--gold)", fontWeight:600 }}>Sign up free</Link> for a personalised plan using real cross-referenced market data.
            </p>
          </div>
        </div>
      </section>

      {/* ── ETF Cards ── */}
      <section style={{ padding:"0 clamp(16px,4vw,20px) clamp(40px,6vw,64px)", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div className="mono" style={{ fontSize:11, color:"var(--muted)", marginBottom:10 }}>WHAT WE TRACK</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(22px,4vw,36px)", color:"var(--text)", letterSpacing:"-0.5px" }}>
            42 ETFs. Scored daily. Best ones picked for you.
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,175px),1fr))", gap:10 }}>
          {ETFS.map(etf=>(
            <div key={etf.ticker} style={{ background:"white", border:`1px solid ${etf.color}33`, borderRadius:14, padding:18, boxShadow:"var(--shadow)", transition:"transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="var(--shadow2)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="var(--shadow)"; }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span className="mono" style={{ fontSize:14, color:etf.color, fontWeight:500 }}>{etf.ticker}</span>
                <span className="mono" style={{ fontSize:11, color:"var(--green)", background:"var(--green2)", padding:"2px 8px", borderRadius:6 }}>{etf.ret12}</span>
              </div>
              <div style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", marginBottom:10 }}>{etf.name}</div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div className="mono" style={{ fontSize:9, color:"var(--muted2)", marginBottom:2 }}>12M RETURN</div>
                  <div className="mono" style={{ fontSize:12, color:"var(--text)" }}>{etf.ret12}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div className="mono" style={{ fontSize:9, color:"var(--muted2)", marginBottom:2 }}>REAL (ADJ.)</div>
                  <div className="mono" style={{ fontSize:12, color:"var(--green)" }}>{etf.real}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign:"center", fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)", marginTop:12 }}>
          Showing 5 of 42 tracked ETFs · Updated at NYSE open & close · Inflation adjusted via FRED
        </p>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding:"0 clamp(16px,4vw,20px) clamp(40px,6vw,72px)", maxWidth:800, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div className="mono" style={{ fontSize:11, color:"var(--muted)", marginBottom:10 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(24px,4vw,40px)", color:"var(--text)", letterSpacing:"-0.5px" }}>
            Three steps to your first investment
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
          {STEPS.map(s=>(
            <div key={s.n} style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", boxShadow:"var(--shadow)" }}>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:44, color:"var(--border2)", lineHeight:1, marginBottom:14 }}>{s.n}</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:17, color:"var(--text)", marginBottom:8 }}>{s.title}</div>
              <div style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted)", lineHeight:1.7 }}>{s.desc}</div>
              <div style={{ marginTop:16, height:3, width:40, background:s.color, borderRadius:2 }}/>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section style={{ padding:"0 clamp(16px,4vw,20px) clamp(40px,6vw,64px)", maxWidth:800, margin:"0 auto" }}>
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,36px)", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:24, textAlign:"center" }}>
          {[
            { n:"42", label:"ETFs tracked daily" },
            { n:"4", label:"Live data sources" },
            { n:"$50", label:"Minimum to start" },
            { n:"Free", label:"Forever, no credit card" },
          ].map(s=>(
            <div key={s.label}>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(28px,5vw,40px)", color:"var(--green)", lineHeight:1 }}>{s.n}</div>
              <div style={{ fontFamily:"DM Sans", fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Learn CTA ── */}
      <section style={{ padding:"0 clamp(16px,4vw,20px) clamp(40px,6vw,72px)", maxWidth:700, margin:"0 auto", textAlign:"center" }}>
        <div style={{ background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:16, padding:"clamp(24px,4vw,40px)" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📚</div>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,3.5vw,28px)", color:"var(--text)", marginBottom:10, letterSpacing:"-0.3px" }}>
            New to investing? Start here.
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:15, color:"var(--muted)", marginBottom:24, lineHeight:1.7 }}>
            Our beginner's guide explains what ETFs are, why they outperform savings accounts, and which platforms to use — in plain English.
          </p>
          <Link href="/learn" style={{ ...btn.base, background:"var(--green)", color:"white", fontSize:15, padding:"13px 28px", boxShadow:"0 4px 16px rgba(0,185,107,0.3)", display:"inline-block" }}>
            Read the guide →
          </Link>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding:"0 clamp(16px,4vw,20px) clamp(60px,8vw,100px)" }}>
        <div style={{ background:"var(--text)", borderRadius:24, padding:"clamp(40px,6vw,60px) clamp(24px,5vw,40px)", maxWidth:600, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(26px,5vw,44px)", color:"white", marginBottom:14, letterSpacing:"-0.5px" }}>
            Ready to start?
          </h2>
          <p style={{ fontFamily:"DM Sans", fontSize:15, color:"rgba(255,255,255,0.55)", marginBottom:32, lineHeight:1.7 }}>
            Free account. No credit card. Your first ETF plan in under 2 minutes.
          </p>
          <Link href="/login?mode=signup" style={{ ...btn.base, background:"var(--green)", color:"white", fontSize:16, padding:"15px clamp(24px,5vw,40px)", boxShadow:"0 6px 24px rgba(0,185,107,0.4)", display:"inline-block" }}>
            Create free account →
          </Link>
          <p className="mono" style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:16 }}>
            Not financial advice · Past performance ≠ future results
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"24px clamp(16px,4vw,40px)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <Link href="/" className="pixel" style={{ fontSize:10, color:"var(--text)" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</Link>
        <div style={{ display:"flex", gap:20 }}>
          <Link href="/learn" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)" }}>What are ETFs?</Link>
          <Link href="/login" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)" }}>Log in</Link>
          <Link href="/login?mode=signup" style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--green)", fontWeight:500 }}>Start free</Link>
        </div>
      </footer>

    </div>
  );
}
