"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/admin");
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"clamp(32px,5vw,48px)", width:"100%", maxWidth:400 }}>
        <div className="pixel" style={{ fontSize:11, color:"white", marginBottom:32 }}>
          ETF<span style={{ color:"var(--green)" }}>.</span>PLAN <span style={{ opacity:0.4, fontSize:9 }}>ADMIN</span>
        </div>
        <h1 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:24, color:"white", marginBottom:8, letterSpacing:"-0.5px" }}>Admin access</h1>
        <p style={{ fontFamily:"DM Sans", fontSize:14, color:"rgba(255,255,255,0.4)", marginBottom:28 }}>Enter your admin password to continue.</p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width:"100%", padding:"13px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.06)", color:"white", fontFamily:"DM Sans", fontSize:15, marginBottom:12, outline:"none", boxSizing:"border-box" }}
          />
          {error && <div style={{ fontFamily:"DM Sans", fontSize:13, color:"#ff6b6b", marginBottom:12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width:"100%", padding:"14px 0", borderRadius:10, border:"none",
            background: loading ? "rgba(0,185,107,0.5)" : "var(--green)",
            color:"white", fontFamily:"DM Sans", fontWeight:700, fontSize:15,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow:"0 4px 16px rgba(0,185,107,0.3)",
          }}>
            {loading ? "Checking…" : "Enter admin →"}
          </button>
        </form>
      </div>
    </div>
  );
}
