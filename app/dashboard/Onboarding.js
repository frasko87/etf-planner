// app/dashboard/Onboarding.js
// Fix: if(done) block moved BEFORE step 0 return so done screen always renders
"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { track } from "@/lib/analytics";

const STEPS = ["welcome", "amount", "risk", "confirm"];
const PROFILES = {
  conservative: { icon:"🛡️", label:"Conservative", rate:"~5%/yr", color:"#3b82f6", desc:"Bonds + dividend stocks. Closest to a savings account — but better.", etfs:["BND","SCHD","VTI","VOO"], allocs:[40,30,20,10], risk:"Very Low", gain5yr:{ 50:460,100:920,150:1379 }, port5yr:{ 50:3460,100:6920,150:10379 }, passive5yr:{ 50:173,100:346,150:519 } },
  balanced:     { icon:"⚖️", label:"Balanced",     rate:"~9%/yr", color:"#c9a84c", desc:"Growth ETFs + stable large caps. Our most popular plan.", etfs:["VOO","VTI","QQQ","SCHD"], allocs:[40,25,25,10], risk:"Low–Med", gain5yr:{ 50:799,100:1599,150:2398 }, port5yr:{ 50:3799,100:7599,150:11398 }, passive5yr:{ 50:342,100:684,150:1026 } },
  aggressive:   { icon:"🚀", label:"Aggressive",   rate:"~16%/yr", color:"#ff4757", desc:"High-growth ETFs including leveraged positions. More upside, more volatility.", etfs:["QQQ","VGT","TQQQ","ARKK"], allocs:[35,25,25,15], risk:"Medium", gain5yr:{ 50:1612,100:3225,150:4837 }, port5yr:{ 50:4612,100:9225,150:13837 }, passive5yr:{ 50:738,100:1476,150:2214 } },
};

const fmt = n => n != null ? n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}) : "—";

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(100);
  const [profile, setProfile] = useState("balanced");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const supabase = createClient();
  const pc = PROFILES[profile];

  const handleComplete = async () => {
    setSaving(true); setError("");
    try {
      const monthKey = new Date().toISOString().slice(0,7);
      const { error: planErr } = await supabase.from("user_plans").upsert({ user_id:user.id, profile, amount, started_at:new Date().toISOString(), updated_at:new Date().toISOString() });
      if (planErr) throw planErr;
      const { error: actionErr } = await supabase.from("user_monthly_actions").upsert({ user_id:user.id, month_key:monthKey, profile, amount, tickers:pc.etfs, allocations:Object.fromEntries(pc.etfs.map((t,i)=>[t,pc.allocs[i]||Math.floor(100/pc.etfs.length)])), entry_prices:{}, amounts_invested:Object.fromEntries(pc.etfs.map((t,i)=>[t,Math.round(amount*(pc.allocs[i]||Math.floor(100/pc.etfs.length))/100)])) });
      if (actionErr) throw actionErr;
      if (typeof window !== "undefined" && window.fbq) window.fbq("track","CompleteRegistration",{content_name:`${profile}_${amount}`,currency:"USD",value:amount});
      const utms = typeof window !== "undefined" && window.getUTMParams ? window.getUTMParams() : {};
      if (Object.keys(utms).length > 0) await supabase.from("user_plans").update({utm_data:utms}).eq("user_id",user.id);
      if (utms.ref) await fetch("/api/referral",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:utms.ref,newUserId:user.id,newUserEmail:user.email})}).catch(()=>{});
      await supabase.from("email_preferences").upsert({email:user.email,user_id:user.id,unsubscribed:false,welcome_sent:false,source:"onboarding",subscribed_at:new Date().toISOString()},{onConflict:"email"});
      fetch("/api/send-welcome",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:user.id})}).catch(()=>{});
      track("onboarding_completed",{profile,amount});
      setDone(true); // ← FIXED: setDone(true) fires, then if(done) block below renders
    } catch(e) { setError(e.message||"Something went wrong. Please try again."); setSaving(false); }
  };

  const stepStyle = { minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px clamp(14px,4vw,40px)" };
  const card = { background:"white", border:"1px solid var(--border)", borderRadius:20, padding:"clamp(20px,5vw,40px) clamp(16px,4vw,40px)", boxShadow:"var(--shadow2)", width:"100%", maxWidth:520 };

  // ── Done screen — MUST be before step returns ──────────────────────────────
  if (done) {
    const annualPassive = { conservative:877, balanced:1755, aggressive:2632 }[profile] || 1755;
    const shareText = `I just set up my free ETF investment plan on ETF.PLAN 📊 Investing $${amount}/month in ${pc.label} ETFs. In 10 years this generates +$${annualPassive.toLocaleString()}/yr passively. Free plan → https://etfplan.app`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    return (
      <div style={stepStyle}>
        <div style={{...card,maxWidth:520,textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:16}}>✅</div>
          <div className="pixel" style={{fontSize:11,color:"var(--text)",marginBottom:16}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</div>
          <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(22px,4vw,30px)",color:"var(--text)",marginBottom:8,letterSpacing:"-0.5px"}}>Step 1 done. Now buy your ETFs.</h2>
          <p style={{fontFamily:"DM Sans",fontSize:15,color:"var(--muted)",lineHeight:1.7,marginBottom:20}}>Your {pc.icon} <strong>{pc.label} plan</strong> is set up. Next step is to actually buy the ETFs — takes 5 minutes on any free broker app.</p>
          <div style={{background:"var(--text)",borderRadius:14,padding:"20px",marginBottom:16,textAlign:"left"}}>
            <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:1,marginBottom:14}}>YOUR ACTION PLAN RIGHT NOW</div>
            {[
              { n:"1", t:"Open your broker app", d:"Robinhood, eToro, Interactive Brokers — all free. Don't have one? We'll show you.", link:"/guide/platforms", cta:"See platforms →" },
              { n:"2", t:"Buy these ETFs this month", d:`${pc.etfs.map((t,i)=>`${t} $${Math.round(amount*(pc.allocs[i]||25)/100)}`).join(" · ")}`, link:null, cta:null },
              { n:"3", t:"Come back and mark as bought", d:"Your dashboard tracks real gains from the moment you mark it. That's when the magic starts.", link:null, cta:null },
            ].map((s,i) => (
              <div key={i} style={{display:"flex",gap:14,marginBottom:i<2?14:0,paddingBottom:i<2?14:0,borderBottom:i<2?"1px solid rgba(255,255,255,0.06)":"none"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:"DM Mono",fontSize:11,color:"white",fontWeight:700}}>{s.n}</span></div>
                <div>
                  <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:14,color:"white",marginBottom:3}}>{s.t}</div>
                  <div style={{fontFamily:"DM Sans",fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.6}}>{s.d}</div>
                  {s.link && <a href={s.link} style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)",textDecoration:"none",marginTop:4,display:"inline-block"}}>{s.cta}</a>}
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"var(--bg3)",borderRadius:14,padding:"16px 20px",marginBottom:16,border:"1px solid var(--border)"}}>
            <p style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>💬 Know someone with money sitting in a savings account doing nothing?</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:8,fontFamily:"DM Sans",fontWeight:600,fontSize:14,color:"white",background:"#25d366",padding:"10px 20px",borderRadius:10,textDecoration:"none"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href={twitterUrl} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:8,fontFamily:"DM Sans",fontWeight:600,fontSize:14,color:"white",background:"#000",padding:"10px 20px",borderRadius:10,textDecoration:"none"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X / Twitter
              </a>
            </div>
          </div>
          <button onClick={() => onComplete({ profile, amount })} style={{width:"100%",padding:"16px 0",borderRadius:12,border:"none",background:"var(--green)",color:"white",fontFamily:"DM Sans",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,185,107,0.3)"}}>
            Go to my dashboard →
          </button>
          <p style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",textAlign:"center",marginTop:12}}>Not financial advice · Your plan is saved and ready</p>
        </div>
      </div>
    );
  }

  // ── Step 0: Welcome ────────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={stepStyle}>
      <div style={card}>
        <div className="pixel" style={{fontSize:11,color:"var(--text)",marginBottom:28}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</div>
        <div style={{background:"var(--text)",borderRadius:14,padding:"24px 20px",marginBottom:28,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>👋</div>
          <h1 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(22px,4vw,30px)",color:"white",marginBottom:10,letterSpacing:"-0.5px"}}>Welcome, {user?.email?.split("@")[0] || "investor"}</h1>
          <p style={{fontFamily:"DM Sans",fontSize:15,color:"rgba(255,255,255,0.55)",lineHeight:1.7,margin:0}}>Let's set up your personalised saving plan. It takes 2 minutes and your choices are saved — so every month you know exactly what to buy.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
          {[{icon:"📋",text:"Pick your monthly amount and risk level"},{icon:"📊",text:"We show exactly which ETFs to buy each month"},{icon:"📈",text:"Come back monthly to track your real results"}].map(s => (
            <div key={s.text} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"var(--bg3)",borderRadius:10}}>
              <span style={{fontSize:18}}>{s.icon}</span>
              <span style={{fontFamily:"DM Sans",fontSize:14,color:"var(--text)"}}>{s.text}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setStep(1)} style={{width:"100%",padding:"16px 0",borderRadius:12,border:"none",background:"var(--green)",color:"white",fontFamily:"DM Sans",fontWeight:700,fontSize:17,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,185,107,0.3)"}}>
          Let's set up my plan →
        </button>
      </div>
    </div>
  );

  // ── Step 1: Amount ─────────────────────────────────────────────────────────
  if (step === 1) return (
    <div style={stepStyle}>
      <div style={card}>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div className="pixel" style={{fontSize:11,color:"var(--text)"}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</div>
            <div className="mono" style={{fontSize:10,color:"var(--muted2)"}}>STEP 1 OF 3</div>
          </div>
          <div style={{height:3,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:"33%",background:"var(--green)",borderRadius:2}}/></div>
        </div>
        <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(22px,4vw,32px)",color:"var(--text)",marginBottom:8,letterSpacing:"-0.5px"}}>How much can you save each month?</h2>
        <p style={{fontFamily:"DM Sans",fontSize:15,color:"var(--muted)",marginBottom:28,lineHeight:1.7}}>This is what you'll contribute every month. You can change this any time.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
          {[50,100,150].map(v => (
            <button key={v} onClick={() => setAmount(v)} style={{padding:"18px 20px",borderRadius:14,cursor:"pointer",border:`2px solid ${amount===v?"var(--green)":"var(--border)"}`,background:amount===v?"rgba(0,185,107,0.04)":"white",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.15s",boxShadow:amount===v?"0 0 0 3px rgba(0,185,107,0.1)":"none"}}>
              <div style={{textAlign:"left"}}>
                <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:24,color:amount===v?"var(--text)":"var(--muted)"}}>${v}<span style={{fontFamily:"DM Mono",fontSize:12,fontWeight:400,opacity:0.5}}>/month</span></div>
                <div style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted2)",marginTop:2}}>${v*12}/year commitment</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:2}}>5yr balanced gain</div>
                <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:18,color:"var(--green)"}}>+{fmt(PROFILES.balanced.gain5yr[v])}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => { setStep(2); track("onboarding_step_1",{amount}); }} style={{width:"100%",padding:"16px 0",borderRadius:12,border:"none",background:"var(--text)",color:"white",fontFamily:"DM Sans",fontWeight:700,fontSize:16,cursor:"pointer"}}>Continue →</button>
      </div>
    </div>
  );

  // ── Step 2: Risk ───────────────────────────────────────────────────────────
  if (step === 2) return (
    <div style={stepStyle}>
      <div style={{...card,maxWidth:560}}>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div className="pixel" style={{fontSize:11,color:"var(--text)"}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</div>
            <div className="mono" style={{fontSize:10,color:"var(--muted2)"}}>STEP 2 OF 3</div>
          </div>
          <div style={{height:3,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:"66%",background:"var(--green)",borderRadius:2}}/></div>
        </div>
        <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(22px,4vw,32px)",color:"var(--text)",marginBottom:8,letterSpacing:"-0.5px"}}>Choose your risk level</h2>
        <p style={{fontFamily:"DM Sans",fontSize:15,color:"var(--muted)",marginBottom:24,lineHeight:1.7}}>All three plans beat a savings account. Conservative is the safest. You can change this any time.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
          {Object.entries(PROFILES).map(([key,p]) => {
            const active = profile === key;
            return (
              <button key={key} onClick={() => setProfile(key)} style={{padding:"18px 20px",borderRadius:14,cursor:"pointer",border:`2px solid ${active?p.color:"var(--border)"}`,background:active?`${p.color}08`:"white",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.15s",boxShadow:active?`0 4px 20px ${p.color}22`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`${p.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{p.icon}</div>
                  <div style={{textAlign:"left"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:17,color:active?"var(--text)":"var(--muted)"}}>{p.label}</span>
                      <span style={{fontFamily:"DM Mono",fontSize:10,padding:"2px 8px",borderRadius:6,background:`${p.color}12`,color:p.color}}>{p.rate}</span>
                    </div>
                    <div style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted2)"}}>{p.desc}</div>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:2}}>earns passively/yr after 5yr</div>
                  <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:20,color:p.color}}>+{fmt(p.passive5yr?.[amount]||Math.round(p.gain5yr[amount]*0.43))}/yr</div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={() => setStep(1)} style={{flex:1,padding:"14px 0",borderRadius:12,border:"1px solid var(--border)",background:"white",color:"var(--muted)",fontFamily:"DM Sans",fontSize:15,cursor:"pointer"}}>← Back</button>
          <button onClick={() => { setStep(3); track("onboarding_step_2",{profile,amount}); }} style={{flex:2,padding:"14px 0",borderRadius:12,border:"none",background:pc.color,color:"white",fontFamily:"DM Sans",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:`0 4px 16px ${pc.color}33`}}>Continue →</button>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Confirm ────────────────────────────────────────────────────────
  if (step === 3) return (
    <div style={stepStyle}>
      <div style={{...card,maxWidth:560}}>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div className="pixel" style={{fontSize:11,color:"var(--text)"}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</div>
            <div className="mono" style={{fontSize:10,color:"var(--muted2)"}}>STEP 3 OF 3</div>
          </div>
          <div style={{height:3,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:"100%",background:"var(--green)",borderRadius:2}}/></div>
        </div>
        <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(22px,4vw,32px)",color:"var(--text)",marginBottom:6,letterSpacing:"-0.5px"}}>Your plan is ready</h2>
        <p style={{fontFamily:"DM Sans",fontSize:15,color:"var(--muted)",marginBottom:24,lineHeight:1.7}}>Here's what you're committing to. We'll tell you exactly what to buy each month.</p>
        <div style={{background:"var(--text)",borderRadius:16,padding:"24px 20px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:6}}>YOUR PLAN</div>
              <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:24,color:"white"}}>{pc.icon} {pc.label}</div>
              <div style={{fontFamily:"DM Mono",fontSize:13,color:pc.color,marginTop:4}}>{pc.rate} target</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:6}}>MONTHLY</div>
              <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:28,color:"white"}}>${amount}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8,marginBottom:16}}>
            {[
              { l:"After 12 months", v:fmt((() => { const r=parseFloat(pc.rate.replace(/[^0-9.]/g,""))/100/12; let t=0; for(let i=0;i<12;i++) t=(t+amount)*(1+r); return t; })()) },
              { l:"Portfolio at 5yr", v:fmt(pc.port5yr?.[amount]||pc.gain5yr[amount]+amount*60) },
              { l:"Earns passively/yr", v:"+"+fmt(pc.passive5yr?.[amount]||Math.round(pc.gain5yr[amount]*0.43)) },
            ].map(s => (
              <div key={s.l} style={{background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div className="mono" style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:4}}>{s.l.toUpperCase()}</div>
                <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:15,color:"white"}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="mono" style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:8}}>THIS MONTH YOU'LL BUY</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {pc.etfs.map((t,i) => {
                const names = {VOO:"S&P 500",VTI:"Total Market",QQQ:"Nasdaq-100",SCHD:"Dividends",BND:"Bonds",VGT:"Tech",TQQQ:"3x Nasdaq",ARKK:"Innovation"};
                return (
                  <div key={t} style={{background:"rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                    <div><span style={{fontFamily:"DM Mono",fontSize:12,color:"white",fontWeight:600}}>{t}</span><span style={{fontFamily:"DM Sans",fontSize:10,color:"rgba(255,255,255,0.35)",marginLeft:6}}>{names[t]||""}</span></div>
                    <span style={{fontFamily:"DM Mono",fontSize:12,color:pc.color,fontWeight:600}}>${Math.round(amount*(pc.allocs[i]||Math.floor(100/pc.etfs.length))/100)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{background:"var(--bg3)",borderRadius:12,padding:"16px",marginBottom:24}}>
          <div className="mono" style={{fontSize:10,color:"var(--muted2)",marginBottom:10,letterSpacing:1}}>WHAT HAPPENS NEXT</div>
          {["Open your broker app (Robinhood, eToro, etc.)","Buy the ETFs shown above with the amounts listed","Come back next month — we'll show your real results + new picks"].map((s,i) => (
            <div key={i} style={{display:"flex",gap:12,marginBottom:i<2?8:0}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontFamily:"DM Mono",fontSize:9,color:"white"}}>{i+1}</span></div>
              <span style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",lineHeight:1.6}}>{s}</span>
            </div>
          ))}
        </div>
        {error && <div style={{padding:"10px 14px",background:"var(--red2)",border:"1px solid rgba(232,64,64,0.2)",borderRadius:8,marginBottom:16,fontFamily:"DM Sans",fontSize:13,color:"var(--red)"}}>{error}</div>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={() => setStep(2)} style={{flex:1,padding:"14px 0",borderRadius:12,border:"1px solid var(--border)",background:"white",color:"var(--muted)",fontFamily:"DM Sans",fontSize:15,cursor:"pointer"}}>← Back</button>
          <button onClick={handleComplete} disabled={saving} style={{flex:2,padding:"16px 0",borderRadius:12,border:"none",background:saving?"var(--border)":"var(--green)",color:saving?"var(--muted)":"white",fontFamily:"DM Sans",fontWeight:700,fontSize:16,cursor:saving?"not-allowed":"pointer",boxShadow:saving?"none":"0 4px 20px rgba(0,185,107,0.3)"}}>
            {saving ? "Saving your plan…" : "Start my plan →"}
          </button>
        </div>
        <p style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",textAlign:"center",marginTop:14}}>Not financial advice · You can change your plan any time</p>
      </div>
    </div>
  );

  return null;
}
