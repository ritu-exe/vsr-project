import { useState } from "react";
import { login, register } from "../services/authService";

const ORB_STYLES = [
  { top: "-8%", left: "-4%", width: 700, height: 700, bg: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)" },
  { bottom: "-10%", right: "-4%", width: 600, height: 600, bg: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(34,211,238,0.04) 40%, transparent 70%)" },
  { top: "35%", left: "35%", width: 400, height: 400, bg: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)" },
];

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) return setError("Please fill in all fields");
    if (password.length < 4) return setError("Password must be at least 4 characters");
    setError("");
    setLoading(true);

    if (mode === "login") {
      const res = await login(username, password);
      setLoading(false);
      if (res.token) setUser(res.username);
      else setError(res.error || "Invalid credentials");
    } else {
      const res = await register(username, password);
      setLoading(false);
      if (res.error) setError(res.error);
      else { setMode("login"); setError(""); }
    }
  }

  return (
    <div style={styles.root}>

      {/* ANIMATED BACKGROUND */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "linear-gradient(135deg, #06080f 0%, #0b0f1a 60%, #06080f 100%)",
      }}>
        {ORB_STYLES.map((s, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%",
            pointerEvents: "none", filter: "blur(40px)",
            width: s.width, height: s.height,
            background: s.bg,
            ...("top" in s ? { top: s.top } : {}),
            ...("bottom" in s ? { bottom: s.bottom } : {}),
            ...("left" in s ? { left: s.left } : {}),
            ...("right" in s ? { right: s.right } : {}),
          }} />
        ))}
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(99,102,241,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* CARD */}
      <div style={styles.card}>

        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 3,
          background: "linear-gradient(90deg, #6366f1, #22d3ee, #a78bfa)",
          borderRadius: "20px 20px 0 0",
        }} />

        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <span>📚</span>
          </div>
          <div>
            <h1 style={styles.logoTitle}>Virtual Study Room</h1>
            <p style={styles.logoSub}>Your collaborative learning space</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={styles.tabs}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                ...styles.tab,
                ...(mode === m ? styles.tabActive : {}),
              }}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Fields */}
        <div style={styles.fields}>
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Username</label>
            <div style={{ position: "relative" }}>
              <span style={styles.inputIcon}>👤</span>
              <input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={styles.input}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <span style={{
                width: 16, height: 16,
                border: "2.5px solid rgba(255,255,255,0.25)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 0.75s linear infinite",
                display: "inline-block"
              }} />
              Please wait...
            </span>
          ) : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        {/* Footer switch */}
        <p style={styles.switchText}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={styles.switchLink}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>

        {/* Feature pills */}
        <div style={styles.pills}>
          {["🧘 Focus Timer", "💻 Compiler", "🧠 Whiteboard", "🤖 AI Chat"].map((p) => (
            <span key={p} style={styles.pill}>{p}</span>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    padding: "40px 38px 32px",
    background: "rgba(11,15,26,0.88)",
    borderRadius: 22,
    border: "1px solid rgba(99,102,241,0.15)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)",
    backdropFilter: "blur(28px)",
    position: "relative",
    zIndex: 1,
    animation: "fadeUp 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    boxShadow: "0 0 24px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: 19,
    fontWeight: 800,
    background: "linear-gradient(90deg, #c7d2fe, #22d3ee)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  logoSub: {
    fontSize: 12,
    color: "#475569",
    marginTop: 3,
  },
  tabs: {
    display: "flex",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  tab: {
    flex: 1,
    padding: "9px 0",
    borderRadius: 9,
    border: "none",
    background: "transparent",
    color: "#475569",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabActive: {
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "white",
    boxShadow: "0 2px 14px rgba(99,102,241,0.4)",
    fontWeight: 700,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.05)",
    marginBottom: 22,
  },
  fields: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginBottom: 10,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 15,
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    padding: "12px 14px 12px 40px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    width: "100%",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: "2px 4px",
  },
  error: {
    color: "#fca5a5",
    fontSize: 13,
    margin: "12px 0 6px",
    padding: "10px 14px",
    background: "rgba(239,68,68,0.08)",
    borderRadius: 10,
    border: "1px solid rgba(239,68,68,0.2)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    lineHeight: 1.5,
  },
  submitBtn: {
    width: "100%",
    marginTop: 22,
    padding: "14px",
    borderRadius: 14,
    border: "none",
    fontWeight: 700,
    fontSize: 15,
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "white",
    boxShadow: "0 4px 24px rgba(99,102,241,0.45)",
    transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
    letterSpacing: "0.02em",
  },
  switchText: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 13,
    color: "#475569",
  },
  switchLink: {
    color: "#818cf8",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
  pills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  pill: {
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#475569",
    transition: "all 0.2s ease",
  },
};

export default Login;
