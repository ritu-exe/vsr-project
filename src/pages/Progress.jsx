import React, { useEffect, useState } from "react";
import { getProgress } from "../services/progressService";
import "./progress.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Progress() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getProgress());
  }, []);

  const totalFocus = data.reduce((acc, d) => acc + d.focusTime, 0);
  const totalSessions = data.reduce((acc, d) => acc + d.sessions, 0);
  const totalCompiler = data.reduce((acc, d) => acc + d.compilerRuns, 0);
  const totalWhiteboard = data.reduce((acc, d) => acc + d.whiteboardUses, 0);

  // Generate placeholder weekly data for the bar chart
  const weekData = DAYS.map((day, i) => ({
    day,
    value: Math.floor(Math.random() * 80 + 20),
  }));
  const maxVal = Math.max(...weekData.map((d) => d.value));

  const stats = [
    { icon: "⏱️", label: "Focus Time", value: totalFocus, suffix: "min", card: 0 },
    { icon: "🎯", label: "Sessions", value: totalSessions, suffix: "total", card: 1 },
    { icon: "💻", label: "Compiler Runs", value: totalCompiler, suffix: "runs", card: 2 },
    { icon: "🧠", label: "Whiteboard Uses", value: totalWhiteboard, suffix: "uses", card: 3 },
  ];

  const achievements = [
    { icon: "🔥", label: "First Session", earned: totalSessions >= 1 },
    { icon: "⚡", label: "Code Runner", earned: totalCompiler >= 5 },
    { icon: "🧘", label: "Focus Master", earned: totalFocus >= 25 },
    { icon: "🧠", label: "Whiteboard Pro", earned: totalWhiteboard >= 3 },
    { icon: "🌟", label: "Study Legend", earned: totalSessions >= 10 },
    { icon: "🚀", label: "Dedicated", earned: totalFocus >= 100 },
  ];

  return (
    <div className="progress-container">

      {/* HEADER */}
      <div className="progress-header">
        <div className="progress-label">Analytics</div>
        <h1 className="progress-title">Progress Report</h1>
        <p className="progress-subtitle">Track your study sessions and achievements</p>
      </div>

      {/* STAT CARDS */}
      <div className="progress-grid">
        {stats.map((s, i) => (
          <div className="progress-card" key={i}>
            <span className="progress-card-icon">{s.icon}</span>
            <h3>{s.label}</h3>
            <p>{s.value}</p>
            <div className="progress-card-suffix">{s.suffix}</div>
          </div>
        ))}
      </div>

      {/* WEEKLY ACTIVITY */}
      <div className="progress-chart-section">
        <div className="chart-header">
          <div className="chart-title">Weekly Activity</div>
          <div className="chart-legend">
            <span>
              <span className="chart-legend-dot" style={{ background: "#6366f1" }} />
              Focus Minutes
            </span>
          </div>
        </div>
        <div className="progress-bar-chart">
          {weekData.map((d) => (
            <div className="bar-col" key={d.day}>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${(d.value / maxVal) * 100}%` }}
                />
              </div>
              <div className="bar-label">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="achievements-section">
        <div className="achievements-title">🏆 Achievements</div>
        <div className="achievements-grid">
          {achievements.map((a, i) => (
            <div
              key={i}
              className={`achievement-badge ${a.earned ? "badge-earned" : "badge-locked"}`}
              title={a.earned ? "Earned!" : "Keep going to unlock"}
            >
              <span>{a.earned ? a.icon : "🔒"}</span>
              {a.label}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Progress;