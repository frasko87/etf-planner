"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import Link from "next/link";

function LoginForm() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const [mode, setMode]       = useState(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess("Check your email to confirm your account, then log in.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError(""); setSuccess("");
    if (!email) { setError("Enter your email address first, then click Forgot password."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });
      if (err) throw err;
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (err) setError(err.message);
  };

  const inp = {
    width: "100%", padding: "12px 14px",
    background: "var(--bg3)", border: "1.5px solid var(--border)",
    borderRadius: 10, color: "var(--text)",
    fontFamily: "DM Sans", fontSize: 14,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

      <Link href="/" className="pixel" style={{ fontSize: 12, color: "var(--text)", marginBottom: 40, display: "block" }}>
        ETF<span style={{ color: "var(--green)" }}>.</span>PLAN
      </Link>

      <div style={{ width: "100%", maxWidth: 420, background: "white", border: "1px solid var(--border)", borderRadius: 20, padding: 36, boxShadow: "var(--shadow2)" }}>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer", transition: "all 0.15s",
              background: mode === m ? "white" : "transparent",
              color: mode === m ? "var(--text)" : "var(--muted)",
              fontFamily: "DM Sans", fontWeight: mode === m ? 600 : 400, fontSize: 14,
              boxShadow: mode === m ? "var(--shadow)" : "none",
            }}>
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <h2 style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: 24, color: "var(--text)", marginBottom: 6 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>
          {mode === "login" ? "Log in to access your investment plans." : "Free forever. No credit card required."}
        </p>

        {/* Google */}
        <button onClick={handleGoogle} style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", marginBottom: 16, background: "white", border: "1.5px solid var(--border)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span style={{ fontFamily: "DM Sans", fontSize: 14, color: "var(--text)" }}>Continue with Google</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span className="mono" style={{ fontSize: 10, color: "var(--muted2)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
          <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
          <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" />
        </div>

        {/* Forgot password */}
        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <button onClick={handleReset} disabled={loading} style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontFamily: "DM Sans", fontSize: 12, fontWeight: 500 }}>
              Forgot password?
            </button>
          </div>
        )}

        {!mode === "login" && <div style={{ marginBottom: 16 }} />}

        {/* Messages */}
        {error   && <div style={{ fontSize: 13, color: "var(--red)",   marginBottom: 14, padding: "10px 14px", background: "var(--red2)",   borderRadius: 8, border: "1px solid rgba(232,64,64,0.2)" }}>{error}</div>}
        {success && <div style={{ fontSize: 13, color: "var(--green)", marginBottom: 14, padding: "10px 14px", background: "var(--green2)", borderRadius: 8, border: "1px solid rgba(0,185,107,0.2)" }}>{success}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
          background: loading ? "var(--border)" : "var(--green)",
          color: loading ? "var(--muted)" : "white",
          fontFamily: "DM Sans", fontWeight: 600, fontSize: 15,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 16px rgba(0,185,107,0.3)",
          transition: "all 0.15s",
        }}>
          {loading ? "Please wait…" : mode === "login" ? "Log in →" : "Create account →"}
        </button>

        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 20 }}>
          {mode === "login" ? "No account? " : "Already have one? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
            style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontFamily: "DM Sans", fontSize: 12, fontWeight: 500 }}>
            {mode === "login" ? "Sign up free" : "Log in"}
          </button>
        </p>
      </div>

      <p style={{ fontSize: 11, color: "var(--muted2)", marginTop: 24, textAlign: "center" }}>
        Not financial advice. Past performance ≠ future results.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "DM Mono", fontSize: 12, color: "var(--muted)" }}>Loading…</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
