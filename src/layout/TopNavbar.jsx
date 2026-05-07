// src/layout/TopNavbar.jsx
import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiTarget,
  FiCode,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import "./layout.css";

function TopNavbar({ goHome, goFocus, goCompiler, goProgress, goSettings }) {
  /* DARK / LIGHT MODE STATE */
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <nav className="top-navbar">
      {/* LEFT LOGO */}
      <div className="logo">
        <h2 className="gradient-text" style={{ margin: 0 }}>
          Virtual Study Room
        </h2>
      </div>

      {/* RIGHT ICON BUTTONS */}
      <div className="top-nav-icons">

  

<button
  className="icon-btn home"
  onClick={() => {
    console.log("HOME CLICKED");
    goHome();
  }}
>
  <FiHome />
</button>

 <button
  className="icon-btn focus"
 onClick={() => {
  console.log("focus clicked");
  goFocus();
}}
>
  <FiTarget />
</button>

  <button className="icon-btn code" onClick={goCompiler} title="Compiler">
    <FiCode />
  </button>

  <button className="icon-btn stats" onClick={goProgress} title="Progress">
    <FiBarChart2 />
  </button>

  <button className="icon-btn settings" onClick={goSettings} title="Settings">
    <FiSettings />
  </button>

  {/* DARK / LIGHT MODE BUTTON */}
  <button
    className="icon-btn theme-toggle"
    onClick={() => setDarkMode(!darkMode)}
    title="Toggle Theme"
  >
    {darkMode ? <FiSun /> : <FiMoon />}
  </button>

</div>
    </nav>
  );
}

export default TopNavbar;