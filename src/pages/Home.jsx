import React from "react";
import "./home.css";

function Home() {

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

      <h1 className="home-title">
        Welcome back, {username} 👋
      </h1>

      <p className="home-motivation">
        "{randomMotivation}"
      </p>

      <div className="home-buttons">

        <button className="home-btn">
          🧠 Whiteboard
        </button>

        <button className="home-btn">
          💻 Compiler
        </button>

        <button className="home-btn">
          🎯 Focus Mode
        </button>

        <button className="home-btn">
          💬 Chat Room
        </button>

      </div>

      <button className="logout-btn">
        Logout
      </button>

    </div>
  );
}

export default Home;