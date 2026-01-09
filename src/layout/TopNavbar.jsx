// src/layout/TopNavbar.jsx
import React from "react";
import {
  FiHome,
  FiTarget,
  FiCode,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import "./layout.css";

function TopNavbar({ goHome, goFocus, goCompiler, goProgress, goSettings }) {
  return (
    <nav className="top-navbar">
      {/* LEFT LOGO */}
      <div className="logo">
        <h2 className="gradient-text" style={{ margin: 0 }}>
          VSR
        </h2>
      </div>

      {/* RIGHT ICON BUTTONS */}
      <div className="top-nav-icons">
        <button className="icon-btn" onClick={goHome} title="Home">
          <FiHome />
        </button>

        <button className="icon-btn" onClick={goFocus} title="Focus Mode">
          <FiTarget />
        </button>

        <button className="icon-btn" onClick={goCompiler} title="Compiler">
          <FiCode />
        </button>

        <button className="icon-btn" onClick={goProgress} title="Progress">
          <FiBarChart2 />
        </button>

        <button className="icon-btn" onClick={goSettings} title="Settings">
          <FiSettings />
        </button>
      </div>
    </nav>
  );
}

export default TopNavbar;
