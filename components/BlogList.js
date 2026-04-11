"use client";
// components/BlogList.js
// Shared blog list for /blog (locale="en") and /es/blog (locale="es")

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = {
  en: { all:"All", guide:"Guides", strategy:"Strategy", market:"Market", news:"News" },
  es: { all:"Todo", guide:"Guías", strategy:"Estrategia", market:"Mercado", news:"Noticias" },
};

export default function BlogList({ locale = "en" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [isMob, setIsMob] = useState(false);
  const isES = locale === "es";

  useEffect(() => {
    const check = () => setIsMob(window.innerWidth < 680);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let q = supabase
      .from("blog_posts")
      .select("id,slug,slug_es,title,title_es,excerpt,excerpt_es,category,tags,reading_time,featured,published_at,og_image")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (cat !== "all") q = q.eq("category", cat);
    q.then(({ data }) => {
      setPosts(data || []);
      setLoading(false);
    });
  }, [cat]);

  const title    = isES ? "Blog de Inversión en ETFs" : "ETF Investing Blog";
  const subtitle = isES ? "Guías, estrategias e insights de mercado para inversores a largo plazo."
                        : "Guides, strategies and market insights for long-term investors.";
  const cats     = CATEGORIES[locale];
  const basePath = isES ? "/es/blog" : "/blog";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#f8f8f5;color:#1a1a2e;font-family:'DM Sans',Arial,sans-serif;}
    .pixel{font-family:'Press Start 2P',monospace;}
    .mono{font-family:'DM Mono',monospace;}
    .post-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.08);}
    .post-card{transition:all 0.2s;}
    .read-link:hover{color:#00875a !important;}
  `;

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <header style={{ background:"#f8f8f5", borderBottom:"1px solid #e8e8e2", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href={isES?"/es":"/"} className="pixel" style={{ fontSize:isMob?9:11, color:"#1a1a2e", textDecoration:"none" }}>
          ETF<span style={{ color:"#00b96b" }}>.</span>PLAN
        </Link>
        <nav style={{ display:"flex", gap:isMob?10:20, alignItems:"center" }}>
          {!isMob && <Link href={isES?"/es/learn":"/learn"} style={{ fontSize:14, color:"#7a7a8a", textDecoration:"none" }}>{isES?"Aprender":"Learn"}</Link>}
          <Link href={basePath} style={{ fontSize:14, fontWeight:600, color:"#00b96b", textDecoration:"none" }}>Blog</Link>
          <Link href="/login" style={{ fontSize:14, color:"#7a7a8a", textDecoration:"none" }}>{isES?"Entrar":"Log in"}</Link>
          <Link href="/login?mode=signup" style={{ fontSize:14, fontWeight:600, color:"white", background:"#00b96b", padding:"7px 16px", borderRadius:8, textDecoration:"none" }}>
            {isES?"Empezar →":"Start free →"}
          </Link>
          {isES
            ? <Link href="/blog" style={{ fontSize:12, color:"#aaaabc", textDecoration:"none" }}>🇬🇧 EN</Link>
            : <Link href="/es/blog" style={{ fontSize:12, color:"#aaaabc", textDecoration:"none" }}>🇪🇸 ES</Link>
          }
        </nav>
      </header>

      {/* Hero */}
      <section style={{ background:"#1a1a2e", padding:isMob?"48px 20px 40px":"64px 24px 56px", textAlign:"center" }}>
        <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:16 }}>
          ETF.PLAN · BLOG
        </div>
        <h1 style={{ fontSize:isMob?24:38, fontWeight:800, color:"white", letterSpacing:"-1px", marginBottom:12 }}>{title}</h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", maxWidth:520, margin:"0 auto" }}>{subtitle}</p>
      </section>

      {/* Category filter */}
      <div style={{ borderBottom:"1px solid #e8e8e2", background:"white", padding:"0 24px", overflowX:"auto" }}>
        <div style={{ display:"flex", gap:0, maxWidth:900, margin:"0 auto" }}>
          {Object.entries(cats).map(([k,v]) => (
            <button key={k} onClick={() => setCat(k)} style={{
              padding:"14px 20px", border:"none", background:"none", cursor:"pointer",
              fontFamily:"DM Sans,Arial,sans-serif", fontSize:14, fontWeight:cat===k?600:400,
              color:cat===k?"#1a1a2e":"#7a7a8a",
              borderBottom:`2px solid ${cat===k?"#00b96b":"transparent"}`,
              whiteSpace:"nowrap",
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <main style={{ maxWidth:900, margin:"0 auto", padding:isMob?"24px 16px 48px":"40px 24px 64px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"#aaaabc", fontFamily:"DM Mono,monospace", fontSize:12 }}>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"#aaaabc" }}>
            {isES?"No hay artículos aún.":"No posts yet."}
          </div>
        ) : (
          <>
            {/* Featured post — full width */}
            {posts.filter(p=>p.featured).slice(0,1).map(post => {
              const href = `${basePath}/${isES&&post.slug_es ? post.slug_es : post.slug}`;
              return (
                <Link key={post.id} href={href} style={{ textDecoration:"none" }}>
                  <div className="post-card" style={{ background:"#1a1a2e", borderRadius:16, padding:isMob?"24px":"36px 40px", marginBottom:28, display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:32, alignItems:"center" }}>
                    <div>
                      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                        <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"#00b96b", background:"rgba(0,185,107,0.12)", padding:"3px 10px", borderRadius:100 }}>
                          {cats[post.category] || post.category}
                        </span>
                        <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"rgba(255,255,255,0.3)" }}>
                          ★ {isES?"Destacado":"Featured"}
                        </span>
                      </div>
                      <h2 style={{ fontSize:isMob?20:24, fontWeight:700, color:"white", lineHeight:1.3, marginBottom:12, letterSpacing:"-0.5px" }}>
                        {isES && post.title_es ? post.title_es : post.title}
                      </h2>
                      <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginBottom:20 }}>
                        {isES && post.excerpt_es ? post.excerpt_es : post.excerpt}
                      </p>
                      <span className="read-link" style={{ fontSize:14, fontWeight:600, color:"#00b96b" }}>
                        {isES?"Leer artículo →":"Read article →"}
                      </span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, height:160, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:"DM Mono,monospace", fontSize:11, color:"rgba(255,255,255,0.2)", letterSpacing:1 }}>
                        {post.reading_time} {isES?"min lectura":"min read"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Regular posts grid */}
            <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"repeat(2,1fr)", gap:20 }}>
              {posts.filter(p => !p.featured || posts.filter(x=>x.featured).indexOf(p) > 0).map(post => {
                const href = `${basePath}/${isES&&post.slug_es ? post.slug_es : post.slug}`;
                return (
                  <Link key={post.id} href={href} style={{ textDecoration:"none" }}>
                    <div className="post-card" style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:14, padding:24, height:"100%" }}>
                      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                        <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"#00b96b", background:"rgba(0,185,107,0.08)", padding:"3px 10px", borderRadius:100 }}>
                          {cats[post.category] || post.category}
                        </span>
                        <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"#aaaabc" }}>
                          {post.reading_time} {isES?"min":"min read"}
                        </span>
                      </div>
                      <h2 style={{ fontSize:17, fontWeight:700, color:"#1a1a2e", lineHeight:1.4, marginBottom:10, letterSpacing:"-0.3px" }}>
                        {isES && post.title_es ? post.title_es : post.title}
                      </h2>
                      <p style={{ fontSize:14, color:"#7a7a8a", lineHeight:1.7, marginBottom:16 }}>
                        {isES && post.excerpt_es ? post.excerpt_es : post.excerpt}
                      </p>
                      <span className="read-link" style={{ fontSize:13, fontWeight:600, color:"#00b96b" }}>
                        {isES?"Leer →":"Read →"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid #e8e8e2", padding:"24px", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap", marginBottom:10 }}>
          <Link href={isES?"/es":"/"} style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>{isES?"Inicio":"Home"}</Link>
          <Link href="/privacy"       style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>{isES?"Privacidad":"Privacy"}</Link>
          <Link href="/terms"         style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>{isES?"Términos":"Terms"}</Link>
          {isES
            ? <Link href="/blog"    style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>🇬🇧 English</Link>
            : <Link href="/es/blog" style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>🇪🇸 Español</Link>
          }
        </div>
        <p style={{ fontSize:12, color:"#cccccc" }}>
          {isES?"No es asesoramiento financiero. Rentabilidades pasadas ≠ resultados futuros."
               :"Not financial advice. Past performance ≠ future results."}
        </p>
      </footer>
    </>
  );
}
