// app/blog/not-found.js
// Shows when a blog slug doesn't exist — goes back to blog, not homepage
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div style={{ minHeight:"100vh", background:"#f8f8f5", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"DM Sans,Arial,sans-serif" }}>
      <div style={{ textAlign:"center", maxWidth:420 }}>
        <div style={{ fontFamily:"DM Mono,monospace", fontSize:12, letterSpacing:2, color:"#aaaabc", marginBottom:24 }}>
          ETF<span style={{ color:"#00b96b" }}>.</span>PLAN · BLOG
        </div>
        <div style={{ fontSize:80, fontWeight:800, color:"#1a1a2e", lineHeight:1, marginBottom:8, letterSpacing:"-3px" }}>404</div>
        <div style={{ fontSize:22, fontWeight:700, color:"#1a1a2e", marginBottom:10 }}>Article not found</div>
        <p style={{ fontSize:15, color:"#7a7a8a", lineHeight:1.75, marginBottom:32 }}>
          This article doesn't exist or may have been moved. Browse all our ETF investing guides below.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/blog" style={{ fontWeight:700, fontSize:14, color:"white", background:"#00b96b", padding:"12px 24px", borderRadius:10, textDecoration:"none" }}>
            ← Browse all articles
          </Link>
          <Link href="/" style={{ fontWeight:600, fontSize:14, color:"#1a1a2e", background:"white", padding:"12px 24px", borderRadius:10, textDecoration:"none", border:"1px solid #e8e8e2" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
