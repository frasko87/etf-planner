"use client";
// app/blog/[slug]/page.js
// Self-contained blog post page — fetches from Supabase client-side
// No server component dependencies, works reliably on Vercel

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const G = "#00b96b", D = "#1a1a2e", MU = "#7a7a8a", BG = "#f8f8f5", BOR = "#e8e8e2";

export default function BlogPostPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = params?.slug;
  const [post,    setPost]    = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMob,   setIsMob]   = useState(false);

  useEffect(() => {
    const fn = () => setIsMob(window.innerWidth < 700);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const supabase = createClient();

    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.replace("/blog"); return; }
        setPost(data);
        document.title = `${data.meta_title || data.title} | ETF.PLAN`;

        // Load related posts
        supabase
          .from("blog_posts")
          .select("id,slug,slug_es,title,title_es,excerpt,excerpt_es,category,reading_time")
          .eq("published", true)
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(2)
          .then(({ data: rel }) => setRelated(rel || []));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${BG}; color: ${D}; font-family: 'DM Sans', Arial, sans-serif; }
    .post-body h2 { font-size: clamp(19px,3vw,24px); font-weight: 700; color: ${D}; margin: 32px 0 12px; letter-spacing: -0.3px; }
    .post-body h3 { font-size: clamp(16px,2.5vw,19px); font-weight: 700; color: ${D}; margin: 24px 0 10px; }
    .post-body p  { font-size: clamp(15px,2vw,17px); line-height: 1.85; color: #3a3a4e; margin-bottom: 18px; }
    .post-body strong { color: ${D}; font-weight: 700; }
    .post-body ul, .post-body ol { padding-left: 22px; margin-bottom: 20px; }
    .post-body li { font-size: clamp(14px,2vw,16px); line-height: 1.8; color: #3a3a4e; margin-bottom: 6px; }
    .post-body a  { color: ${G}; text-decoration: none; }
    .post-body a:hover { text-decoration: underline; }
    .post-body blockquote { border-left: 3px solid ${G}; padding: 14px 20px; margin: 24px 0; background: rgba(0,185,107,0.04); border-radius: 0 10px 10px 0; }
    .post-body blockquote p { color: #555; font-style: italic; margin: 0; }
    .post-body code { font-family: 'DM Mono', monospace; background: #f0f0ec; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
    .rel-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
    .rel-card { transition: all 0.2s; }
    .share-btn:hover { opacity: 0.85; }
  `;

  if (loading) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:BG }}>
        <div style={{ fontFamily:"DM Mono,monospace", fontSize:12, color:"#aaaabc", letterSpacing:1 }}>Loading...</div>
      </div>
    </>
  );

  if (!post) return null;

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })
    : null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://etfplan.app/blog/${slug}`;
  const waUrl  = `https://wa.me/?text=${encodeURIComponent(post.title + " " + shareUrl)}`;
  const twUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      <style>{css}</style>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <header style={{ background:BG, borderBottom:`1px solid ${BOR}`, padding:"0 clamp(16px,4vw,40px)", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href="/" style={{ fontFamily:"DM Mono,monospace", fontSize:"clamp(9px,2vw,11px)", letterSpacing:1, color:D, textDecoration:"none" }}>
          ETF<span style={{ color:G }}>.</span>PLAN
        </Link>
        <div style={{ display:"flex", gap:"clamp(10px,2vw,20px)", alignItems:"center" }}>
          <Link href="/blog" style={{ fontSize:14, color:MU, textDecoration:"none" }}>← Blog</Link>
          <Link href="/es/blog" style={{ fontSize:12, color:MU, padding:"5px 10px", border:`1px solid ${BOR}`, borderRadius:6, textDecoration:"none" }}>🇪🇸 ES</Link>
          <Link href="/login?mode=signup" style={{ fontSize:13, fontWeight:700, color:"white", background:G, padding:"8px clamp(12px,2vw,18px)", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap" }}>
            {isMob ? "Start free →" : "Get my free plan →"}
          </Link>
        </div>
      </header>

      {/* ── ARTICLE HEADER ───────────────────────────────────────────── */}
      <section style={{ background:D, padding:"clamp(48px,7vw,72px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
            <Link href="/blog" style={{ fontSize:12, fontFamily:"DM Mono,monospace", color:"rgba(255,255,255,0.3)", textDecoration:"none" }}>← Blog</Link>
            <span style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
            <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:G, background:"rgba(0,185,107,0.12)", padding:"3px 10px", borderRadius:100 }}>{post.category}</span>
            <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"rgba(255,255,255,0.3)" }}>{post.reading_time} min read</span>
          </div>
          <h1 style={{ fontSize:"clamp(24px,5vw,42px)", fontWeight:800, color:"white", lineHeight:1.15, letterSpacing:"-0.8px", marginBottom:16 }}>
            {post.title}
          </h1>
          {post.excerpt && (
            <p style={{ fontSize:"clamp(14px,2vw,17px)", color:"rgba(255,255,255,0.5)", lineHeight:1.75, marginBottom:16 }}>{post.excerpt}</p>
          )}
          {date && (
            <p style={{ fontSize:13, fontFamily:"DM Mono,monospace", color:"rgba(255,255,255,0.25)", margin:0 }}>
              {post.writer_name || "ETF.PLAN"} · {date}
            </p>
          )}
        </div>
      </section>

      {/* ── ARTICLE BODY ─────────────────────────────────────────────── */}
      <article style={{ maxWidth:720, margin:"0 auto", padding:"clamp(32px,5vw,56px) clamp(16px,4vw,24px)" }}>

        {/* Content */}
        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.content || "<p>Content coming soon.</p>" }}
        />

        {/* Share */}
        <div style={{ marginTop:48, padding:24, background:"white", border:`1px solid ${BOR}`, borderRadius:14 }}>
          <p style={{ fontSize:14, fontWeight:700, color:D, marginBottom:14 }}>Found this useful? Share it:</p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="share-btn"
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#25d366", color:"white", padding:"9px 18px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a href={twUrl} target="_blank" rel="noreferrer" className="share-btn"
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#000", color:"white", padding:"9px 18px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </a>
            <Link href="/login?mode=signup" className="share-btn"
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:G, color:"white", padding:"9px 18px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>
              Try ETF.PLAN free →
            </Link>
          </div>
        </div>

        {/* In-article CTA */}
        <div style={{ margin:"32px 0", background:D, borderRadius:14, padding:"28px 24px" }}>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:2, marginBottom:10 }}>ETF.PLAN</div>
          <h3 style={{ fontSize:"clamp(17px,3vw,21px)", fontWeight:700, color:"white", marginBottom:8, letterSpacing:"-0.3px" }}>
            Build your personalised ETF plan in 2 minutes
          </h3>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.75, marginBottom:20 }}>
            Tell us your monthly amount and risk level. We tell you exactly which ETFs to buy each month and send you a reminder on the 1st. Free forever.
          </p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", background:G, color:"white", fontWeight:700, fontSize:15, padding:"12px 24px", borderRadius:10, textDecoration:"none" }}>
            Get my free plan →
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop:40 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20, color:D }}>Related articles</h2>
            <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"repeat(2,1fr)", gap:16 }}>
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`} style={{ textDecoration:"none" }}>
                  <div className="rel-card" style={{ background:"white", border:`1px solid ${BOR}`, borderRadius:12, padding:20 }}>
                    <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:G, display:"block", marginBottom:8 }}>
                      {r.reading_time} min read
                    </span>
                    <h3 style={{ fontSize:15, fontWeight:700, color:D, lineHeight:1.4, marginBottom:8 }}>{r.title}</h3>
                    <span style={{ fontSize:13, color:G, fontWeight:600 }}>Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid ${BOR}`, padding:"24px clamp(16px,4vw,40px)", marginTop:40 }}>
        <div style={{ maxWidth:720, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <span style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:D, letterSpacing:1 }}>ETF<span style={{ color:G }}>.</span>PLAN</span>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <Link href="/blog"    style={{ fontSize:13, color:MU, textDecoration:"none" }}>Blog</Link>
            <Link href="/"        style={{ fontSize:13, color:MU, textDecoration:"none" }}>Home</Link>
            <Link href="/privacy" style={{ fontSize:13, color:MU, textDecoration:"none" }}>Privacy</Link>
            <Link href="/es/blog" style={{ fontSize:13, color:MU, textDecoration:"none" }}>🇪🇸 Español</Link>
          </div>
          <p style={{ fontSize:12, color:"#cccccc", margin:0 }}>Not financial advice. Past performance ≠ future results.</p>
        </div>
      </footer>
    </>
  );
}
