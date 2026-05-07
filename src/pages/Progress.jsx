import React, { useEffect, useState } from "react";
import { getProgress } from "../services/progressService";
import "./progress.css";

function Progress() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getProgress());
  }, []);

  const totalFocus = data.reduce((acc, d) => acc + d.focusTime, 0);
  const totalSessions = data.reduce((acc, d) => acc + d.sessions, 0);
  const totalCompiler = data.reduce((acc, d) => acc + d.compilerRuns, 0);
  const totalWhiteboard = data.reduce((acc, d) => acc + d.whiteboardUses, 0);

  return (
    <div className="progress-container">
      <h1 className="progress-title">📊 Progress Report</h1>

      <div className="progress-grid">

        <div className="progress-card">
          <h3>⏱️ Focus Time</h3>
          <p>{totalFocus} min</p>
        </div>

        <div className="progress-card">
          <h3>📊 Sessions</h3>
          <p>{totalSessions}</p>
        </div>

        <div className="progress-card">
          <h3>💻 Compiler Runs</h3>
          <p>{totalCompiler}</p>
        </div>

        <div className="progress-card">
          <h3>🧠 Whiteboard Uses</h3>
          <p>{totalWhiteboard}</p>
        </div>

      </div>
    </div>
  );
}

export default Progress;