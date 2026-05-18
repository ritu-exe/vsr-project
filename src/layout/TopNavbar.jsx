import React, { useState, useEffect } from "react";
import { FiHome, FiTarget, FiCode, FiBarChart2, FiSun, FiMoon, FiBell, FiUsers } from "react-icons/fi";
import "./layout.css";

const navItems = [
  { icon: FiHome, label: "Home", key: "home", color: "#6366f1" },
  { icon: FiTarget, label: "Focus", key: "focus", color: "#f97316" },
  { icon: FiCode, label: "Compiler", key: "compiler", color: "#22c55e" },
  { icon: FiBarChart2, label: "Progress", key: "progress", color: "#a855f7" },
  { icon: FiUsers, label: "Friends", key: "friends", color: "#eab308" },
];

function TopNavbar({ goHome, goFocus, goCompiler, goProgress, goFriends, currentPage }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // default dark
  });
  const username = localStorage.getItem("username") || "User";
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    document.body.classList.toggle("light-mode", !darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handlers = { home: goHome, focus: goFocus, compiler: goCompiler, progress: goProgress, friends: goFriends };
  const colors = { home: "#6366f1", focus: "#f97316", compiler: "#22c55e", progress: "#a855f7", friends: "#eab308" };

  return (
    <nav className="top-navbar">

      {/* BRAND */}
      <div className="nav-brand">
        <div className="nav-brand-icon">📚</div>
        <div>
          <div className="nav-brand-name">Virtual Study Room</div>
          <div className="nav-brand-tagline">Learn · Focus · Build</div>
        </div>
      </div>

      {/* NAV ITEMS */}
      <div className="nav-items">
        {navItems.map(({ icon: Icon, label, key, color }) => {
          const active = currentPage === key;
          return (
            <button
              key={key}
              onClick={handlers[key]}
              className={`nav-item${active ? " active" : ""}`}
              style={{ color: active ? color : undefined }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* RIGHT ACTIONS */}
      <div className="nav-right">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="nav-action-btn"
          title="Toggle theme"
        >
          {darkMode ? <FiSun size={15} style={{ color: "#facc15" }} /> : <FiMoon size={15} />}
        </button>

        <button className="nav-action-btn" title="Notifications">
          <FiBell size={15} />
        </button>

        <div
          className="nav-avatar"
          title={username}
          style={{
            background: `linear-gradient(135deg, ${colors[currentPage] || "#6366f1"}, #3b82f6)`
          }}
        >
          {initials}
        </div>
      </div>

    </nav>
  );
}

export default TopNavbar;
