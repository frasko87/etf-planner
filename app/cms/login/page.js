"use client";
// app/cms/login/page.js
// Copywriter login — separate from admin panel

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CMSLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Fill in both fields."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cms/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || "Invalid credentials");

      // Store token + writer info in sessionStorage
      sessionStorage.setItem("cms_token", data.token);
      sessionStorage.setItem("cms_writer", JSON.stringify(data.writer));
      router.push("/cms");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8f8f5", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:13, color:"#1a1a2e", marginBottom:8 }}>
        ETF<span style={{ color:"#00b96b" }}>.</span>PLAN
      </div>
      <div style={{ fontSize:12, fontFamily:"DM Mono,monospace", color:"#aaaabc", marginBottom:40, letterSpacing:1 }}>
        CONTENT STUDIO
      </div>

      <div style={{ background:"white", border:"1px solid #e8e8e2", borderRadius:16, padding:36, width:"100%", maxWidth:380 }}>
        <h1 style={{ fontFamily:"DM Sans,Arial,sans-serif", fontSize:22, fontWeight:700, color:"#1a1a2e", marginBottom:6 }}>Writer login</h1>
        <p style={{ fontFamily:"DM Sans,Arial,sans-serif", fontSize:14, color:"#7a7a8a", marginBottom:28 }}>Access your content dashboard.</p>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:12, fontFamily:"DM Mono,monospace", color:"#aaaabc", letterSpacing:1, marginBottom:6 }}>EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #e8e8e2", borderRadius:10, fontFamily:"DM Sans,Arial,sans-serif", fontSize:14, color:"#1a1a2e", background:"#fafafa", outline:"none" }}
            placeholder="you@email.com"
          />
        </div>

        <div style={{ marginBottom:24 }}>
          <label style={{ display:"block", fontSize:12, fontFamily:"DM Mono,monospace", color:"#aaaabc", letterSpacing:1, marginBottom:6 }}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #e8e8e2", borderRadius:10, fontFamily:"DM Sans,Arial,sans-serif", fontSize:14, color:"#1a1a2e", background:"#fafafa", outline:"none" }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{ background:"#fff5f5", border:"1px solid #ffdddd", borderRadius:8, padding:"10px 14px", marginBottom:16, fontFamily:"DM Sans,Arial,sans-serif", fontSize:13, color:"#cc2200" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width:"100%", padding:"13px 0", background:loading?"#e8e8e2":"#00b96b", color:loading?"#aaaabc":"white", border:"none", borderRadius:10, fontFamily:"DM Sans,Arial,sans-serif", fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Signing in..." : "Sign in →"}
        </button>
      </div>

      <p style={{ fontFamily:"DM Sans,Arial,sans-serif", fontSize:12, color:"#aaaabc", marginTop:24 }}>
        No account? Ask the admin to add you.
      </p>
    </div>
  );
}
