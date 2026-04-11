"use client";
// components/BlogPost.js
// Renders individual blog post for both EN and ES locales

import Link from "next/link";
import { useState, useEffect } from "react";

export default function BlogPost({ post, related, locale = "en" }) {
  const [isMob, setIsMob] = useState(false);
  const isES = locale === "es";

  useEffect(() => {
    const check = () => setIsMob(window.innerWidth < 680);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const title   = isES && post.title_es   ? post.title_es   : post.title;
  const content = isES && post.content_es ? post.content_es : post.content;
  const baseBlog = isES ? "/es/blog" : "/blog";

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(isES ? "es-ES" : "en-US", { year:"numeric", month:"long", day:"numeric" })
    : null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${title} — ${isES ? "en ETF.PLAN blog" : "on ETF.PLAN blog"}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#f8f8f5;color:#1a1a2e;font-family:'DM Sans',Arial,sans-serif;}
    .pixel{font-family:'Press Start 2P',monospace;}
    .mono{font-family:'DM Mono',monospace;}
    .post-body h2{font-size:22px;font-weight:700;color:#1a1a2e;margin:32px 0 12px;letter-spacing:-0.3px;}
    .post-body h3{font-size:18px;font-weight:700;color:#1a1a2e;margin:24px 0 10px;}
    .post-body p{font-size:17px;line-height:1.8;color:#3a3a4e;margin-bottom:18px;}
    .post-body strong{color:#1a1a2e;font-weight:700;}
    .post-body ul,.post-body ol{padding-left:24px;margin-bottom:18px;}
    .post-body li{font-size:16px;line-height:1.8;color:#3a3a4e;margin-bottom:6px;}
    .post-body a{color:#00b96b;text-decoration:none;}
    .post-body a:hover{text-decoration:underline;}
    .post-body blockquote{border-left:3px solid #00b96b;padding:12px 20px;margin:24px 0;background:rgba(0,185,107,0.04);border-radius:0 8px 8px 0;}
    .post-body blockquote p{color:#555;font-style:italic;margin:0;}
    .post-body code{font-family:'DM Mono',monospace;background:#f0f0ec;padding:2px 6px;border-radius:4px;font-size:14px;}
    .related-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,0.07);}
    .related-card{transition:all 0.2s;}
  `;

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <header style={{ background:"#f8f8f5", borderBottom:"1px solid #e8e8e2", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href={isES?"/es":"/"} className="pixel" style={{ fontSize:isMob?9:11, color:"#1a1a2e", textDecoration:"none" }}>
          ETF<span style={{ color:"#00b96b" }}>.</span>PLAN
        </Link>
        <nav style={{ display:"flex", gap:isMob?12:20, alignItems:"center" }}>
          <Link href={baseBlog} style={{ fontSize:14, color:"#7a7a8a", textDecoration:"none" }}>
            ← {isES?"Blog":"Blog"}
          </Link>
          <Link href="/login?mode=signup" style={{ fontSize:14, fontWeight:600, color:"white", background:"#00b96b", padding:"7px 16px", borderRadius:8, textDecoration:"none" }}>
            {isES?"Empezar gratis →":"Start free →"}
          </Link>
          {isES
            ? <Link href={`/blog/${post.slug}`} style={{ fontSize:12, color:"#aaaabc", textDecoration:"none" }}>🇬🇧 EN</Link>
            : post.slug_es && <Link href={`/es/blog/${post.slug_es}`} style={{ fontSize:12, color:"#aaaabc", textDecoration:"none" }}>🇪🇸 ES</Link>
          }
        </nav>
      </header>

      {/* Article header */}
      <section style={{ background:"#1a1a2e", padding:isMob?"48px 20px 40px":"72px 24px 64px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
            <Link href={baseBlog} style={{ fontSize:12, fontFamily:"DM Mono,monospace", color:"rgba(255,255,255,0.35)", textDecoration:"none" }}>
              ← {isES?"Blog":"Blog"}
            </Link>
            <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"#00b96b", background:"rgba(0,185,107,0.12)", padding:"3px 10px", borderRadius:100 }}>
              {post.category}
            </span>
            <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"rgba(255,255,255,0.3)" }}>
              {post.reading_time} {isES?"min de lectura":"min read"}
            </span>
          </div>
          <h1 style={{ fontSize:isMob?"clamp(22px,6vw,32px)":"clamp(28px,3.5vw,42px)", fontWeight:800, color:"white", lineHeight:1.2, letterSpacing:"-0.8px", marginBottom:16 }}>
            {title}
          </h1>
          {date && (
            <p style={{ fontSize:13, fontFamily:"DM Mono,monospace", color:"rgba(255,255,255,0.35)" }}>
              {post.author} · {date}
            </p>
          )}
        </div>
      </section>

      {/* Article body */}
      <article style={{ maxWidth:720, margin:"0 auto", padding:isMob?"32px 16px":"48px 24px" }}>
        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: content || "<p>Content coming soon.</p>" }}
        />

        {/* Share */}
        <div style={{ marginTop:48, padding:"24px", background:"white", border:"1px solid #e8e8e2", borderRadius:14 }}>
          <p style={{ fontSize:14, fontWeight:600, color:"#1a1a2e", marginBottom:14 }}>
            {isES?"¿Te resultó útil? Compártelo:":"Found this useful? Share it:"}
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <a href={whatsappUrl} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", gap:8, background:"#25d366", color:"white", padding:"9px 18px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a href={twitterUrl} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", gap:8, background:"#000", color:"white", padding:"9px 18px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </a>
            <Link href="/login?mode=signup"
              style={{ display:"flex", alignItems:"center", gap:8, background:"#00b96b", color:"white", padding:"9px 18px", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>
              {isES?"Probar ETF.PLAN gratis →":"Try ETF.PLAN free →"}
            </Link>
          </div>
        </div>

        {/* CTA box */}
        <div style={{ margin:"32px 0", background:"#1a1a2e", borderRadius:14, padding:"28px 24px" }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:10 }}>
            ETF.PLAN
          </div>
          <h3 style={{ fontSize:20, fontWeight:700, color:"white", marginBottom:8, letterSpacing:"-0.3px" }}>
            {isES?"Construye tu plan de inversión en 2 minutos":"Build your investment plan in 2 minutes"}
          </h3>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginBottom:20 }}>
            {isES
              ? "Te decimos exactamente qué ETFs comprar cada mes, cuánto invertir en cada uno y cómo seguir tu progreso. Gratis para siempre."
              : "We tell you exactly which ETFs to buy each month, how much to put in each, and how to track your progress. Free forever."}
          </p>
          <Link href="/login?mode=signup" style={{ display:"inline-block", background:"#00b96b", color:"white", fontWeight:700, fontSize:15, padding:"12px 24px", borderRadius:10, textDecoration:"none" }}>
            {isES?"Crear mi plan gratis →":"Get my free plan →"}
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop:40 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>
              {isES?"Artículos relacionados":"Related articles"}
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"repeat(2,1fr)", gap:16 }}>
              {related.map(r => {
                const href = `${baseBlog}/${isES&&r.slug_es ? r.slug_es : r.slug}`;
                return (
                  <Link key={r.id} href={href} style={{ textDecoration:"none" }}>
                    <div className="related-card" style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:12, padding:20 }}>
                      <span style={{ fontSize:11, fontFamily:"DM Mono,monospace", color:"#00b96b", display:"block", marginBottom:8 }}>
                        {r.reading_time} {isES?"min":"min read"}
                      </span>
                      <h3 style={{ fontSize:15, fontWeight:700, color:"#1a1a2e", lineHeight:1.4, marginBottom:8 }}>
                        {isES&&r.title_es ? r.title_es : r.title}
                      </h3>
                      <span style={{ fontSize:13, color:"#00b96b", fontWeight:600 }}>
                        {isES?"Leer →":"Read →"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid #e8e8e2", padding:"24px", textAlign:"center", marginTop:40 }}>
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap", marginBottom:10 }}>
          <Link href={baseBlog}    style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>Blog</Link>
          <Link href={isES?"/es":"/"} style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>{isES?"Inicio":"Home"}</Link>
          <Link href="/privacy"    style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>{isES?"Privacidad":"Privacy"}</Link>
        </div>
        <p style={{ fontSize:12, color:"#cccccc" }}>
          {isES?"No es asesoramiento financiero. Rentabilidades pasadas ≠ resultados futuros."
               :"Not financial advice. Past performance ≠ future results."}
        </p>
      </footer>
    </>
  );
}
