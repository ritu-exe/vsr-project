import React from "react";
import "./home.css";

function Home({ setPage }) {

  const username = "Yatree";

  const motivation = [
    "Small progress every day leads to big results.",
    "Focus. Learn. Build.",
    "Consistency beats motivation.",
    "Discipline is the bridge between goals and success."
  ];

  const randomMotivation =
    motivation[Math.floor(Math.random() * motivation.length)];

  return (
    <div className="home-container">

      {/* 🔹 Top Right Whiteboard Button */}
      <button 
        className="top-whiteboard-btn"
        onClick={() => setPage("whiteboard")}
      >
        🧠 Whiteboard
      </button>

      {/* 🔹 Welcome */}
      <h1 className="home-title">
        Welcome back, {} 👋
      </h1>

      {/* 🔹 Motivation */}
      <p className="home-motivation">
        "{randomMotivation}"
      </p>

      {/* 🔹 Logout */}
      <button className="logout-btn">
        Logout
      </button>

    </div>
  );
}

export default Home;