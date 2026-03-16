"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

const STEPS = ["welcome", "amount", "risk", "confirm"];

const PROFILES = {
  conservative: {
    icon:"🛡️", label:"Conservative", rate:"~5%/yr", color:"#3b82f6",
    desc:"Bonds + dividend stocks. Closest to a savings account — but better.",
    etfs:["BND","SCHD","VTI","VOO"],
    risk:"Very Low",
    gain5yr: { 50:460, 100:920, 150:1380 },
  },
  balanced: {
    icon:"⚖️", label:"Balanced", rate:"~9%/yr", color:"#c9a84c",
    desc:"Growth ETFs + stable large caps. Our most popular plan.",
    etfs:["VOO","VTI","QQQ","SCHD"],
    risk:"Low–Med",
    gain5yr: { 50:800, 100:1599, 150:2399 },
  },
  aggressive: {
    icon:"🚀", label:"Aggressive", rate:"~16%/yr", color:"#ff4757",
    desc:"High-growth ETFs including leveraged positions. More upside, more volatility.",
    etfs:["QQQ","VGT","TQQQ","ARKK"],
    risk:"Medium",
    gain5yr: { 50:1612, 100:3225, 150:4837 },
  },
};

const fmt = n => n != null ? n.toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 }) : "—";

export default function Onboarding({ user, onComplete }) {
  const [step,    setStep]    = useState(0);
  const [amount,  setAmount]  = useState(100);
  const [profile, setProfile] = useState("balanced");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const supabase = createClient();

  const pc = PROFILES[profile];

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      const monthKey = new Date().toISOString().slice(0, 7); // "2026-03"

      // Save user plan
      const { error: planErr } = await supabase
        .from("user_plans")
        .upsert({ user_id: user.id, profile, amount, updated_at: new Date().toISOString() });
      if (planErr) throw planErr;

      // Record this month's action
      const { error: actionErr } = await supabase
        .from("user_monthly_actions")
        .upsert({
          user_id:   user.id,
          month_key: monthKey,
          profile,
          amount,
          tickers:   pc.etfs,
          allocations: Object.fromEntries(
            pc.etfs.map((t, i) => [t, [40,30,20,10][i] || Math.floor(100/pc.etfs.length)])
          ),
          entry_prices: {},    // will be filled by fetchData on next run
          amounts_invested: Object.fromEntries(
            pc.etfs.map((t, i) => [t, Math.round(amount * ([40,30,20,10][i] || Math.floor(100/pc.etfs.length)) / 100)])
          ),
        });
      if (actionErr) throw actionErr;

      onComplete({ profile, amount });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const stepStyle = {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px clamp(16px,4vw,40px)",
  };

  const card = {
    background: "white",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "clamp(28px,5vw,48px)",
    boxShadow: "var(--shadow2)",
    width: "100%",
    maxWidth: 520,
  };

  // ── Step 0: Welcome ───────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={stepStyle}>
      <div style={card}>
        <div className="pixel" style={{ fontSize:11, color:"var(--text)", marginBottom:28 }}>
          ETF<span style={{ color:"var(--green)" }}>.</span>PLAN
        </div>
        <div style={{ background:"var(--text)", borderRadius:14, padding:"24px 20px", marginBottom:28, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>👋</div>
          <h1 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(22px,4vw,30px)", color:"white", marginBottom:10, letterSpacing:"-0.5px" }}>
            Welcome, {user?.email?.split("@")[0] || "investor"}
          </h1>
          <p style={{ fontFamily:"DM Sans", fontSize:15, color:"rgba(255,255,255,0.55)", lineHeight:1.7, margin:0 }}>
            Let's set up your personalised saving plan. It takes 2 minutes and your choices are saved — so every month you know exactly what to buy.
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
          {[
            { icon:"📋", text:"Pick your monthly amount and risk level" },
            { icon:"📊", text:"We show exactly which ETFs to buy each month" },
            { icon:"📈", text:"Come back monthly to track your real results" },
          ].map(s => (
            <div key={s.text} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"var(--bg3)", borderRadius:10 }}>
              <span style={{ fontSize:18 }}>{s.icon}</span>
              <span style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--text)" }}>{s.text}</span>
            </div>
          ))}
        </div>

        <button onClick={() => setStep(1)} style={{
          width:"100%", padding:"16px 0", borderRadius:12, border:"none",
          background:"var(--green)", color:"white", fontFamily:"DM Sans",
          fontWeight:700, fontSize:17, cursor:"pointer",
          boxShadow:"0 4px 20px rgba(0,185,107,0.3)",
        }}>
          Let's set up my plan →
        </button>
      </div>
    </div>
  );

  // ── Step 1: Amount ────────────────────────────────────────────────────────
  if (step === 1) return (
    <div style={stepStyle}>
      <div style={card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
          <div className="pixel" style={{ fontSize:11, color:"var(--text)" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</div>
          <div className="mono" style={{ fontSize:10, color:"var(--muted2)" }}>STEP 1 OF 3</div>
        </div>

        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(22px,4vw,32px)", color:"var(--text)", marginBottom:8, letterSpacing:"-0.5px" }}>
          How much can you save each month?
        </h2>
        <p style={{ fontFamily:"DM Sans", fontSize:15, color:"var(--muted)", marginBottom:28, lineHeight:1.7 }}>
          This is what you'll contribute every month. You can change this any time.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
          {[50,100,150].map(v => (
            <button key={v} onClick={() => setAmount(v)} style={{
              padding:"18px 20px", borderRadius:14, cursor:"pointer",
              border:`2px solid ${amount===v?"var(--green)":"var(--border)"}`,
              background: amount===v ? "rgba(0,185,107,0.04)" : "white",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              transition:"all 0.15s",
              boxShadow: amount===v ? "0 0 0 3px rgba(0,185,107,0.1)" : "none",
            }}>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:24, color: amount===v ? "var(--text)" : "var(--muted)" }}>
                  ${v}<span style={{ fontFamily:"DM Mono", fontSize:12, fontWeight:400, opacity:0.5 }}>/month</span>
                </div>
                <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted2)", marginTop:2 }}>
                  ${v * 12}/year commitment
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", marginBottom:2 }}>5yr balanced gain</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:18, color:"var(--green)" }}>
                  +{fmt(PROFILES.balanced.gain5yr[v])}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => setStep(2)} style={{
          width:"100%", padding:"16px 0", borderRadius:12, border:"none",
          background:"var(--text)", color:"white", fontFamily:"DM Sans",
          fontWeight:700, fontSize:16, cursor:"pointer",
        }}>
          Continue →
        </button>
      </div>
    </div>
  );

  // ── Step 2: Risk ──────────────────────────────────────────────────────────
  if (step === 2) return (
    <div style={stepStyle}>
      <div style={{ ...card, maxWidth: 560 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
          <div className="pixel" style={{ fontSize:11, color:"var(--text)" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</div>
          <div className="mono" style={{ fontSize:10, color:"var(--muted2)" }}>STEP 2 OF 3</div>
        </div>

        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(22px,4vw,32px)", color:"var(--text)", marginBottom:8, letterSpacing:"-0.5px" }}>
          Choose your risk level
        </h2>
        <p style={{ fontFamily:"DM Sans", fontSize:15, color:"var(--muted)", marginBottom:24, lineHeight:1.7 }}>
          All three plans beat a savings account. Conservative is the safest. You can change this any time.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
          {Object.entries(PROFILES).map(([key, p]) => {
            const active = profile === key;
            return (
              <button key={key} onClick={() => setProfile(key)} style={{
                padding:"18px 20px", borderRadius:14, cursor:"pointer",
                border:`2px solid ${active ? p.color : "var(--border)"}`,
                background: active ? `${p.color}08` : "white",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                transition:"all 0.15s",
                boxShadow: active ? `0 4px 20px ${p.color}22` : "none",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44,height:44,borderRadius:12,background:`${p.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>
                    {p.icon}
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:17, color: active ? "var(--text)" : "var(--muted)" }}>{p.label}</span>
                      <span style={{ fontFamily:"DM Mono", fontSize:10, padding:"2px 8px", borderRadius:6, background:`${p.color}12`, color:p.color }}>{p.rate}</span>
                    </div>
                    <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted2)" }}>{p.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", marginBottom:2 }}>5yr gain</div>
                  <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:20, color:p.color }}>
                    +{fmt(p.gain5yr[amount])}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setStep(1)} style={{
            flex:1, padding:"14px 0", borderRadius:12, border:"1px solid var(--border)",
            background:"white", color:"var(--muted)", fontFamily:"DM Sans", fontSize:15, cursor:"pointer",
          }}>
            ← Back
          </button>
          <button onClick={() => setStep(3)} style={{
            flex:2, padding:"14px 0", borderRadius:12, border:"none",
            background:pc.color, color:"white", fontFamily:"DM Sans",
            fontWeight:700, fontSize:16, cursor:"pointer",
            boxShadow:`0 4px 16px ${pc.color}33`,
          }}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Confirm ───────────────────────────────────────────────────────
  if (step === 3) return (
    <div style={stepStyle}>
      <div style={{ ...card, maxWidth:560 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div className="pixel" style={{ fontSize:11, color:"var(--text)" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</div>
          <div className="mono" style={{ fontSize:10, color:"var(--muted2)" }}>STEP 3 OF 3</div>
        </div>

        <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(22px,4vw,32px)", color:"var(--text)", marginBottom:6, letterSpacing:"-0.5px" }}>
          Your plan is ready
        </h2>
        <p style={{ fontFamily:"DM Sans", fontSize:15, color:"var(--muted)", marginBottom:24, lineHeight:1.7 }}>
          Here's what you're committing to. We'll tell you exactly what to buy each month.
        </p>

        {/* Plan summary card */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"24px 20px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>YOUR PLAN</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:24, color:"white" }}>{pc.icon} {pc.label}</div>
              <div style={{ fontFamily:"DM Mono", fontSize:13, color:pc.color, marginTop:4 }}>{pc.rate} target</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>MONTHLY</div>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:28, color:"white" }}>${amount}</div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
            {[
              { l:"12 months", v:fmt(amount * 12 * (1 + pc.rate.replace("~","").replace("%/yr","") / 100 * 0.5)) },
              { l:"5yr gain",  v:"+"+fmt(pc.gain5yr[amount]) },
              { l:"Risk",      v:pc.risk },
            ].map(s => (
              <div key={s.l} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                <div className="mono" style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:4 }}>{s.l.toUpperCase()}</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"white" }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="mono" style={{ fontSize:9, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>THIS MONTH YOU'LL BUY</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {pc.etfs.map((t, i) => (
                <div key={t} style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 12px", display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontFamily:"DM Mono", fontSize:12, color:"white", fontWeight:500 }}>{t}</span>
                  <span style={{ fontFamily:"DM Mono", fontSize:10, color:pc.color }}>${Math.round(amount * [40,30,20,10][i] / 100)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div style={{ background:"var(--bg3)", borderRadius:12, padding:"16px", marginBottom:24 }}>
          <div className="mono" style={{ fontSize:10, color:"var(--muted2)", marginBottom:10, letterSpacing:1 }}>WHAT HAPPENS NEXT</div>
          {[
            "Open your broker app (Robinhood, eToro, etc.)",
            "Buy the ETFs shown above with the amounts listed",
            "Come back next month — we'll show your real results + new picks",
          ].map((s, i) => (
            <div key={i} style={{ display:"flex", gap:12, marginBottom:i < 2 ? 8 : 0 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                <span style={{ fontFamily:"DM Mono", fontSize:9, color:"white" }}>{i+1}</span>
              </div>
              <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>{s}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding:"10px 14px", background:"var(--red2)", border:"1px solid rgba(232,64,64,0.2)", borderRadius:8, marginBottom:16, fontFamily:"DM Sans", fontSize:13, color:"var(--red)" }}>
            {error}
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setStep(2)} style={{
            flex:1, padding:"14px 0", borderRadius:12, border:"1px solid var(--border)",
            background:"white", color:"var(--muted)", fontFamily:"DM Sans", fontSize:15, cursor:"pointer",
          }}>
            ← Back
          </button>
          <button onClick={handleComplete} disabled={saving} style={{
            flex:2, padding:"16px 0", borderRadius:12, border:"none",
            background: saving ? "var(--border)" : "var(--green)",
            color: saving ? "var(--muted)" : "white",
            fontFamily:"DM Sans", fontWeight:700, fontSize:16, cursor: saving ? "not-allowed" : "pointer",
            boxShadow: saving ? "none" : "0 4px 20px rgba(0,185,107,0.3)",
          }}>
            {saving ? "Saving your plan…" : "Start my plan →"}
          </button>
        </div>

        <p style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", textAlign:"center", marginTop:14 }}>
          Not financial advice · You can change your plan any time
        </p>
      </div>
    </div>
  );

  return null;
}
