import React from "react";
import "./home.css";
import { getProgress } from "../services/progressService";

function Home({ setPage }) {
  const username = localStorage.getItem("username") || "Student";
  const progress = getProgress();
  const totalFocus = progress.reduce((a, d) => a + d.focusTime, 0);
  const totalSessions = progress.reduce((a, d) => a + d.sessions, 0);

  const features = [
    {
      icon: "🧘",
      label: "Focus Room",
      page: "focus",
      desc: "Pomodoro timer with ambient sounds",
      badge: "Active",
    },
    {
      icon: "💬",
      label: "Chat Room",
      page: "chat",
      desc: "Study with others in real-time",
    },
    {
      icon: "⚡",
      label: "Compiler",
      page: "compiler",
      desc: "Code in JS, Python, C++, Java",
      badge: "Live",
    },
    {
      icon: "🧠",
      label: "Whiteboard",
      page: "whiteboard",
      desc: "Draw, sketch & brainstorm",
    },
    {
      icon: "📊",
      label: "Progress",
      page: "progress",
      desc: "Track your study sessions",
    },
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

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="home-container">

      {/* HERO */}
      <div className="home-hero">
        <div>
          <div className="home-greeting">{greeting}</div>
          <h1 className="home-title">
            Welcome back,{" "}
            <span className="home-username">{username}</span> 👋
          </h1>
          <p className="home-motivation">"{quote}"</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stat-chip">
          <span className="stat-chip-icon">⏱️</span>
          <span className="stat-chip-val">{totalFocus}</span>
          <span>min focused</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-icon">🎯</span>
          <span className="stat-chip-val">{totalSessions}</span>
          <span>sessions</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-icon">🔥</span>
          <span className="stat-chip-val">{Math.max(1, Math.floor(totalFocus / 25))}</span>
          <span>day streak</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-icon">⭐</span>
          <span>Level {Math.max(1, Math.floor(totalSessions / 5) + 1)}</span>
        </div>
      </div>

      {/* FEATURES */}
      <div>
        <div className="section-label">Quick Access</div>
        <div className="feature-grid">
          {features.map((f) => (
            <div
              key={f.page}
              className="feature-card"
              data-page={f.page}
              onClick={() => setPage(f.page)}
            >
              <div className="feature-icon-box">{f.icon}</div>
              <div className="feature-label">{f.label}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVITY */}
      <div>
        <div className="section-label">Status</div>
        <div className="activity-strip">
          <div className="activity-card">
            <div className="activity-dot" style={{ background: "#22d3ee", boxShadow: "0 0 8px #22d3ee" }} />
            <div className="activity-text">
              <strong>AI Assistant</strong>
              Online & ready
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-dot" style={{ background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <div className="activity-text">
              <strong>Compiler</strong>
              Connected
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-dot" style={{ background: "#6366f1", boxShadow: "0 0 8px #6366f1" }} />
            <div className="activity-text">
              <strong>Study Room</strong>
              Active
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
