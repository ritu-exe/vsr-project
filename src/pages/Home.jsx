import React from "react";

function Home() {
  return (
    <div className="home-container">

      <h1 className="gradient-text">Welcome to Virtual Study Room 👋</h1>

      <h2>Quick Actions</h2>
      <ul>
        <li>Join Study Room</li>
        <li>Start Focus Timer</li>
        <li>Open AI Assistant</li>
      </ul>

      <h2>Active Study Rooms</h2>
      <ul>
        <li>#frontend-chat</li>
        <li>#backend-chat</li>
      </ul>

      <h2>Focus Timer</h2>
      <p>Stay focused for 25 minutes and take a 5-minute break.</p>

      <p style={{ marginTop: "30px", fontStyle: "italic" }}>
        ✨ “Success doesn’t come from what you do occasionally, it comes from what you do consistently.”
      </p>

    </div>
  );
}

export default Home;