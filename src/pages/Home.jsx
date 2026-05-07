import React from "react";
import "./home.css";

function Home({ setPage }) {
  const username = localStorage.getItem("username") || "Student";

  const features = [
    { icon: "🧘", label: "Focus Room", page: "focus", desc: "Pomodoro timer + ambient sounds" },
    { icon: "💬", label: "Chat Room", page: "chat", desc: "Study with others in real-time" },
    { icon: "⚡", label: "Compiler", page: "compiler", desc: "Code in JS, Python, C++, Java" },
    { icon: "🧠", label: "Whiteboard", page: "whiteboard", desc: "Draw, sketch and brainstorm" },
    { icon: "📊", label: "Progress", page: "progress", desc: "Track your study sessions" },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  }

  const motivations = [
    "Small progress every day leads to big results.",
    "Focus. Learn. Build.",
    "Consistency beats motivation.",
    "Discipline is the bridge between goals and success.",
    "Every expert was once a beginner.",
  ];

  const quote = motivations[Math.floor(Math.random() * motivations.length)];

  return (
    <div className="home-container">

      <div className="home-header">
        <div>
          <h1 className="home-title">Welcome back, <span className="home-username">{username}</span> 👋</h1>
          <p className="home-motivation">"{quote}"</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="feature-grid">
        {features.map((f) => (
          <div key={f.page} className="feature-card" onClick={() => setPage(f.page)}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-label">{f.label}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Home;
