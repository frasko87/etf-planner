// app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh", background:"#f8f8f5", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:13, letterSpacing:3, color:"#1a1a2e", marginBottom:24 }}>
          ETF<span style={{ color:"#00b96b" }}>.</span>PLAN
        </div>
        <div style={{ fontFamily:"monospace", fontSize:72, fontWeight:700, color:"#1a1a2e", lineHeight:1, marginBottom:8 }}>404</div>
        <div style={{ fontFamily:"Arial, sans-serif", fontWeight:700, fontSize:22, color:"#1a1a2e", marginBottom:10 }}>Page not found</div>
        <div style={{ fontFamily:"Arial, sans-serif", fontSize:14, color:"#7a7a8a", lineHeight:1.7, marginBottom:32 }}>
          This page doesn't exist or has been moved.
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/" style={{ fontFamily:"Arial, sans-serif", fontWeight:600, fontSize:14, color:"white", background:"#1a1a2e", padding:"12px 24px", borderRadius:10, textDecoration:"none" }}>
            ← Back home
          </Link>
          <Link href="/dashboard" style={{ fontFamily:"Arial, sans-serif", fontWeight:600, fontSize:14, color:"white", background:"#00b96b", padding:"12px 24px", borderRadius:10, textDecoration:"none" }}>
            My dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
