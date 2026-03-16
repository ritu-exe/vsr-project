import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef } from "react";

function Whiteboard() {
  const canvasRef = useRef(null);

  return (
    <div style={{ height: "100%" }}>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => canvasRef.current.undo()}>Undo</button>
        <button onClick={() => canvasRef.current.redo()}>Redo</button>
        <button onClick={() => canvasRef.current.clearCanvas()}>Clear</button>
      </div>

      <ReactSketchCanvas
        ref={canvasRef}
        strokeWidth={4}
        strokeColor="white"
        style={{
          border: "1px solid #334155",
          borderRadius: "10px",
          background: "#0f172a",
          height: "80vh"
        }}
      />
    </div>
  );
}

export default Whiteboard;