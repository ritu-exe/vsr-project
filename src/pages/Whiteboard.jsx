import React, { useRef, useState, useEffect } from "react";
import { updateProgress } from "../services/progressService"; // ✅ IMPORTANT

function Whiteboard() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);

  /* 🔥 TRACK WHITEBOARD USAGE */
  useEffect(() => {
    updateProgress("whiteboardUses", 1);
  }, []);

  /* ================= SETUP CANVAS ================= */

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.7;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    ctxRef.current = ctx;
  }, []);

  /* ================= UPDATE BRUSH ================= */

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  /* ================= DRAWING ================= */

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setDrawing(false);
  };

  /* ================= CLEAR ================= */

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      
      <h2 style={{ color: "#38bdf8" }}>🧠 Whiteboard</h2>

      {/* 🔹 TOOLS */}
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <input
          type="range"
          min="1"
          max="10"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />

        <button onClick={clearCanvas}>Clear</button>
      </div>

      {/* 🔹 CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid #334155",
          borderRadius: "10px",
          background: "#020617",
          cursor: "crosshair",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}

export default Whiteboard;