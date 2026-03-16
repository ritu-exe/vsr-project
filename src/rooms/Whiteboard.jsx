import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef, useState } from "react";

function Whiteboard() {
  const canvasRef = useRef(null);

  const [color, setColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(4);

  const colors = [
    "#ffffff",
    "#ff4d4d",
    "#4ade80",
    "#38bdf8",
    "#facc15",
    "#c084fc"
  ];

  const saveImage = async () => {
    const data = await canvasRef.current.exportImage("png");
    const link = document.createElement("a");
    link.href = data;
    link.download = "whiteboard.png";
    link.click();
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* TOOLBAR */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "10px",
          background: "rgba(0,0,0,0.4)",
          borderRadius: "8px",
          marginBottom: "10px",
          alignItems: "center"
        }}
      >

        <button onClick={() => canvasRef.current.undo()}>Undo</button>
        <button onClick={() => canvasRef.current.redo()}>Redo</button>
        <button onClick={() => canvasRef.current.clearCanvas()}>Clear</button>
        <button onClick={saveImage}>Save</button>

        {/* ERASER */}
        <button onClick={() => setColor("#0f172a")}>Eraser</button>

        {/* COLOR PICKER */}
        <div style={{ display: "flex", gap: "6px" }}>
          {colors.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: "20px",
                height: "20px",
                background: c,
                borderRadius: "50%",
                cursor: "pointer",
                border: "2px solid white"
              }}
            />
          ))}
        </div>

        {/* BRUSH SIZE */}
        <input
          type="range"
          min="1"
          max="12"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(e.target.value)}
        />

      </div>

      {/* CANVAS */}
      <ReactSketchCanvas
        ref={canvasRef}
        strokeWidth={strokeWidth}
        strokeColor={color}
        style={{
          border: "1px solid #334155",
          borderRadius: "10px",
          background: "#0f172a",
          flex: 1
        }}
      />
    </div>
  );
}

export default Whiteboard;