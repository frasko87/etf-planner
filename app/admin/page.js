"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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
  const [actionLoading, setActionLoading] = useState(null); // email being actioned
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [winWidth, setWinWidth] = useState(1200);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setWinWidth(window.innerWidth);
    const handler = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const isMob = winWidth < 680;
  const isTab = winWidth < 960;
  const [overrideForm, setOverrideForm] = useState({ profile:"balanced", tickers:"", note:"", allocations:"" });
  const [overrideMsg, setOverrideMsg] = useState("");
  const [writers, setWriters] = useState([]);
  const [writerForm, setWriterForm] = useState({ name:"", email:"", writer_code:"", bio:"", password_hash:"" });
  const [writerMsg, setWriterMsg] = useState("");
  const [writerLoading, setWriterLoading] = useState(false);
  const [writersLoaded, setWritersLoaded] = useState(false);

  const loadWriters = async () => {
    setWriterLoading(true);
    const res = await fetch("/api/admin/writers");
    if (res.ok) { const d = await res.json(); setWriters(d.writers || []); setWritersLoaded(true); }
    setWriterLoading(false);
  };

  const handleCreateWriter = async () => {
    if (!writerForm.name || !writerForm.email || !writerForm.writer_code || !writerForm.password_hash) {
      setWriterMsg("Fill in all required fields."); return;
    }
    setWriterLoading(true); setWriterMsg("");
    const res = await fetch("/api/admin/writers", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(writerForm),
    });
    const d = await res.json();
    if (d.success) {
      setWriterMsg("created:" + writerForm.email + ":" + writerForm.password_hash);
      setWriterForm({ name:"", email:"", writer_code:"", bio:"", password_hash:"" });
      loadWriters();
    } else {
      setWriterMsg("error:" + (d.error || "Failed"));
    }
    setWriterLoading(false);
  };

  const handleToggleWriter = async (id, active) => {
    await fetch("/api/admin/writers", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, active: !active }),
    });
    loadWriters();
  };

  const handleResetPassword = async (id, email) => {
    const pwd = prompt("New password for " + email + ":");
    if (!pwd) return;
    await fetch("/api/admin/writers", {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id, password_hash: pwd }),
    });
    setWriterMsg("pwd:" + email);
  };

  const handleUnsubscribe = async (email) => {
    if (!confirm(`Remove ${email} from newsletter?`)) return;
    setActionLoading(email);
    await fetch("/api/admin/unsubscribe-user", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email }) });
    // Refresh data
    const res = await fetch("/api/admin/stats"); const d = await res.json(); setData(d);
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId, email) => {
    setActionLoading(userId);
    setConfirmDelete(null);
    await fetch("/api/admin/delete-user", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId, email }) });
    const res = await fetch("/api/admin/stats"); const d = await res.json(); setData(d);
    setActionLoading(null);
  };

  const handleSaveNote = async (userId, note) => {
    setActionLoading(userId+"_note");
    await fetch("/api/admin/save-note", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId, note }) });
    const res = await fetch("/api/admin/stats"); const d = await res.json(); setData(d);
    setEditNote(null); setActionLoading(null);
  };

  const handleSetOverride = async (e) => {
    e.preventDefault();
    setOverrideMsg("Saving...");
    const tickers = overrideForm.tickers.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);
    // Build equal allocations if not provided
    let allocations = {};
    if (overrideForm.allocations.trim()) {
      try { allocations = JSON.parse(overrideForm.allocations); } catch(e) { setOverrideMsg("Invalid JSON in allocations"); return; }
    } else {
      const base = Math.floor(100 / tickers.length / 5) * 5;
      tickers.forEach((t,i) => { allocations[t] = i === tickers.length-1 ? 100 - base*(tickers.length-1) : base; });
    }
    const res = await fetch("/api/admin/etf-override", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ profile:overrideForm.profile, tickers, allocations, note:overrideForm.note }) });
    const d = await res.json();
    setOverrideMsg(d.success ? "✓ Override set — dashboard updated" : "Error: "+d.error);
    const statsRes = await fetch("/api/admin/stats"); const statsData = await statsRes.json(); setData(statsData);
  };

  const handleRemoveOverride = async (profile) => {
    await fetch("/api/admin/etf-override", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ profile, active:false }) });
    const res = await fetch("/api/admin/stats"); const d = await res.json(); setData(d);
  };

  useEffect(() => {
    if (tab === "writers" && !writersLoaded) loadWriters();
  }, [tab]);

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
    if (!newsletter.subject || !newsletter.body) return;
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
      <nav style={{ background:"var(--text)", borderBottom:"1px solid rgba(255,255,255,0.08)", position:"sticky", top:0, zIndex:100 }}>
        {/* Top bar: logo + site link + logout */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(14px,3vw,32px)", height:50 }}>
          <div className="pixel" style={{ fontSize:10, color:"white" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN <span style={{ opacity:0.35, fontSize:8 }}>ADMIN</span></div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Link href="/" style={{ fontFamily:"DM Sans", fontSize:12, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>← Site</Link>
            <button onClick={handleLogout} style={{ fontFamily:"DM Sans", fontSize:12, color:"rgba(255,255,255,0.4)", background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Log out</button>
          </div>
        </div>
        {/* Tab row — horizontally scrollable on mobile */}
        <div style={{ display:"flex", gap:2, overflowX:"auto", padding:"0 clamp(14px,3vw,32px)", paddingBottom:8, scrollbarWidth:"none", msOverflowStyle:"none" }}>
          {["overview","users","subscribers","newsletter","etf-status","writers"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily:"DM Sans", fontSize:13, fontWeight:tab===t?600:400,
              color: tab===t ? "white" : "rgba(255,255,255,0.4)",
              background: tab===t ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", borderRadius:8, padding:"6px 14px", cursor:"pointer",
              whiteSpace:"nowrap", flexShrink:0, textTransform:"capitalize",
            }}>{t.replace("-"," ")}</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px clamp(16px,3vw,24px) 80px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:24 }}>
              {[
                { l:"Total Users",      v:fmt(stats?.totalUsers),   c:"var(--green)" },
                { l:"Active Plans",     v:fmt(stats?.totalPlans),   c:"#3b82f6" },
                { l:"Subscribers",      v:fmt(stats?.totalSubs),    c:"#c9a84c" },
                { l:"MRR",              v:stats?.mrr ? "$"+fmt(stats.mrr)+"/mo" : "—", c:"var(--green)" },
                { l:"Conservative",     v:fmt(stats?.planBreakdown?.conservative), c:"#3b82f6" },
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
                    <div key={u.id} style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", padding:"10px 0", gap:8, borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
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

            {/* Growth chart */}
            <div style={{ ...card, marginBottom:16 }}>
              <div style={lbl}>WEEKLY SIGNUPS — LAST 12 WEEKS</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data?.weeklyGrowth || []} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="week" tick={{ fontFamily:"DM Mono", fontSize:9, fill:"var(--muted2)" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontFamily:"DM Mono", fontSize:9, fill:"var(--muted2)" }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip contentStyle={{ fontFamily:"DM Sans", fontSize:12, borderRadius:8, border:"1px solid var(--border)" }}/>
                  <Bar dataKey="signups" fill="var(--green)" radius={[4,4,0,0]} name="New signups"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Broadcast history */}
            {(data?.broadcastLogs || []).length > 0 && (
              <div style={card}>
                <div style={lbl}>BROADCAST HISTORY</div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:400 }}>
                    <thead>
                      <tr style={{ background:"var(--bg3)" }}>
                        {["Date","Subject","Segment","Sent","Failed"].map(h => (
                          <th key={h} style={{ ...lbl, padding:"8px 12px", textAlign:"left", marginBottom:0, whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.broadcastLogs || []).map((b,i,arr) => (
                        <tr key={b.id} style={{ borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
                          <td style={{ fontFamily:"DM Mono", fontSize:11, padding:"9px 12px", color:"var(--muted2)", whiteSpace:"nowrap" }}>{fmtDate(b.sent_at)}</td>
                          <td style={{ fontFamily:"DM Sans", fontSize:13, padding:"9px 12px", color:"var(--text)" }}>{b.subject}</td>
                          <td style={{ padding:"9px 12px" }}><span style={{ fontFamily:"DM Mono", fontSize:10, padding:"2px 8px", borderRadius:6, background:"var(--bg3)", color:"var(--muted2)", textTransform:"capitalize" }}>{b.segment}</span></td>
                          <td style={{ fontFamily:"DM Mono", fontSize:12, padding:"9px 12px", color:"var(--green)" }}>{b.sent_count}</td>
                          <td style={{ fontFamily:"DM Mono", fontSize:12, padding:"9px 12px", color:b.failed_count>0?"#ff4757":"var(--muted2)" }}>{b.failed_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
            <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                <thead>
                  <tr style={{ background:"var(--bg3)" }}>
                    {["Email","Plan","Amount","Signed up","Last active","Note",""].map(h => (
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
                          <td style={{ fontFamily:"DM Sans", fontSize:12, padding:"10px 12px", color:"var(--muted)", maxWidth:160 }}>
                            {editNote?.userId === u.id ? (
                              <div style={{ display:"flex", gap:4 }}>
                                <input autoFocus value={editNote.note} onChange={e=>setEditNote({...editNote, note:e.target.value})}
                                  style={{ fontFamily:"DM Sans", fontSize:12, padding:"3px 8px", border:"1px solid var(--border)", borderRadius:6, outline:"none", width:120 }}/>
                                <button onClick={()=>handleSaveNote(u.id, editNote.note)} style={{ fontFamily:"DM Mono", fontSize:9, padding:"3px 8px", borderRadius:6, background:"var(--green)", color:"white", border:"none", cursor:"pointer" }}>✓</button>
                                <button onClick={()=>setEditNote(null)} style={{ fontFamily:"DM Mono", fontSize:9, padding:"3px 8px", borderRadius:6, background:"var(--bg3)", color:"var(--muted)", border:"1px solid var(--border)", cursor:"pointer" }}>✕</button>
                              </div>
                            ) : (
                              <span onClick={()=>setEditNote({ userId:u.id, note:(plans||[]).find(p=>p.user_id===u.id)?.admin_note||"" })}
                                style={{ cursor:"pointer", color:(plans||[]).find(p=>p.user_id===u.id)?.admin_note ? "var(--text)" : "var(--muted2)", fontStyle:(plans||[]).find(p=>p.user_id===u.id)?.admin_note?"normal":"italic" }}>
                                {(plans||[]).find(p=>p.user_id===u.id)?.admin_note || "add note..."}
                              </span>
                            )}
                          </td>
                          <td style={{ padding:"10px 12px" }}>
                            <button
                              onClick={() => setConfirmDelete({ id:u.id, email:u.email })}
                              disabled={actionLoading === u.id}
                              style={{ fontFamily:"DM Mono", fontSize:9, padding:"3px 8px", borderRadius:6, border:"1px solid rgba(255,71,87,0.3)", background:"rgba(255,71,87,0.05)", color:"#ff4757", cursor:"pointer", whiteSpace:"nowrap" }}>
                              {actionLoading === u.id ? "..." : "delete"}
                            </button>
                          </td>
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
            <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                <thead>
                  <tr style={{ background:"var(--bg3)" }}>
                    {["Email","Plan","Monthly","Subscribed",""].map(h => (
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
                        <td style={{ padding:"10px 12px" }}>
                          <button
                            onClick={() => handleUnsubscribe(s.email)}
                            disabled={actionLoading === s.email}
                            style={{ fontFamily:"DM Mono", fontSize:9, padding:"3px 8px", borderRadius:6, border:"1px solid rgba(255,165,0,0.3)", background:"rgba(255,165,0,0.05)", color:"#f59e0b", cursor:"pointer", whiteSpace:"nowrap" }}>
                            {actionLoading === s.email ? "..." : "✕ unsub"}
                          </button>
                        </td>
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
          <div style={{ display:"grid", gridTemplateColumns:isTab?"1fr":"1fr 1fr", gap:20, alignItems:"start" }}>
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

              <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:10, marginBottom:20 }}>
                {[
                  { key:"ctaText", label:"CTA button text (optional)",  placeholder:"View my dashboard →" },
                  { key:"ctaUrl",  label:"CTA button URL (optional)",   placeholder:"https://etfplan.app/dashboard" },
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

              <button onClick={handleSendNewsletter} disabled={sending || !newsletter.subject || !newsletter.body}
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
                  <div key={log.id} style={{ display:"flex", flexWrap:"wrap", alignItems:"center", padding:"10px 0", gap:8, borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none" }}>
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

        {/* ETF Override — shown within ETF Status tab */}
        {tab === "etf-status" && (
          <div style={{ ...card, marginTop:16 }}>
            <div style={lbl}>MANUAL ETF OVERRIDE</div>
            <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", marginBottom:16, lineHeight:1.6 }}>
              Force specific ETFs into a plan, bypassing the scoring engine. The next scheduled run will overwrite this.
            </div>
            {(data?.overrides||[]).length > 0 && (
              <div style={{ marginBottom:16, display:"flex", flexDirection:"column", gap:8 }}>
                <div className="mono" style={{ fontSize:10, color:"var(--muted2)", letterSpacing:1, marginBottom:4 }}>ACTIVE OVERRIDES</div>
                {(data.overrides||[]).map(o => (
                  <div key={o.profile} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"rgba(255,165,0,0.06)", border:"1px solid rgba(255,165,0,0.2)", borderRadius:10, flexWrap:"wrap", gap:8 }}>
                    <div>
                      <span style={{ fontFamily:"DM Mono", fontSize:11, color:"#f59e0b", textTransform:"capitalize", fontWeight:600 }}>{o.profile}</span>
                      <span style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", marginLeft:10 }}>{(o.tickers||[]).join(", ")}</span>
                      {o.override_note && <span style={{ fontFamily:"DM Sans", fontSize:11, color:"var(--muted2)", marginLeft:8 }}>— {o.override_note}</span>}
                    </div>
                    <button onClick={()=>handleRemoveOverride(o.profile)} style={{ fontFamily:"DM Mono", fontSize:9, padding:"3px 10px", borderRadius:6, border:"1px solid rgba(255,71,87,0.3)", background:"rgba(255,71,87,0.05)", color:"#ff4757", cursor:"pointer" }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSetOverride} style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", display:"block", marginBottom:4 }}>Profile</label>
                <select value={overrideForm.profile} onChange={e=>setOverrideForm({...overrideForm, profile:e.target.value})}
                  style={{ width:"100%", fontFamily:"DM Sans", fontSize:13, padding:"8px 12px", border:"1px solid var(--border)", borderRadius:8, outline:"none", background:"var(--bg3)" }}>
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <div>
                <label style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", display:"block", marginBottom:4 }}>Tickers (comma separated)</label>
                <input value={overrideForm.tickers} onChange={e=>setOverrideForm({...overrideForm, tickers:e.target.value})}
                  placeholder="VOO, QQQ, VTI, SCHD"
                  style={{ width:"100%", fontFamily:"DM Mono", fontSize:13, padding:"8px 12px", border:"1px solid var(--border)", borderRadius:8, outline:"none", background:"white" }}/>
              </div>
              <div>
                <label style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", display:"block", marginBottom:4 }}>Allocations JSON (optional)</label>
                <input value={overrideForm.allocations} onChange={e=>setOverrideForm({...overrideForm, allocations:e.target.value})}
                  placeholder='{"VOO":40,"QQQ":30,"VTI":20,"SCHD":10}'
                  style={{ width:"100%", fontFamily:"DM Mono", fontSize:12, padding:"8px 12px", border:"1px solid var(--border)", borderRadius:8, outline:"none", background:"white" }}/>
              </div>
              <div>
                <label style={{ fontFamily:"DM Sans", fontSize:12, color:"var(--muted)", display:"block", marginBottom:4 }}>Reason</label>
                <input value={overrideForm.note} onChange={e=>setOverrideForm({...overrideForm, note:e.target.value})}
                  placeholder="e.g. Data error in QQQ this week"
                  style={{ width:"100%", fontFamily:"DM Sans", fontSize:13, padding:"8px 12px", border:"1px solid var(--border)", borderRadius:8, outline:"none", background:"white" }}/>
              </div>
              <div style={{ gridColumn:isMob?"1":"1 / -1", display:"flex", alignItems:"center", gap:12 }}>
                <button type="submit" style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:14, padding:"10px 24px", background:"var(--green)", color:"white", border:"none", borderRadius:8, cursor:"pointer" }}>Set Override</button>
                {overrideMsg && <span style={{ fontFamily:"DM Mono", fontSize:11, color:overrideMsg.startsWith("✓")?"var(--green)":"#ff4757" }}>{overrideMsg}</span>}
              </div>
            </form>
          </div>
        )}

        {/* ── WRITERS TAB ───────────────────────────────────────────────────── */}
        {tab === "writers" && (() => {
          const createdParts = writerMsg.startsWith("created:") ? writerMsg.split(":") : null;
          const pwdUpdated   = writerMsg.startsWith("pwd:") ? writerMsg.split("pwd:")[1] : null;
          const errMsg       = writerMsg.startsWith("error:") ? writerMsg.split("error:")[1] : null;
          const warnMsg      = !writerMsg.startsWith("created:") && !writerMsg.startsWith("pwd:") && !writerMsg.startsWith("error:") && writerMsg ? writerMsg : null;
          const S = { fontFamily:"DM Sans", fontSize:14, color:"#1a1a2e" };
          const inp = { width:"100%", padding:"10px 12px", border:"1.5px solid #e8e8e2", borderRadius:8, fontFamily:"DM Sans", fontSize:14, outline:"none" };
          const label = (t) => <div style={{ fontFamily:"DM Mono", fontSize:10, color:"#aaaabc", letterSpacing:1, marginBottom:5 }}>{t}</div>;
          return (
            <div style={{ display:"grid", gap:20 }}>

              {/* Create writer form */}
              <div style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:14, padding:"24px" }}>
                <div style={{ fontFamily:"DM Mono", fontSize:11, color:"#aaaabc", letterSpacing:1, marginBottom:16 }}>CREATE NEW WRITER</div>
                <div style={{ display:"grid", gridTemplateColumns:isTab?"1fr":"1fr 1fr", gap:12, marginBottom:12 }}>
                  <div>
                    {label("NAME *")}
                    <input style={inp} placeholder="Maria García" value={writerForm.name}
                      onChange={e=>setWriterForm({...writerForm,name:e.target.value})} />
                  </div>
                  <div>
                    {label("EMAIL *")}
                    <input style={inp} type="email" placeholder="maria@email.com" value={writerForm.email}
                      onChange={e=>setWriterForm({...writerForm,email:e.target.value})} />
                  </div>
                  <div>
                    {label("WRITER CODE * (short unique ID, no spaces)")}
                    <input style={inp} placeholder="maria" value={writerForm.writer_code}
                      onChange={e=>setWriterForm({...writerForm,writer_code:e.target.value.toLowerCase().replace(/[^a-z0-9]/g,"")})} />
                    <div style={{ fontSize:11, color:"#aaaabc", marginTop:4 }}>Used in tracking: etfplan.app/?writer={writerForm.writer_code||"maria"}</div>
                  </div>
                  <div>
                    {label("TEMPORARY PASSWORD *")}
                    <input style={inp} placeholder="TempPass2026!" value={writerForm.password_hash}
                      onChange={e=>setWriterForm({...writerForm,password_hash:e.target.value})} />
                    <div style={{ fontSize:11, color:"#aaaabc", marginTop:4 }}>They use this to log in at /cms</div>
                  </div>
                  <div style={{ gridColumn:isTab?"":"1 / -1" }}>
                    {label("SHORT BIO (optional — shown on blog posts)")}
                    <input style={inp} placeholder="Finance writer specialising in ETF investing." value={writerForm.bio}
                      onChange={e=>setWriterForm({...writerForm,bio:e.target.value})} />
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <button onClick={handleCreateWriter} disabled={writerLoading}
                    style={{ padding:"10px 20px", background:"#00b96b", color:"white", border:"none", borderRadius:8, fontFamily:"DM Sans", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    {writerLoading ? "Creating..." : "Create writer →"}
                  </button>
                  {warnMsg && <span style={{ fontSize:13, color:"#c9a84c" }}>⚠️ {warnMsg}</span>}
                  {errMsg  && <span style={{ fontSize:13, color:"#ff4757" }}>❌ {errMsg}</span>}
                  {pwdUpdated && <span style={{ fontSize:13, color:"#00b96b" }}>✅ Password updated for {pwdUpdated}</span>}
                </div>

                {/* Credentials card shown after creation */}
                {createdParts && (
                  <div style={{ marginTop:16, background:"#e8f5ee", border:"1px solid rgba(0,185,107,0.3)", borderRadius:10, padding:"16px 20px" }}>
                    <div style={{ fontFamily:"DM Mono", fontSize:10, color:"#005a35", letterSpacing:1, marginBottom:10 }}>✅ WRITER CREATED — SEND THESE CREDENTIALS</div>
                    <div style={{ display:"grid", gap:6 }}>
                      {[
                        ["CMS URL",       "https://etfplan.app/cms"],
                        ["Email",         createdParts[1]],
                        ["Password",      createdParts[2]],
                        ["Writer code",   writerForm.writer_code || "(see below)"],
                        ["Tracking link", `https://etfplan.app/?writer=${writerForm.writer_code||""}`],
                        ["Writer guide",  "etfplan.app/cms — or send the PDF"],
                      ].map(([k,v]) => (
                        <div key={k} style={{ display:"flex", gap:12, alignItems:"baseline", flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"DM Mono", fontSize:11, color:"#7a7a8a", minWidth:110 }}>{k}</span>
                          <span style={{ fontFamily:"DM Mono", fontSize:12, color:"#1a1a2e", fontWeight:600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => {
                      const text = `ETF.PLAN Content Studio\n\nCMS URL: https://etfplan.app/cms\nEmail: ${createdParts[1]}\nPassword: ${createdParts[2]}\n\nWriter guide: https://etfplan.app/cms\n\nQuestions? Reply to this message.`;
                      navigator.clipboard.writeText(text);
                      setWriterMsg("Copied to clipboard!");
                    }} style={{ marginTop:12, padding:"7px 14px", background:"#1a1a2e", color:"white", border:"none", borderRadius:7, fontFamily:"DM Sans", fontSize:13, cursor:"pointer", fontWeight:600 }}>
                      Copy credentials to clipboard
                    </button>
                  </div>
                )}
              </div>

              {/* Writers list */}
              <div style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:14, overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid #f0f0ec", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"DM Mono", fontSize:11, color:"#aaaabc", letterSpacing:1 }}>ALL WRITERS ({writers.length})</span>
                  <button onClick={loadWriters} style={{ fontFamily:"DM Sans", fontSize:12, color:"#7a7a8a", background:"none", border:"1px solid #e8e8e2", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Refresh</button>
                </div>

                {writerLoading && !writers.length ? (
                  <div style={{ padding:"32px", textAlign:"center", fontFamily:"DM Mono", fontSize:12, color:"#aaaabc" }}>Loading...</div>
                ) : writers.length === 0 ? (
                  <div style={{ padding:"32px", textAlign:"center", color:"#aaaabc" }}>No writers yet. Create one above.</div>
                ) : (
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #f0f0ec" }}>
                        {["Writer","Code","Posts","Conversions","Status","Actions"].map(h => (
                          <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontFamily:"DM Mono", fontSize:10, color:"#aaaabc", letterSpacing:1, fontWeight:500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {writers.map(w => (
                        <tr key={w.id} style={{ borderBottom:"1px solid #f8f8f5" }}>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ fontWeight:600, fontSize:14, color:"#1a1a2e" }}>{w.name}</div>
                            <div style={{ fontSize:12, color:"#aaaabc" }}>{w.email}</div>
                            {w.bio && <div style={{ fontSize:12, color:"#7a7a8a", marginTop:2, maxWidth:220 }}>{w.bio}</div>}
                          </td>
                          <td style={{ padding:"13px 16px" }}>
                            <code style={{ fontFamily:"DM Mono", fontSize:12, background:"#f4f4f0", padding:"3px 8px", borderRadius:5, color:"#1a1a2e" }}>{w.writer_code}</code>
                          </td>
                          <td style={{ padding:"13px 16px", fontFamily:"DM Mono", fontSize:14, color:"#1a1a2e" }}>{w.post_count ?? 0}</td>
                          <td style={{ padding:"13px 16px", fontFamily:"DM Mono", fontSize:14, color:"#c9a84c", fontWeight:700 }}>{w.conversion_count ?? 0}</td>
                          <td style={{ padding:"13px 16px" }}>
                            <span style={{ fontFamily:"DM Mono", fontSize:11, color:w.active?"#00b96b":"#aaaabc", fontWeight:600 }}>
                              {w.active ? "● Active" : "○ Inactive"}
                            </span>
                          </td>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              <button onClick={() => handleToggleWriter(w.id, w.active)}
                                style={{ fontSize:12, padding:"4px 10px", border:"1px solid #e8e8e2", borderRadius:6, background:"white", cursor:"pointer", fontFamily:"DM Sans", color:"#7a7a8a" }}>
                                {w.active ? "Deactivate" : "Activate"}
                              </button>
                              <button onClick={() => handleResetPassword(w.id, w.email)}
                                style={{ fontSize:12, padding:"4px 10px", border:"1px solid #e8e8e2", borderRadius:6, background:"white", cursor:"pointer", fontFamily:"DM Sans", color:"#7a7a8a" }}>
                                Reset pwd
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Attribution stats */}
              <div style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:14, padding:"20px 24px" }}>
                <div style={{ fontFamily:"DM Mono", fontSize:11, color:"#aaaabc", letterSpacing:1, marginBottom:12 }}>HOW ATTRIBUTION WORKS</div>
                <div style={{ display:"grid", gridTemplateColumns:isTab?"1fr":"1fr 1fr 1fr", gap:12 }}>
                  {[
                    { step:"1", label:"Writer publishes post", desc:"Post is live with writer_code attached" },
                    { step:"2", label:"Reader visits article", desc:"Attribution cookie saved in browser automatically" },
                    { step:"3", label:"Reader signs up", desc:"User permanently linked to writer in DB" },
                  ].map(s => (
                    <div key={s.step} style={{ display:"flex", gap:12 }}>
                      <div style={{ width:26, height:26, borderRadius:"50%", background:"#00b96b", color:"white", fontFamily:"DM Mono", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.step}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#1a1a2e", marginBottom:2 }}>{s.label}</div>
                        <div style={{ fontSize:12, color:"#7a7a8a" }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    {/* Edit note modal */}
    {editNote && !editNote.inline && (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setEditNote(null)}>
        <div style={{ background:"white", borderRadius:16, padding:28, maxWidth:360, width:"100%" }} onClick={e=>e.stopPropagation()}>
          <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:16, marginBottom:12 }}>Add note for {editNote.email}</div>
          <textarea value={editNote.note} onChange={e=>setEditNote({...editNote, note:e.target.value})} rows={3}
            style={{ width:"100%", fontFamily:"DM Sans", fontSize:13, padding:"10px 12px", border:"1px solid var(--border)", borderRadius:8, outline:"none", resize:"vertical", marginBottom:12 }}/>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setEditNote(null)} style={{ flex:1, padding:"10px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", background:"var(--bg3)" }}>Cancel</button>
            <button onClick={()=>handleSaveNote(editNote.userId, editNote.note)} style={{ flex:1, padding:"10px", border:"none", borderRadius:8, cursor:"pointer", background:"var(--green)", color:"white", fontWeight:600 }}>Save note</button>
          </div>
        </div>
      </div>
    )}

    {/* Confirm delete modal */}
    {confirmDelete && (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={() => setConfirmDelete(null)}>
        <div style={{ background:"white", borderRadius:16, padding:28, maxWidth:380, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
          <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:18, color:"#1a1a2e", marginBottom:8 }}>Delete user?</div>
          <div style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.7, marginBottom:6 }}>
            This will permanently delete:
          </div>
          <div style={{ fontFamily:"DM Mono", fontSize:12, color:"#ff4757", background:"rgba(255,71,87,0.04)", border:"1px solid rgba(255,71,87,0.15)", borderRadius:8, padding:"10px 14px", marginBottom:20 }}>
            {confirmDelete.email}<br/>
            <span style={{ fontSize:10, color:"var(--muted2)" }}>+ their plan, history, and email subscription</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ flex:1, fontFamily:"DM Sans", fontSize:13, padding:"10px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", background:"var(--bg3)", color:"var(--muted)" }}>Cancel</button>
            <button onClick={() => handleDeleteUser(confirmDelete.id, confirmDelete.email)} style={{ flex:1, fontFamily:"DM Sans", fontWeight:600, fontSize:13, padding:"10px", border:"none", borderRadius:8, cursor:"pointer", background:"#ff4757", color:"white" }}>
              Delete forever
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
