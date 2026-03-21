"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if not already accepted
    const accepted = localStorage.getItem("etfplan_cookies");
    if (!accepted) {
      // Small delay so it doesn't flash on first render
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("etfplan_cookies", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("etfplan_cookies", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: "clamp(12px,2vw,20px) clamp(16px,4vw,32px)",
      background: "#1a1a2e",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 14, color: "white", marginBottom: 4 }}>
          We use essential cookies 🍪
        </div>
        <div style={{ fontFamily: "DM Sans", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          We only use cookies to keep you logged in. No tracking, no ads.{" "}
          <a href="/privacy" style={{ color: "#00b96b", textDecoration: "none" }}>Privacy policy</a>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            fontFamily: "DM Sans", fontSize: 13, padding: "8px 16px",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
            background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer",
          }}>
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            fontFamily: "DM Sans", fontWeight: 600, fontSize: 13, padding: "8px 20px",
            border: "none", borderRadius: 8,
            background: "#00b96b", color: "white", cursor: "pointer",
            boxShadow: "0 2px 12px rgba(0,185,107,0.3)",
          }}>
          Accept
        </button>
      </div>
    </div>
  );
}
