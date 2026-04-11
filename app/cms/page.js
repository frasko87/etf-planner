"use client";
// app/cms/page.js
// Main CMS dashboard for copywriters

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { value:"guide",    label:"Guide" },
  { value:"strategy", label:"Strategy" },
  { value:"market",   label:"Market Update" },
  { value:"news",     label:"News" },
];

export default function CMSDashboard() {
  const router = useRouter();
  const [writer, setWriter] = useState(null);
  const [token, setToken] = useState("");
  const [view, setView] = useState("dashboard"); // dashboard | editor | preview
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(defaultForm());

  function defaultForm() {
    return {
      title:"", title_es:"",
      excerpt:"", excerpt_es:"",
      content:"", content_es:"",
      category:"guide",
      tags:"",
      reading_time:5,
      seo_keywords:"",
      meta_title:"", meta_desc:"",
      meta_title_es:"", meta_desc_es:"",
      slug:"", slug_es:"",
      published:false, featured:false,
    };
  }

  useEffect(() => {
    const t = sessionStorage.getItem("cms_token");
    const w = sessionStorage.getItem("cms_writer");
    if (!t || !w) { router.push("/cms/login"); return; }
    setToken(t);
    setWriter(JSON.parse(w));
    loadData(t);
  }, []);

  async function loadData(t) {
    setLoading(true);
    try {
      // Load posts
      const res = await fetch("/api/cms/posts", { headers: { "x-cms-token": t } });
      if (res.status === 401) { router.push("/cms/login"); return; }
      const data = await res.json();
      setPosts(data.posts || []);
      setStats(data.stats || null);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  function logout() {
    sessionStorage.removeItem("cms_token");
    sessionStorage.removeItem("cms_writer");
    router.push("/cms/login");
  }

  function newPost() {
    setEditingPost(null);
    setForm(defaultForm());
    setView("editor");
  }

  function editPost(post) {
    setEditingPost(post);
    setForm({
      title:       post.title || "",
      title_es:    post.title_es || "",
      excerpt:     post.excerpt || "",
      excerpt_es:  post.excerpt_es || "",
      content:     post.content || "",
      content_es:  post.content_es || "",
      category:    post.category || "guide",
      tags:        (post.tags || []).join(", "),
      reading_time:post.reading_time || 5,
      seo_keywords:(post.seo_keywords || []).join(", "),
      meta_title:  post.meta_title || "",
      meta_desc:   post.meta_desc || "",
      meta_title_es:post.meta_title_es || "",
      meta_desc_es:post.meta_desc_es || "",
      slug:        post.slug || "",
      slug_es:     post.slug_es || "",
      published:   post.published || false,
      featured:    post.featured || false,
    });
    setView("editor");
  }

  function autoSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
  }
  function autoSlugES(title) {
    return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
  }

  async function savePost(publish = false) {
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map(t=>t.trim()).filter(Boolean),
        seo_keywords: form.seo_keywords.split(",").map(t=>t.trim()).filter(Boolean),
        published: publish || form.published,
        slug: form.slug || autoSlug(form.title),
        slug_es: form.slug_es || autoSlugES(form.title_es || form.title),
        writer_code: writer?.writer_code,
        writer_name: writer?.name,
      };
      if (editingPost) payload.id = editingPost.id;

      const res = await fetch("/api/cms/posts", {
        method: editingPost ? "PATCH" : "POST",
        headers: { "Content-Type":"application/json", "x-cms-token": token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg(publish ? "✅ Published!" : "✅ Saved as draft");
      await loadData(token);
      if (publish) setView("dashboard");
    } catch(e) {
      setMsg("❌ " + e.message);
    }
    setSaving(false);
  }

  async function deletePost(id) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch("/api/cms/posts", {
      method:"DELETE",
      headers:{"Content-Type":"application/json","x-cms-token":token},
      body: JSON.stringify({ id }),
    });
    await loadData(token);
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#f4f4f0;color:#1a1a2e;font-family:'DM Sans',Arial,sans-serif;}
    .pixel{font-family:'Press Start 2P',monospace;}
    .mono{font-family:'DM Mono',monospace;}
    textarea,input,select{font-family:'DM Sans',Arial,sans-serif;outline:none;}
    .nav-btn:hover{background:rgba(255,255,255,0.08)!important;}
    .post-row:hover{background:#f8f8f5!important;}
    .tab-btn.active{border-bottom:2px solid #00b96b!important;color:#1a1a2e!important;font-weight:600!important;}
  `;

  const inp = {
    width:"100%", padding:"11px 14px",
    border:"1.5px solid #e8e8e2", borderRadius:10,
    fontSize:14, color:"#1a1a2e", background:"white",
  };
  const ta = { ...inp, resize:"vertical", lineHeight:1.7, minHeight:200 };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f4f0" }}>
      <span className="mono" style={{ fontSize:12, color:"#aaaabc" }}>Loading...</span>
    </div>
  );

  // ── EDITOR VIEW ──────────────────────────────────────────────────────────────
  if (view === "editor") return (
    <>
      <style>{css}</style>
      <header style={{ background:"#1a1a2e", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <button onClick={() => setView("dashboard")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:13, fontFamily:"DM Sans,Arial,sans-serif" }}>
            ← Dashboard
          </button>
          <span className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>
            {editingPost ? "EDITING POST" : "NEW POST"}
          </span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {msg && <span style={{ fontSize:13, color:msg.startsWith("✅")?"#00b96b":"#ff4757", alignSelf:"center" }}>{msg}</span>}
          <button onClick={() => savePost(false)} disabled={saving} style={{ padding:"7px 16px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", color:"white", borderRadius:8, fontSize:13, cursor:"pointer", fontFamily:"DM Sans,Arial,sans-serif" }}>
            {saving ? "Saving..." : "Save draft"}
          </button>
          <button onClick={() => savePost(true)} disabled={saving} style={{ padding:"7px 18px", background:"#00b96b", border:"none", color:"white", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"DM Sans,Arial,sans-serif" }}>
            {saving ? "Publishing..." : "Publish →"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px" }}>
        {/* Tabs: EN / ES / SEO */}
        <div style={{ display:"flex", borderBottom:"2px solid #e8e8e2", marginBottom:28 }}>
          {[["en","🇬🇧 English"],["es","🇪🇸 Spanish"],["seo","🔍 SEO & Settings"]].map(([k,l]) => (
            <button key={k} onClick={() => setForm(f=>({...f, _tab:k}))}
              className={`tab-btn ${(form._tab||"en")===k?"active":""}`}
              style={{ padding:"10px 20px", border:"none", borderBottom:"2px solid transparent", background:"none", cursor:"pointer", fontSize:14, color:"#aaaabc", fontFamily:"DM Sans,Arial,sans-serif" }}>
              {l}
            </button>
          ))}
        </div>

        {/* English tab */}
        {(!form._tab || form._tab === "en") && (
          <div style={{ display:"grid", gap:20 }}>
            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">TITLE (EN)</label>
              <input style={{ ...inp, fontSize:20, fontWeight:700 }} value={form.title}
                onChange={e => setForm(f => ({ ...f, title:e.target.value, slug:autoSlug(e.target.value) }))}
                placeholder="What Is an ETF? A Beginner's Guide..." />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">EXCERPT (shown on blog list)</label>
              <textarea style={{ ...ta, minHeight:80 }} value={form.excerpt}
                onChange={e => setForm(f=>({...f,excerpt:e.target.value}))}
                placeholder="1-2 sentence summary for the blog list page..." />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">CONTENT (HTML supported)</label>
              <textarea style={{ ...ta, minHeight:400, fontFamily:"DM Mono,monospace", fontSize:13 }}
                value={form.content}
                onChange={e => setForm(f=>({...f,content:e.target.value}))}
                placeholder="<h2>Introduction</h2><p>Your article content here...</p>" />
              <p style={{ fontSize:12, color:"#aaaabc", marginTop:6 }}>
                Use &lt;h2&gt; for headings, &lt;p&gt; for paragraphs, &lt;strong&gt; for bold, &lt;ul&gt;&lt;li&gt; for lists. The blog will render this as formatted HTML.
              </p>
            </div>
          </div>
        )}

        {/* Spanish tab */}
        {form._tab === "es" && (
          <div style={{ display:"grid", gap:20 }}>
            <div style={{ background:"#fffbeb", border:"1px solid #f5e6a3", borderRadius:10, padding:"12px 16px" }}>
              <p style={{ fontSize:13, color:"#7a5800" }}>🇪🇸 Spanish content is optional but boosts SEO in Spanish-speaking markets. If left empty, the English version will show to all users.</p>
            </div>
            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">TITLE (ES)</label>
              <input style={{ ...inp, fontSize:18, fontWeight:700 }} value={form.title_es}
                onChange={e => setForm(f=>({...f,title_es:e.target.value,slug_es:autoSlugES(e.target.value)}))}
                placeholder="¿Qué es un ETF? Guía para principiantes..." />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">EXCERPT (ES)</label>
              <textarea style={{ ...ta, minHeight:80 }} value={form.excerpt_es}
                onChange={e => setForm(f=>({...f,excerpt_es:e.target.value}))}
                placeholder="Resumen de 1-2 frases..." />
            </div>
            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">CONTENT (ES)</label>
              <textarea style={{ ...ta, minHeight:400, fontFamily:"DM Mono,monospace", fontSize:13 }}
                value={form.content_es}
                onChange={e => setForm(f=>({...f,content_es:e.target.value}))}
                placeholder="<h2>Introducción</h2><p>Contenido del artículo aquí...</p>" />
            </div>
          </div>
        )}

        {/* SEO & settings tab */}
        {form._tab === "seo" && (
          <div style={{ display:"grid", gap:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">URL SLUG (EN)</label>
                <input style={inp} value={form.slug}
                  onChange={e => setForm(f=>({...f,slug:e.target.value}))}
                  placeholder="what-is-an-etf" />
                <p style={{ fontSize:11, color:"#aaaabc", marginTop:4 }}>etfplan.app/blog/{form.slug || "auto-generated"}</p>
              </div>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">URL SLUG (ES)</label>
                <input style={inp} value={form.slug_es}
                  onChange={e => setForm(f=>({...f,slug_es:e.target.value}))}
                  placeholder="que-es-un-etf" />
                <p style={{ fontSize:11, color:"#aaaabc", marginTop:4 }}>etfplan.app/es/blog/{form.slug_es || "auto-generated"}</p>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">CATEGORY</label>
                <select style={{ ...inp }} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">READING TIME (minutes)</label>
                <input style={inp} type="number" min={1} max={30} value={form.reading_time}
                  onChange={e=>setForm(f=>({...f,reading_time:parseInt(e.target.value)||5}))} />
              </div>
            </div>

            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">TARGET KEYWORDS (comma separated)</label>
              <input style={inp} value={form.seo_keywords}
                onChange={e=>setForm(f=>({...f,seo_keywords:e.target.value}))}
                placeholder="what is an etf, etf for beginners, how to buy etfs" />
            </div>

            <div>
              <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">TAGS (comma separated)</label>
              <input style={inp} value={form.tags}
                onChange={e=>setForm(f=>({...f,tags:e.target.value}))}
                placeholder="etf, beginners, investing, how-it-works" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">META TITLE (EN)</label>
                <input style={inp} value={form.meta_title}
                  onChange={e=>setForm(f=>({...f,meta_title:e.target.value}))}
                  placeholder="Leave empty to auto-generate from title" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">META TITLE (ES)</label>
                <input style={inp} value={form.meta_title_es}
                  onChange={e=>setForm(f=>({...f,meta_title_es:e.target.value}))} />
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">META DESCRIPTION (EN)</label>
                <textarea style={{ ...ta, minHeight:80 }} value={form.meta_desc}
                  onChange={e=>setForm(f=>({...f,meta_desc:e.target.value}))}
                  placeholder="Leave empty to auto-generate from excerpt" />
              </div>
              <div>
                <label style={{ fontSize:12, color:"#aaaabc", letterSpacing:1, display:"block", marginBottom:6 }} className="mono">META DESCRIPTION (ES)</label>
                <textarea style={{ ...ta, minHeight:80 }} value={form.meta_desc_es}
                  onChange={e=>setForm(f=>({...f,meta_desc_es:e.target.value}))} />
              </div>
            </div>

            <div style={{ display:"flex", gap:24 }}>
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))} />
                <span style={{ fontSize:14, color:"#1a1a2e" }}>Featured post (shown at top of blog)</span>
              </label>
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
                <span style={{ fontSize:14, color:"#1a1a2e" }}>Published</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // ── DASHBOARD VIEW ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <header style={{ background:"#1a1a2e", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span className="pixel" style={{ fontSize:10, color:"white" }}>ETF<span style={{ color:"#00b96b" }}>.</span>PLAN</span>
          <span className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>CONTENT STUDIO</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>{writer?.name}</span>
          <a href="/blog" target="_blank" rel="noreferrer" style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>View blog ↗</a>
          <button onClick={logout} style={{ fontSize:13, color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer", fontFamily:"DM Sans,Arial,sans-serif" }}>Log out</button>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>
        {/* Stats row */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
            {[
              { label:"My posts",        v: stats.myPosts,       color:"#1a1a2e" },
              { label:"Published",       v: stats.published,     color:"#00b96b" },
              { label:"Total views",     v: stats.views ?? "—",  color:"#3b82f6" },
              { label:"Users converted", v: stats.conversions ?? "—", color:"#c9a84c" },
            ].map(s => (
              <div key={s.label} style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:12, padding:"20px 24px" }}>
                <div className="mono" style={{ fontSize:10, color:"#aaaabc", letterSpacing:1, marginBottom:8 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize:28, fontWeight:700, color:s.color }}>{s.v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Posts table */}
        <div style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:14, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", borderBottom:"1px solid #f0f0ec" }}>
            <h2 style={{ fontSize:16, fontWeight:700 }}>My posts</h2>
            <button onClick={newPost} style={{ padding:"8px 18px", background:"#00b96b", color:"white", border:"none", borderRadius:8, fontFamily:"DM Sans,Arial,sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" }}>
              + New post
            </button>
          </div>

          {posts.length === 0 ? (
            <div style={{ padding:"48px 24px", textAlign:"center" }}>
              <p style={{ fontSize:15, color:"#aaaabc", marginBottom:16 }}>No posts yet. Create your first one.</p>
              <button onClick={newPost} style={{ padding:"10px 20px", background:"#00b96b", color:"white", border:"none", borderRadius:8, fontFamily:"DM Sans,Arial,sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                Write first post →
              </button>
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #f0f0ec" }}>
                  {["Title","Category","Status","Views","Conversions",""].map(h => (
                    <th key={h} className="mono" style={{ padding:"10px 16px", textAlign:h==="Title"?"left":"center", fontSize:10, color:"#aaaabc", letterSpacing:1, fontWeight:500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="post-row" style={{ borderBottom:"1px solid #f0f0ec", cursor:"pointer" }} onClick={() => editPost(post)}>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ fontSize:15, fontWeight:600, color:"#1a1a2e", marginBottom:2 }}>{post.title}</div>
                      <div className="mono" style={{ fontSize:11, color:"#aaaabc" }}>/{post.slug}</div>
                    </td>
                    <td style={{ padding:"14px 16px", textAlign:"center" }}>
                      <span style={{ fontSize:12, fontFamily:"DM Mono,monospace", color:"#7a7a8a", background:"#f4f4f0", padding:"3px 10px", borderRadius:100 }}>{post.category}</span>
                    </td>
                    <td style={{ padding:"14px 16px", textAlign:"center" }}>
                      <span style={{ fontSize:12, fontFamily:"DM Mono,monospace", color:post.published?"#00b96b":"#aaaabc", fontWeight:600 }}>
                        {post.published ? "● Live" : "○ Draft"}
                      </span>
                    </td>
                    <td style={{ padding:"14px 16px", textAlign:"center", fontFamily:"DM Mono,monospace", fontSize:14, color:"#1a1a2e" }}>{post.views ?? "—"}</td>
                    <td style={{ padding:"14px 16px", textAlign:"center", fontFamily:"DM Mono,monospace", fontSize:14, color:"#c9a84c", fontWeight:600 }}>{post.conversions ?? "—"}</td>
                    <td style={{ padding:"14px 16px", textAlign:"center" }}>
                      <button onClick={e => { e.stopPropagation(); deletePost(post.id); }}
                        style={{ fontSize:12, color:"#ff4757", background:"none", border:"1px solid #ffd0d0", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"DM Sans,Arial,sans-serif" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Writer tracking link */}
        {writer && (
          <div style={{ marginTop:24, background:"white", border:"1px solid #e8e8e2", borderRadius:12, padding:"20px 24px" }}>
            <div className="mono" style={{ fontSize:10, color:"#aaaabc", letterSpacing:1, marginBottom:12 }}>YOUR TRACKING LINK</div>
            <p style={{ fontSize:14, color:"#7a7a8a", marginBottom:10 }}>
              Share this link to attribute signups to your content. Any user who signs up after visiting a link with your writer code gets credited to you.
            </p>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <code style={{ background:"#f4f4f0", padding:"8px 14px", borderRadius:8, fontSize:13, color:"#1a1a2e", fontFamily:"DM Mono,monospace" }}>
                https://etfplan.app/?writer={writer.writer_code}
              </code>
              <button onClick={() => navigator.clipboard.writeText(`https://etfplan.app/?writer=${writer.writer_code}`)}
                style={{ padding:"8px 14px", background:"#00b96b", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"DM Sans,Arial,sans-serif" }}>
                Copy
              </button>
            </div>
            <p style={{ fontSize:12, color:"#aaaabc", marginTop:8 }}>
              Blog posts automatically track attributions when a reader clicks "Start free →" from your article.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
