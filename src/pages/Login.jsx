import { useState } from "react";
import { login, register } from "../services/authService";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!username || !password) return setError("Fill in all fields");
    const res = await login(username, password);
    if (res.token) {
      setUser(res.username);
    } else {
      setError(res.error || "Login failed");
    }
  }

  async function handleSignup() {
    if (!username || !password) return setError("Fill in all fields");
    const res = await register(username, password);
    if (res.error) {
      setError(res.error);
    } else {
      setError("");
      alert("Account created! Please log in.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <br /><br />

      {error && <p style={{ color: "red", marginBottom: "8px" }}>{error}</p>}

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup} style={{ marginLeft: "8px" }}>Signup</button>
    </div>
  );
}

export default Login;
