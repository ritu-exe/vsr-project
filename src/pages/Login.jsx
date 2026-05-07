import { useState } from "react";
import { login, register } from "../services/authService";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) return setError("Fill in all fields");
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.token) {
      setUser(res.username);
    } else {
      setError(res.error || "Login failed");
    }
  }

  async function handleSignup() {
    if (!username || !password) return setError("Fill in all fields");
    if (password.length < 4) return setError("Password must be at least 4 characters");
    setLoading(true);
    const res = await register(username, password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setError("");
      setMode("login");
      alert("Account created! Please log in.");
    }
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #020617, #0f172a)",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        background: "rgba(15, 23, 42, 0.9)",
        borderRadius: "20px",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)"
      }}>

        <h1 style={{
          margin: "0 0 6px 0",
          fontSize: "24px",
          fontWeight: 700,
          background: "linear-gradient(90deg, #6366f1, #22d3ee)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Virtual Study Room
        </h1>

        <p style={{ margin: "0 0 28px 0", color: "#64748b", fontSize: "14px" }}>
          {mode === "login" ? "Sign in to continue studying" : "Create your account"}
        </p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                transition: "all 0.2s",
                background: mode === m
                  ? "linear-gradient(135deg, #6366f1, #3b82f6)"
                  : "rgba(255,255,255,0.05)",
                color: mode === m ? "white" : "#64748b"
              }}
            >
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())}
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px", margin: "12px 0 0 0" }}>
            {error}
          </p>
        )}

        <button
          onClick={mode === "login" ? handleLogin : handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "13px",
            borderRadius: "12px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "15px",
            background: loading
              ? "rgba(99,102,241,0.4)"
              : "linear-gradient(135deg, #6366f1, #3b82f6)",
            color: "white",
            transition: "all 0.2s",
            boxShadow: "0 4px 20px rgba(99,102,241,0.4)"
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>

      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(99,102,241,0.3)",
  background: "rgba(255,255,255,0.05)",
  color: "#e2e8f0",
  fontSize: "14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box"
};

export default Login;
