"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const fmt = n => n?.toLocaleString?.() ?? "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—";
const timeAgo = d => {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const PLAN_COLORS = { conservative:"#3b82f6", balanced:"#c9a84c", aggressive:"#ff4757" };

export default function AdminPage() {
  const router = useRouter();
  const [data,       setData]      = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [tab,        setTab]       = useState("overview");
  const [newsletter, setNewsletter] = useState({ subject:"", headline:"", body:"", ctaText:"", ctaUrl:"", segment:"all", rawHtml:false });
  const [sending,    setSending]   = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [search,     setSearch]    = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => { if (r.status === 401) { router.push("/admin/login"); return null; } return r.json(); })
      .then(d => { if (d) { setData(d); setLoading(false); } })
      .catch(() => router.push("/admin/login"));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method:"DELETE" });
    router.push("/admin/login");
  };

  const handleSendNewsletter = async () => {
    if (!newsletter.subject || !newsletter.headline || !newsletter.body) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newsletter,
          rawHtml: newsletter.rawHtml ? newsletter.body : null,
          body: newsletter.rawHtml ? "" : newsletter.body,
        }),
      });
      const result = await res.json();
      setSendResult(result);
    } catch(e) {
      setSendResult({ error: e.message });
    }
    setSending(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span className="mono" style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Loading admin…</span>
    </div>
  );

  const { stats, recentUsers, subscribers, fetchLogs, selections, recentPlans, plans } = data || {};

  const filteredSubs = (subscribers || []).filter(s =>
    !search || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const card = { background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(18px,3vw,24px)", boxShadow:"var(--shadow)" };
  const lbl  = { fontFamily:"DM Mono", fontSize:10, letterSpacing:2, color:"var(--muted2)", marginBottom:8 };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

      {/* Nav */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,3vw,32px)", height:56, background:"var(--text)", borderBottom:"1px solid rgba(255,255,255,0.08)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div className="pixel" style={{ fontSize:10, color:"white" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN <span style={{ opacity:0.35, fontSize:8 }}>ADMIN</span></div>
          <div style={{ display:"flex", gap:2 }}>
            {["overview","users","subscribers","newsletter","etf-status"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily:"DM Sans", fontSize:13, fontWeight:tab===t?600:400,
                color: tab===t ? "white" : "rgba(255,255,255,0.4)",
                background: tab===t ? "rgba(255,255,255,0.1)" : "transparent",
                border: "none", borderRadius:8, padding:"6px 12px", cursor:"pointer",
                textTransform:"capitalize",
              }}>
                {t.replace("-"," ")}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Link href="/" style={{ fontFamily:"DM Sans", fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>← Site</Link>
          <button onClick={handleLogout} style={{ fontFamily:"DM Sans", fontSize:13, color:"rgba(255,255,255,0.4)", background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"5px 12px", cursor:"pointer" }}>Log out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px clamp(16px,3vw,24px) 80px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:24 }}>
              {[
                { l:"Total Users",      v:fmt(stats?.totalUsers),   c:"var(--green)",  icon:"👤" },
                { l:"Active Plans",     v:fmt(stats?.totalPlans),   c:"#3b82f6",       icon:"📋" },
                { l:"Subscribers",      v:fmt(stats?.totalSubs),    c:"#c9a84c",       icon:"📧" },
                { l:"Conservative",     v:fmt(stats?.planBreakdown?.conservative), c:"#3b82f6", icon:"🛡️" },
                { l:"Balanced",         v:fmt(stats?.planBreakdown?.balanced),     c:"#c9a84c", icon:"⚖️" },
                { l:"Aggressive",       v:fmt(stats?.planBreakdown?.aggressive),   c:"#ff4757", icon:"🚀" },
              ].map(s => (
                <div key={s.l} style={card}>
                  <div style={{ ...lbl }}>{s.l}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:20 }}>{s.icon}</span>
                    <span style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:28, color:s.c }}>{s.v}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan breakdown bar */}
            <div style={{ ...card, marginBottom:16 }}>
              <div style={lbl}>PLAN DISTRIBUTION</div>
              <div style={{ display:"flex", height:12, borderRadius:8, overflow:"hidden", marginBottom:12 }}>
                {Object.entries(stats?.planBreakdown || {}).map(([k,v]) => {
                  const total = stats?.totalPlans || 1;
                  return <div key={k} style={{ flex:v/total, background:PLAN_COLORS[k], transition:"flex 0.3s" }}/>;
                })}
              </div>
              <div style={{ display:"flex", gap:20 }}>
                {Object.entries(stats?.planBreakdown || {}).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:PLAN_COLORS[k] }}/>
                    <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--text)", textTransform:"capitalize" }}>{k}</span>
                    <span className="mono" style={{ fontSize:11, color:"var(--muted2)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent signups */}
            <div style={card}>
              <div style={lbl}>RECENT SIGNUPS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {(recentUsers || []).slice(0,10).map((u,i,arr) => {
                  const plan = (plans || []).find(p => p.user_id === u.id);
                  return (
                    <div key={u.id} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:12, alignItems:"center", padding:"10px 0", borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
                      <div>
                        <div style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--text)", fontWeight:500 }}>{u.email}</div>
                        <div className="mono" style={{ fontSize:10, color:"var(--muted2)" }}>Signed up {timeAgo(u.created_at)}</div>
                      </div>
                      {plan ? (
                        <span style={{ fontFamily:"DM Mono", fontSize:10, padding:"3px 10px", borderRadius:8, background:`${PLAN_COLORS[plan.profile]}10`, color:PLAN_COLORS[plan.profile], textTransform:"capitalize", border:`1px solid ${PLAN_COLORS[plan.profile]}22` }}>
                          {plan.profile} · ${plan.amount}/mo
                        </span>
                      ) : (
                        <span className="mono" style={{ fontSize:10, color:"var(--muted2)", padding:"3px 10px", borderRadius:8, background:"var(--bg3)" }}>no plan</span>
                      )}
                      <div className="mono" style={{ fontSize:11, color:"var(--muted2)" }}>{timeAgo(u.last_sign)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div style={card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div style={lbl}>ALL USERS ({stats?.totalUsers})</div>
              <input
                placeholder="Search by email…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ fontFamily:"DM Sans", fontSize:13, padding:"8px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg3)", outline:"none", width:220 }}
              />
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--bg3)" }}>
                    {["Email","Plan","Amount","Signed up","Last active"].map(h => (
                      <th key={h} style={{ ...lbl, padding:"8px 12px", textAlign:"left", whiteSpace:"nowrap", marginBottom:0 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(recentUsers || [])
                    .filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()))
                    .map((u,i,arr) => {
                      const plan = (plans || []).find(p => p.user_id === u.id);
                      return (
                        <tr key={u.id} style={{ borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
                          <td style={{ fontFamily:"DM Sans", fontSize:13, padding:"10px 12px", color:"var(--text)" }}>{u.email}</td>
                          <td style={{ padding:"10px 12px" }}>
                            {plan ? <span style={{ fontFamily:"DM Mono", fontSize:10, color:PLAN_COLORS[plan.profile], textTransform:"capitalize" }}>{plan.profile}</span>
                                  : <span style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)" }}>—</span>}
                          </td>
                          <td style={{ fontFamily:"DM Mono", fontSize:12, padding:"10px 12px", color:"var(--muted)" }}>{plan ? `$${plan.amount}` : "—"}</td>
                          <td style={{ fontFamily:"DM Mono", fontSize:11, padding:"10px 12px", color:"var(--muted2)", whiteSpace:"nowrap" }}>{fmtDate(u.created_at)}</td>
                          <td style={{ fontFamily:"DM Mono", fontSize:11, padding:"10px 12px", color:"var(--muted2)", whiteSpace:"nowrap" }}>{timeAgo(u.last_sign)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUBSCRIBERS ── */}
        {tab === "subscribers" && (
          <div style={card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div style={lbl}>ACTIVE SUBSCRIBERS ({filteredSubs.length})</div>
              <input
                placeholder="Search by email…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ fontFamily:"DM Sans", fontSize:13, padding:"8px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg3)", outline:"none", width:220 }}
              />
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--bg3)" }}>
                    {["Email","Plan","Monthly","Subscribed"].map(h => (
                      <th key={h} style={{ ...lbl, padding:"8px 12px", textAlign:"left", whiteSpace:"nowrap", marginBottom:0 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((s,i,arr) => {
                    const plan = (plans || []).find(p => p.user_id === s.user_id);
                    return (
                      <tr key={s.email} style={{ borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
                        <td style={{ fontFamily:"DM Sans", fontSize:13, padding:"10px 12px", color:"var(--text)" }}>{s.email}</td>
                        <td style={{ padding:"10px 12px" }}>
                          {plan ? <span style={{ fontFamily:"DM Mono", fontSize:10, color:PLAN_COLORS[plan.profile], textTransform:"capitalize" }}>{plan.profile}</span>
                                : <span className="mono" style={{ fontSize:10, color:"var(--muted2)" }}>—</span>}
                        </td>
                        <td style={{ fontFamily:"DM Mono", fontSize:12, padding:"10px 12px", color:"var(--muted)" }}>{plan ? `$${plan.amount}` : "—"}</td>
                        <td style={{ fontFamily:"DM Mono", fontSize:11, padding:"10px 12px", color:"var(--muted2)", whiteSpace:"nowrap" }}>{fmtDate(s.subscribed_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── NEWSLETTER ── */}
        {tab === "newsletter" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start" }}>
            <div style={card}>
              <div style={lbl}>COMPOSE NEWSLETTER</div>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", display:"block", marginBottom:6 }}>Segment</label>
                <select value={newsletter.segment} onChange={e => setNewsletter({...newsletter, segment:e.target.value})}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid var(--border)", fontFamily:"DM Sans", fontSize:14, background:"white", outline:"none" }}>
                  <option value="all">All subscribers</option>
                  <option value="conservative">Conservative only</option>
                  <option value="balanced">Balanced only</option>
                  <option value="aggressive">Aggressive only</option>
                </select>
              </div>

              {[
                { key:"subject",  label:"Email subject",  placeholder:"📊 March market update — what this means for your ETFs" },
                { key:"headline", label:"Email headline",  placeholder:"The market moved. Here's what you need to know." },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:14 }}>
                  <label style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", display:"block", marginBottom:6 }}>{f.label}</label>
                  <input
                    value={newsletter[f.key]}
                    onChange={e => setNewsletter({...newsletter, [f.key]:e.target.value})}
                    placeholder={f.placeholder}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid var(--border)", fontFamily:"DM Sans", fontSize:14, outline:"none", boxSizing:"border-box" }}
                  />
                </div>
              ))}

              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <label style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)" }}>
                    {newsletter.rawHtml ? "Full HTML email" : "Body (HTML snippet)"}
                  </label>
                  <button onClick={() => setNewsletter({...newsletter, rawHtml:!newsletter.rawHtml})} style={{
                    fontFamily:"DM Mono", fontSize:10, padding:"3px 10px", borderRadius:6, cursor:"pointer",
                    background: newsletter.rawHtml ? "var(--green)" : "var(--bg3)",
                    color: newsletter.rawHtml ? "white" : "var(--muted)",
                    border: "1px solid var(--border)",
                  }}>
                    {newsletter.rawHtml ? "✓ RAW HTML ON" : "RAW HTML OFF"}
                  </button>
                </div>
                {newsletter.rawHtml && (
                  <div style={{ fontFamily:"DM Sans", fontSize:11, color:"var(--green)", marginBottom:6, padding:"6px 10px", background:"rgba(0,185,107,0.06)", borderRadius:6, border:"1px solid rgba(0,185,107,0.2)" }}>
                    ✓ Paste your full HTML email below. It will be sent exactly as-is.
                  </div>
                )}
                <textarea
                  value={newsletter.body}
                  onChange={e => setNewsletter({...newsletter, body:e.target.value})}
                  placeholder={newsletter.rawHtml ? "<!DOCTYPE html><html>...</html>" : "<p>This month, markets moved significantly...</p>"}
                  rows={newsletter.rawHtml ? 12 : 6}
                  style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid var(--border)", fontFamily:"DM Mono", fontSize:12, outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.6 }}
                />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[
                  { key:"ctaText", label:"CTA button text (optional)",  placeholder:"View my dashboard →" },
                  { key:"ctaUrl",  label:"CTA button URL (optional)",   placeholder:"https://etf-planner.vercel.app/dashboard" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", display:"block", marginBottom:4 }}>{f.label}</label>
                    <input
                      value={newsletter[f.key]}
                      onChange={e => setNewsletter({...newsletter, [f.key]:e.target.value})}
                      placeholder={f.placeholder}
                      style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid var(--border)", fontFamily:"DM Sans", fontSize:13, outline:"none", boxSizing:"border-box" }}
                    />
                  </div>
                ))}
              </div>

              {sendResult && (
                <div style={{ borderRadius:10, marginBottom:16, overflow:"hidden", border:"1px solid var(--border)" }}>
                  {/* Summary bar */}
                  <div style={{ padding:"12px 16px", display:"flex", gap:16, alignItems:"center",
                    background: sendResult.error ? "rgba(255,71,87,0.08)" : sendResult.failed > 0 ? "rgba(255,165,0,0.08)" : "rgba(0,185,107,0.08)",
                  }}>
                    {sendResult.error
                      ? <span style={{ fontFamily:"DM Sans", fontSize:13, color:"#ff4757" }}>❌ Error: {sendResult.error}</span>
                      : <>
                          <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--green)", fontWeight:600 }}>✅ Sent: {sendResult.sent}</span>
                          {sendResult.failed > 0 && <span style={{ fontFamily:"DM Sans", fontSize:13, color:"#ff4757", fontWeight:600 }}>❌ Failed: {sendResult.failed}</span>}
                          <span style={{ fontFamily:"DM Mono", fontSize:11, color:"var(--muted2)" }}>Total: {sendResult.total}</span>
                        </>
                    }
                  </div>
                  {/* Per-email results */}
                  {sendResult.results && sendResult.results.length > 0 && (
                    <div style={{ background:"white", maxHeight:200, overflowY:"auto" }}>
                      {sendResult.results.map((r,i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 16px", borderBottom:"1px solid var(--bg3)" }}>
                          <span style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--text)" }}>{r.email}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            {r.error && <span style={{ fontFamily:"DM Mono", fontSize:10, color:"var(--muted2)", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.error}</span>}
                            <span style={{ fontFamily:"DM Mono", fontSize:10, padding:"2px 8px", borderRadius:5,
                              background: r.status === "sent" ? "rgba(0,185,107,0.1)" : "rgba(255,71,87,0.1)",
                              color: r.status === "sent" ? "var(--green)" : "#ff4757",
                            }}>{r.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleSendNewsletter} disabled={sending || !newsletter.subject || !newsletter.headline || !newsletter.body}
                style={{
                  width:"100%", padding:"14px 0", borderRadius:10, border:"none",
                  background: sending ? "var(--border)" : "var(--green)",
                  color: sending ? "var(--muted)" : "white",
                  fontFamily:"DM Sans", fontWeight:700, fontSize:15,
                  cursor: sending ? "not-allowed" : "pointer",
                  boxShadow: sending ? "none" : "0 4px 16px rgba(0,185,107,0.3)",
                }}>
                {sending ? "Sending…" : `Send to ${newsletter.segment === "all" ? "all" : newsletter.segment} subscribers →`}
              </button>
            </div>

            {/* Preview */}
            <div style={card}>
              <div style={lbl}>PREVIEW</div>
              <div style={{ background:"var(--bg3)", borderRadius:12, padding:"20px", border:"1px solid var(--border)" }}>
                <div style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:"var(--text)", marginBottom:16 }}>
                  ETF<span style={{ color:"var(--green)" }}>.</span>PLAN
                </div>
                <div style={{ background:"var(--text)", borderRadius:12, padding:"20px", marginBottom:12 }}>
                  <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:18, color:"white", marginBottom:8 }}>
                    {newsletter.headline || "Your headline will appear here"}
                  </div>
                  <div style={{ fontFamily:"DM Sans", fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}
                    dangerouslySetInnerHTML={{ __html: newsletter.body || "<p>Your email body will appear here...</p>" }}
                  />
                  {newsletter.ctaText && (
                    <div style={{ marginTop:16, textAlign:"center" }}>
                      <span style={{ display:"inline-block", background:"var(--green)", color:"white", fontFamily:"DM Sans", fontWeight:600, fontSize:13, padding:"10px 20px", borderRadius:8 }}>
                        {newsletter.ctaText}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ fontFamily:"DM Sans", fontSize:11, color:"var(--muted2)", textAlign:"center" }}>
                  Not financial advice · <span style={{ color:"var(--green)" }}>Unsubscribe</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ETF STATUS ── */}
        {tab === "etf-status" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Fetch log */}
            <div style={card}>
              <div style={lbl}>FETCH LOG — LAST 10 RUNS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {(fetchLogs || []).map((log,i,arr) => (
                  <div key={log.id} style={{ display:"grid", gridTemplateColumns:"auto 1fr auto auto", gap:16, alignItems:"center", padding:"10px 0", borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:log.error_count>0?"#ff4757":"var(--green)", flexShrink:0 }}/>
                    <div>
                      <div className="mono" style={{ fontSize:11, color:"var(--text)", fontWeight:500 }}>{log.trigger?.replace("_"," ") || "manual"}</div>
                      <div className="mono" style={{ fontSize:10, color:"var(--muted2)" }}>{log.etfs_fetched || 0} ETFs · {log.error_count || 0} errors</div>
                    </div>
                    <div className="mono" style={{ fontSize:10, color:"var(--muted2)", textAlign:"right", whiteSpace:"nowrap" }}>{timeAgo(log.fetched_at)}</div>
                    <div className="mono" style={{ fontSize:10, color:"var(--muted2)", whiteSpace:"nowrap" }}>{fmtDate(log.fetched_at)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current selections */}
            <div style={card}>
              <div style={lbl}>CURRENT WEEKLY SELECTIONS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {(selections || []).map(sel => (
                  <div key={sel.profile} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"var(--bg3)", borderRadius:10, flexWrap:"wrap", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, color:"var(--text)", textTransform:"capitalize" }}>{sel.profile}</span>
                      <span className="mono" style={{ fontSize:10, color:"var(--muted2)" }}>{sel.week_start ? fmtDate(sel.week_start) : "—"}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {(sel.tickers || []).map(t => (
                        <span key={t} style={{ fontFamily:"DM Mono", fontSize:11, padding:"3px 10px", borderRadius:6, background:"white", border:"1px solid var(--border)", color:"var(--text)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
