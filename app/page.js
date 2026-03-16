"use client";
import Link from "next/link";
import { useState } from "react";

// Returns for $50/$100/$150 at ~9% balanced rate (1mo/6mo/12mo)
const PROJECTIONS = {
  50:  { r1:"$50",   g1:"+$0",  r6:"$308",  g6:"+$8",   r12:"$628",  g12:"+$28"  },
  100: { r1:"$101",  g1:"+$1",  r6:"$617",  g6:"+$17",  r12:"$1,256", g12:"+$56" },
  150: { r1:"$151",  g1:"+$1",  r6:"$926",  g6:"+$26",  r12:"$1,884", g12:"+$84" },
};

// Savings comparison — what your money does in each vehicle
const SAVINGS_COMPARE = [
  { label:"Regular savings account", rate:"0.5%",  y1:"$1,203",  y5:"$6,152",  y10:"$12,558", color:"rgba(255,255,255,0.25)", dim:true  },
  { label:"High-yield savings",       rate:"4.5%",  y1:"$1,230",  y5:"$6,642",  y10:"$15,103", color:"rgba(255,255,255,0.4)",  dim:true  },
  { label:"Conservative ETF plan",    rate:"~5%",   y1:"$1,233",  y5:"$6,800",  y10:"$15,528", color:"#60a5fa",               dim:false },
  { label:"Balanced ETF plan",        rate:"~9%",   y1:"$1,256",  y5:"$7,597",  y10:"$19,351", color:"#00b96b",               dim:false },
];

const PLANS = [
  { icon:"🛡️", name:"Conservative",  rate:"~5%/yr",  desc:"Similar to a high-yield savings, but slightly better. Bonds + dividend stocks.",  color:"#3b82f6", risk:"Very Low"  },
  { icon:"⚖️", name:"Balanced",       rate:"7–12%/yr", desc:"The sweet spot. Steady growth, manageable risk. Our most popular plan.",          color:"#c9a84c", risk:"Low–Med"  },
  { icon:"🚀", name:"Aggressive",     rate:"12%+/yr",  desc:"Growth-focused. Higher upside but more volatility month to month.",               color:"#ff4757", risk:"Medium"   },
];

const WHY_ETFS = [
  { icon:"🏦", title:"Not gambling — it's structured saving", desc:"ETFs hold hundreds of companies at once. If one fails, others cover it. It's the opposite of betting on a single stock." },
  { icon:"📈", title:"Historically beats inflation every year",  desc:"The S&P 500 has averaged 10–13% annually for decades. Inflation is 2–3%. ETFs are one of the few ways to actually grow your money in real terms." },
  { icon:"🔒", title:"Low fees, fully regulated",              desc:"Broad market ETFs charge as little as 0.03%/year. That's $0.30 per $1,000. Compared to managed funds that take 1–2%, you keep almost everything you earn." },
  { icon:"⏰", title:"Set it once, grow every month",          desc:"You don't need to watch the market. Buy once a month, hold. Our engine picks the ETFs — you just contribute and let time do the work." },
];

const ETFS = [
  { ticker:"QQQ",  name:"Nasdaq-100",   ret:"+18.0%", color:"#8b5cf6", risk:"Med", positive:true  },
  { ticker:"VTI",  name:"Total Market", ret:"+13.5%", color:"#00b96b", risk:"Low", positive:true  },
  { ticker:"VOO",  name:"S&P 500",      ret:"+13.2%", color:"#3b82f6", risk:"Low", positive:true  },
  { ticker:"SCHD", name:"Dividends",    ret:"+12.0%", color:"#c9a84c", risk:"Low", positive:true  },
];

const tape = [...ETFS,...ETFS,...ETFS];

export default function HomePage() {
  const [amount, setAmount] = useState(100);
  const p = PROJECTIONS[amount];

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 clamp(16px,4vw,40px)",height:60,background:"rgba(248,248,245,0.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:100}}>
        <Link href="/" className="pixel" style={{fontSize:11,color:"var(--text)"}}>
          ETF<span style={{color:"var(--green)"}}>.</span>PLAN
        </Link>
        <div style={{display:"flex",gap:"clamp(4px,2vw,20px)",alignItems:"center"}}>
          <Link href="/learn" style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",padding:"8px 4px"}}>What are ETFs?</Link>
          <Link href="/login" style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",padding:"8px 4px"}}>Log in</Link>
          <Link href="/login?mode=signup" style={{fontFamily:"DM Sans",fontWeight:600,fontSize:13,color:"white",background:"var(--green)",padding:"9px clamp(12px,2vw,20px)",borderRadius:8}}>
            Start saving free →
          </Link>
        </div>
      </nav>

      {/* ── Ticker tape ─────────────────────────────────────────────────────── */}
      <div style={{overflow:"hidden",background:"var(--text)",padding:"9px 0"}}>
        <div style={{display:"flex",gap:40,animation:"ticker 28s linear infinite",width:"max-content"}}>
          {tape.map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap"}}>
              <span className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:0.5}}>{e.ticker}</span>
              <span className="mono" style={{fontSize:11,color:e.positive!==false?"#00ff88":"#ff6b6b",fontWeight:500}}>{e.ret}</span>
              <span className="mono" style={{fontSize:9,color:"rgba(255,255,255,0.15)"}}>|</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{textAlign:"center",padding:"clamp(52px,9vw,100px) clamp(16px,4vw,20px) clamp(40px,6vw,72px)",maxWidth:740,margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--green2)",border:"1px solid rgba(0,185,107,0.25)",borderRadius:100,padding:"6px 16px",marginBottom:24}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span className="mono" style={{fontSize:10,color:"var(--green)"}}>LIVE MARKET DATA · ETFs TRACKED DAILY</span>
        </div>

        <h1 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(36px,8vw,72px)",color:"var(--text)",lineHeight:1.0,letterSpacing:"-2.5px",marginBottom:24}}>
          Your savings account<br/>
          <span style={{color:"var(--green)"}}>is losing the game.</span>
        </h1>

        <p style={{fontFamily:"DM Sans",fontWeight:300,fontSize:"clamp(16px,2.5vw,20px)",color:"var(--muted)",lineHeight:1.8,maxWidth:520,margin:"0 auto 16px"}}>
          While your money sits in a savings account earning 0.5–4%, ETF plans have historically returned 9–13% per year. That's not a risk — that's 50 years of data.
        </p>
        <p style={{fontFamily:"DM Sans",fontWeight:500,fontSize:"clamp(14px,2vw,17px)",color:"var(--text)",marginBottom:36}}>
          We build your personalised plan. You contribute from <strong>$50/month</strong>.
        </p>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:16,padding:"0 clamp(0px,2vw,20px)"}}>
          <Link href="/login?mode=signup" style={{display:"inline-block",fontFamily:"DM Sans",fontWeight:700,fontSize:16,color:"white",background:"var(--green)",padding:"15px clamp(24px,4vw,40px)",borderRadius:12,boxShadow:"0 4px 24px rgba(0,185,107,0.35)"}}>
            Start saving smarter — free →
          </Link>
          <Link href="/learn" style={{display:"inline-block",fontFamily:"DM Sans",fontWeight:400,fontSize:15,color:"var(--text)",background:"white",border:"1px solid var(--border)",padding:"15px clamp(16px,3vw,28px)",borderRadius:12,boxShadow:"var(--shadow)"}}>
            How does it work?
          </Link>
        </div>
        <p className="mono" style={{fontSize:11,color:"var(--muted2)"}}>
          Free forever · No credit card · 2 min setup
        </p>
      </section>

      {/* ── The big comparison ──────────────────────────────────────────────── */}
      <section style={{padding:"0 clamp(16px,4vw,20px) clamp(52px,7vw,80px)",maxWidth:820,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="mono" style={{fontSize:11,color:"var(--muted)",marginBottom:12,letterSpacing:1}}>THE NUMBERS DON'T LIE</div>
          <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(26px,5vw,44px)",color:"var(--text)",letterSpacing:"-1px",lineHeight:1.1}}>
            What happens to $100/month<br/>over time?
          </h2>
        </div>

        <div style={{background:"var(--text)",borderRadius:20,padding:"clamp(20px,4vw,40px)",overflowX:"auto"}}>
          {/* Header row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr repeat(3,minmax(55px,80px))",gap:8,marginBottom:16,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            <div/>
            {["1 year","5 years","10 years"].map(h=>(
              <div key={h} className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"right"}}>{h}</div>
            ))}
          </div>

          {/* Data rows */}
          {SAVINGS_COMPARE.map((row,i)=>(
            <div key={row.label} style={{display:"grid",gridTemplateColumns:"1fr repeat(3,minmax(55px,80px))",gap:8,padding:"clamp(12px,2vw,16px) 0",borderBottom:i<SAVINGS_COMPARE.length-1?"1px solid rgba(255,255,255,0.06)":"none",alignItems:"center",background:!row.dim?"rgba(0,185,107,0.04)":"transparent",marginLeft:row.dim?0:-8,marginRight:row.dim?0:-8,paddingLeft:row.dim?0:8,paddingRight:row.dim?0:8,borderRadius:row.dim?0:8}}>
              <div>
                <div style={{fontFamily:"DM Sans",fontWeight:row.dim?400:600,fontSize:"clamp(12px,2vw,14px)",color:row.dim?"rgba(255,255,255,0.4)":row.color,marginBottom:2}}>{row.label}</div>
                <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.2)"}}>{row.rate} avg annual</div>
              </div>
              {[row.y1,row.y5,row.y10].map((v,j)=>(
                <div key={j} style={{fontFamily:"DM Sans",fontWeight:row.dim?400:700,fontSize:row.dim?"clamp(13px,2.5vw,16px)":"clamp(15px,3vw,20px)",color:row.dim?"rgba(255,255,255,0.3)":row.color,textAlign:"right"}}>{v}</div>
              ))}
            </div>
          ))}

          <p className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:16}}>
            Based on historical averages · Past performance ≠ future results · Not financial advice
          </p>
        </div>

        <div style={{textAlign:"center",marginTop:20}}>
          <Link href="/login?mode=signup" style={{display:"inline-block",fontFamily:"DM Sans",fontWeight:600,fontSize:15,color:"white",background:"var(--green)",padding:"13px 28px",borderRadius:10,boxShadow:"0 4px 16px rgba(0,185,107,0.3)"}}>
            Get my personalised plan →
          </Link>
        </div>
      </section>

      {/* ── Why ETFs = smart saving ─────────────────────────────────────────── */}
      <section style={{padding:"0 clamp(16px,4vw,20px) clamp(52px,7vw,80px)",maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div className="mono" style={{fontSize:11,color:"var(--muted)",marginBottom:12,letterSpacing:1}}>WHY IT WORKS</div>
          <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(24px,4vw,40px)",color:"var(--text)",letterSpacing:"-0.5px"}}>
            This isn't gambling. It's structured saving.
          </h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))",gap:14}}>
          {WHY_ETFS.map(w=>(
            <div key={w.title} style={{background:"white",border:"1px solid var(--border)",borderRadius:16,padding:"clamp(18px,3vw,24px)",boxShadow:"var(--shadow)"}}>
              <div style={{fontSize:28,marginBottom:14}}>{w.icon}</div>
              <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:"clamp(13px,2vw,15px)",color:"var(--text)",marginBottom:8,lineHeight:1.4}}>{w.title}</div>
              <div style={{fontFamily:"DM Sans",fontSize:"clamp(12px,1.8vw,13px)",color:"var(--muted)",lineHeight:1.7}}>{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live preview calculator ─────────────────────────────────────────── */}
      <section style={{padding:"0 clamp(16px,4vw,20px) clamp(52px,7vw,80px)",maxWidth:600,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div className="mono" style={{fontSize:11,color:"var(--muted)",marginBottom:12,letterSpacing:1}}>YOUR NUMBERS</div>
          <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(22px,4vw,38px)",color:"var(--text)",letterSpacing:"-0.5px"}}>
            How much could you save?
          </h2>
        </div>

        <div style={{background:"white",border:"1px solid var(--border)",borderRadius:20,padding:"clamp(22px,4vw,32px)",boxShadow:"var(--shadow2)"}}>
          <p style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",marginBottom:12,textAlign:"center"}}>
            How much can you put aside each month?
          </p>

          {/* Amount selector */}
          <div style={{display:"flex",gap:8,background:"var(--bg3)",borderRadius:12,padding:4,marginBottom:24}}>
            {[50,100,150].map(v=>(
              <button key={v} onClick={()=>setAmount(v)} style={{
                flex:1, padding:"clamp(11px,2vw,14px) 0", borderRadius:9, border:"none", cursor:"pointer",
                transition:"all 0.15s",
                background: amount===v ? "white" : "transparent",
                color:      amount===v ? "var(--text)" : "var(--muted)",
                fontFamily:"DM Sans", fontWeight: amount===v ? 700 : 400,
                fontSize:"clamp(16px,3vw,21px)",
                boxShadow:  amount===v ? "var(--shadow)" : "none",
              }}>
                ${v}<span style={{fontFamily:"DM Mono",fontSize:"clamp(9px,1.5vw,10px)",opacity:0.45}}>/mo</span>
              </button>
            ))}
          </div>

          {/* 1 / 6 / 12 month results */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"clamp(4px,2vw,10px)",marginBottom:20}}>
            {[
              {l:"1 month",  v:p.r1,  g:p.g1,  accent:false},
              {l:"6 months", v:p.r6,  g:p.g6,  accent:false},
              {l:"12 months",v:p.r12, g:p.g12, accent:true },
            ].map(x=>(
              <div key={x.l} style={{
                background: x.accent ? "var(--text)" : "var(--bg3)",
                borderRadius:12,
                padding:"clamp(12px,2.5vw,18px) clamp(8px,2vw,12px)",
                textAlign:"center",
                border: x.accent ? "none" : "1px solid var(--border)",
              }}>
                <div style={{fontFamily:"DM Sans",fontSize:"clamp(10px,1.8vw,12px)",color:x.accent?"rgba(255,255,255,0.5)":"var(--muted)",marginBottom:6}}>{x.l}</div>
                <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(18px,4vw,28px)",color:x.accent?"white":"var(--text)",letterSpacing:"-0.5px",lineHeight:1.1}}>{x.v}</div>
                <div className="mono" style={{fontSize:"clamp(9px,1.5vw,11px)",color:"var(--green)",marginTop:5}}>{x.g}</div>
              </div>
            ))}
          </div>

          {/* Plan context */}
          <div style={{padding:"12px 16px",background:"var(--green2)",borderRadius:10,border:"1px solid rgba(0,185,107,0.2)",marginBottom:20}}>
            <p style={{fontFamily:"DM Sans",fontSize:"clamp(11px,1.8vw,13px)",color:"var(--green)",margin:0,lineHeight:1.7}}>
              📊 Balanced plan · ~9% annual return target · <strong>We show you exactly what to buy.</strong> You execute on <a href="/learn#platforms" style={{color:"var(--green)",fontWeight:600}}>one of our recommended platforms</a> — takes 5 minutes.
            </p>
          </div>

          <Link href="/login?mode=signup" style={{display:"block",textAlign:"center",fontFamily:"DM Sans",fontWeight:700,fontSize:16,color:"white",background:"var(--green)",padding:"15px 0",borderRadius:10,boxShadow:"0 4px 16px rgba(0,185,107,0.3)"}}>
            Build my free saving plan →
          </Link>
        </div>
      </section>

      {/* ── 3 Plans ─────────────────────────────────────────────────────────── */}
      <section style={{padding:"0 clamp(16px,4vw,20px) clamp(52px,7vw,80px)",maxWidth:820,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="mono" style={{fontSize:11,color:"var(--muted)",marginBottom:12,letterSpacing:1}}>THREE RISK LEVELS</div>
          <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(24px,4vw,40px)",color:"var(--text)",letterSpacing:"-0.5px"}}>
            Pick the plan that fits you
          </h2>
          <p style={{fontFamily:"DM Sans",fontSize:15,color:"var(--muted)",marginTop:10,lineHeight:1.7}}>
            All three beat a regular savings account. Conservative is the closest to "risk-free."
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))",gap:14}}>
          {PLANS.map(plan=>(
            <div key={plan.name} style={{background:"white",border:`2px solid ${plan.color}22`,borderRadius:16,padding:"clamp(20px,3vw,28px)",boxShadow:"var(--shadow)",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12}}>{plan.icon}</div>
              <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:20,color:"var(--text)",marginBottom:4}}>{plan.name}</div>
              <div style={{fontFamily:"DM Mono",fontSize:13,color:plan.color,fontWeight:600,marginBottom:10}}>{plan.rate}</div>
              <div style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",lineHeight:1.7,marginBottom:16}}>{plan.desc}</div>
              <div style={{display:"inline-block",fontFamily:"DM Mono",fontSize:10,padding:"4px 10px",borderRadius:6,background:`${plan.color}10`,color:plan.color}}>
                {plan.risk} risk
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:20}}>
          <Link href="/login?mode=signup" style={{display:"inline-block",fontFamily:"DM Sans",fontWeight:600,fontSize:15,color:"white",background:"var(--text)",padding:"13px 28px",borderRadius:10}}>
            See which plan fits me →
          </Link>
        </div>
      </section>

      {/* ── ETF strip ───────────────────────────────────────────────────────── */}
      <section id="etfs" style={{padding:"0 clamp(16px,4vw,20px) clamp(40px,6vw,64px)",maxWidth:820,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div className="mono" style={{fontSize:11,color:"var(--muted)",marginBottom:10,letterSpacing:1.5}}>WHAT'S IN YOUR PLAN</div>
          <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(20px,3.5vw,30px)",color:"var(--text)",letterSpacing:"-0.5px",marginBottom:8}}>
            ETFs scored daily. Best ones picked for you.
          </h2>
          <p style={{fontFamily:"DM Sans",fontSize:"clamp(13px,2vw,15px)",color:"var(--muted)",lineHeight:1.7}}>
            Our engine runs every market close — allocations update based on real momentum data.
          </p>
        </div>
        {/* Fixed 4-column grid, always centered */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,170px),1fr))",gap:"clamp(8px,2vw,14px)"}}>
          {ETFS.map(etf=>(
            <div key={etf.ticker} style={{
              background:"white",
              border:`1.5px solid ${etf.color}33`,
              borderRadius:14,
              padding:"clamp(14px,2.5vw,20px)",
              boxShadow:"var(--shadow)",
              transition:"transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="var(--shadow2)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="var(--shadow)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span className="mono" style={{fontSize:"clamp(13px,2vw,15px)",color:etf.color,fontWeight:600}}>{etf.ticker}</span>
                <span className="mono" style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:`${etf.color}10`,color:etf.color,border:`1px solid ${etf.color}22`}}>{etf.risk}</span>
              </div>
              <div style={{fontFamily:"DM Sans",fontSize:"clamp(11px,1.8vw,13px)",color:"var(--muted)",marginBottom:10}}>{etf.name}</div>
              <div style={{height:1,background:"var(--border)",marginBottom:10}}/>
              <div className="mono" style={{fontSize:"clamp(12px,2vw,14px)",color:etf.positive!==false?"var(--green)":"#ff4757",fontWeight:600}}>{etf.ret}/yr</div>
              <div className="mono" style={{fontSize:9,color:"var(--muted2)",marginTop:2}}>10yr avg return</div>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginTop:14}}>
          Showing 4 of the best-performing tracked ETFs · Updated at NYSE open & close
        </p>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────────── */}
      <section style={{padding:"0 clamp(16px,4vw,20px) clamp(52px,7vw,80px)"}}>
        <div style={{background:"var(--text)",borderRadius:16,padding:"clamp(24px,4vw,36px)",maxWidth:820,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,140px),1fr))",gap:24,textAlign:"center"}}>
          {[
            {n:"Daily",  l:"ETF scoring engine"},
            {n:"$50",    l:"Minimum to start"},
            {n:"50yr+",  l:"of S&P 500 data"},
            {n:"Free",   l:"No credit card needed"},
          ].map(s=>(
            <div key={s.l}>
              <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(28px,5vw,38px)",color:"var(--green)",lineHeight:1}}>{s.n}</div>
              <div style={{fontFamily:"DM Sans",fontSize:13,color:"rgba(255,255,255,0.45)",marginTop:6}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Learn CTA ───────────────────────────────────────────────────────── */}
      <section style={{padding:"0 clamp(16px,4vw,20px) clamp(52px,7vw,80px)",maxWidth:700,margin:"0 auto"}}>
        <Link href="/learn" style={{display:"block",textDecoration:"none"}}>
          <div style={{
            background:"var(--text)",borderRadius:20,
            padding:"clamp(28px,4vw,40px) clamp(24px,4vw,36px)",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            gap:20,flexWrap:"wrap",cursor:"pointer",minHeight:100,
            border:"1px solid rgba(255,255,255,0.06)",
            transition:"transform 0.15s, box-shadow 0.15s",
            boxShadow:"0 4px 20px rgba(0,0,0,0.12)",
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.2)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.12)";}}>
            <div style={{flex:1}}>
              <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:1.5,marginBottom:10}}>BEFORE YOU INVEST</div>
              <h3 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(20px,4vw,30px)",color:"white",marginBottom:8,letterSpacing:"-0.5px",lineHeight:1.15}}>
                New to ETFs? Read this first.
              </h3>
              <p style={{fontFamily:"DM Sans",fontSize:"clamp(13px,2vw,15px)",color:"rgba(255,255,255,0.5)",lineHeight:1.7,margin:0}}>
                What they are, why they beat savings accounts, and exactly where to open an account — in plain English.
              </p>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flexShrink:0}}>
              <div style={{width:56,height:56,borderRadius:14,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
                📚
              </div>
              <span style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)",whiteSpace:"nowrap"}}>Read guide →</span>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section style={{padding:"0 clamp(16px,4vw,20px) clamp(72px,10vw,120px)"}}>
        <div style={{background:"var(--text)",borderRadius:24,padding:"clamp(44px,7vw,72px) clamp(24px,5vw,40px)",maxWidth:580,margin:"0 auto",textAlign:"center"}}>
          <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(28px,6vw,48px)",color:"white",marginBottom:14,letterSpacing:"-1px",lineHeight:1.05}}>
            Stop saving less.<br/>
            <span style={{color:"var(--green)"}}>Start saving smarter.</span>
          </h2>
          <p style={{fontFamily:"DM Sans",fontSize:15,color:"rgba(255,255,255,0.5)",marginBottom:32,lineHeight:1.7}}>
            Free account. No credit card. Your first plan in 2 minutes.
          </p>
          <Link href="/login?mode=signup" style={{display:"inline-block",fontFamily:"DM Sans",fontWeight:700,fontSize:17,color:"white",background:"var(--green)",padding:"16px clamp(28px,5vw,48px)",borderRadius:12,boxShadow:"0 6px 28px rgba(0,185,107,0.4)"}}>
            Create free account →
          </Link>
          <p className="mono" style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:16}}>
            Not financial advice · Past performance ≠ future results
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{borderTop:"1px solid var(--border)",padding:"24px clamp(16px,4vw,40px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <Link href="/" className="pixel" style={{fontSize:10,color:"var(--text)"}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</Link>
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
          <Link href="/learn" style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)"}}>What are ETFs?</Link>
          <Link href="/login" style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)"}}>Log in</Link>
          <Link href="/login?mode=signup" style={{fontFamily:"DM Sans",fontSize:13,color:"var(--green)",fontWeight:500}}>Start free →</Link>
        </div>
      </footer>

    </div>
  );
}
