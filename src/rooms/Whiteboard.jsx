
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef, useState } from "react";
import "../layout/layout.css";
import { FiRotateCcw, FiRotateCw, FiTrash2, FiSave, FiEdit3, FiSquare, FiCircle } from "react-icons/fi";
import { socket } from "../context/VoiceContext";

function Whiteboard({ roomId, isEmbedded }) {

  const canvasRef = useRef(null);

  const [tool,setTool] = useState("pen");
  const [color,setColor] = useState("#ffffff");
  const [strokeWidth,setStrokeWidth] = useState(4);

  const [shapes,setShapes] = useState([]);
  const [notes,setNotes] = useState([]);

  const colors = [
    "#ffffff",
    "#ef4444",
    "#22c55e",
    "#38bdf8",
    "#eab308",
    "#a855f7"
  ];

  const saveImage = async () => {
    const data = await canvasRef.current.exportImage("png");

    const link = document.createElement("a");
    link.href = data;
    link.download = "whiteboard.png";
    link.click();
  };

  const addNote = () => {

    const newNote = { id: Date.now(), x:200, y:200, text:"Note..." };
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    if (roomId) socket.emit("activity-sync", { roomId, type: "whiteboard", data: { notes: newNotes } });
  };

  // eslint-disable-next-line no-unused-vars
  const handleBoardClick = (e) => {

    if(tool !== "rect" && tool !== "circle") return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newShape = { id: Date.now(), type: tool, x, y, color };
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    
    if (roomId) {
      socket.emit("activity-sync", { roomId, type: "whiteboard", data: { shapes: newShapes } });
    }
  };

  // Sync listen
  useEffect(() => {
    if (!roomId) return;
    
    const handleSync = ({ type, data }) => {
      if (type === "whiteboard") {
        if (data.shapes) setShapes(data.shapes);
        if (data.notes) setNotes(data.notes);
        if (data.paths && canvasRef.current) {
          // ReactSketchCanvas requires an internal method to load paths safely.
          canvasRef.current.loadPaths(data.paths);
        }
        if (data.clear) {
          canvasRef.current?.clearCanvas();
          setShapes([]);
          setNotes([]);
        }
      }
    };
    
    socket.on("activity-sync", handleSync);
    return () => socket.off("activity-sync", handleSync);
  }, [roomId]);

  const handleClear = () => {
    canvasRef.current.clearCanvas();
    setShapes([]);
    setNotes([]);
    if (roomId) socket.emit("activity-sync", { roomId, type: "whiteboard", data: { clear: true } });
  };

  return (
<div style={{
height:"100%",
display:"flex",
flexDirection:"column",
overflow:"hidden"
}}>
      {/* TOOLBAR */}

<div className="wb-toolbar">

<button className="icon-btn undo" onClick={()=>canvasRef.current.undo()}>
  <FiRotateCcw/>
</button>

<button className="icon-btn redo" onClick={()=>canvasRef.current.redo()}>
  <FiRotateCw/>
</button>

<button
className="icon-btn clear"
onClick={handleClear}>
  <FiTrash2/>
</button>

<button className="icon-btn save" onClick={saveImage}>
  <FiSave/>
</button>

<button
className="icon-btn pen"
onClick={()=>{
setTool("pen");
canvasRef.current.eraseMode(false);
}}>
  <FiEdit3/>
</button>

<button
className="icon-btn eraser"
onClick={()=>{
setTool("eraser");
canvasRef.current.eraseMode(true);
}}>
  🧽
</button>

<button className="icon-btn rect" onClick={()=>setTool("rect")}>
  <FiSquare/>
</button>

<button className="icon-btn circle" onClick={()=>setTool("circle")}>
  <FiCircle/>
</button>

<button className="icon-btn note" onClick={addNote}>
  📌
</button>

        {/* COLORS */}

        <div style={{display:"flex",gap:"6px"}}>
          {colors.map(c=>(
            <div
              key={c}
              onClick={()=>setColor(c)}
              style={{
                width:"20px",
                height:"20px",
                background:c,
                borderRadius:"50%",
                border:"2px solid white",
                cursor:"pointer"
              }}
            />
          ))}
        </div>

        {/* BRUSH SIZE */}

        <input
          type="range"
          min="2"
          max="40"
          value={strokeWidth}
          onChange={(e)=>setStrokeWidth(Number(e.target.value))}
        />

      </div>

      {/* BOARD AREA */}

<div
style={{
position:"relative",
flex:1,
overflow:"auto"
}}
>

        {/* DRAWING CANVAS */}

<ReactSketchCanvas
ref={canvasRef}
strokeWidth={strokeWidth}
strokeColor={color}
onChange={(paths) => {
  if (roomId) socket.emit("activity-sync", { roomId, type: "whiteboard", data: { paths } });
}}
style={{
border:"1px solid #334155",
borderRadius:"10px",
background:"#0f172a",
height:"100%"
}}
/>

        {/* SHAPES */}

        {shapes.map(shape => {
          if(shape.type === "rect"){
            return (
              <div
                key={shape.id}
                style={{
                  position:"absolute",
                  top:shape.y,
                  left:shape.x,
                  width:"140px",
                  height:"90px",
                  border:`3px solid ${shape.color}`
                }}
              />
            )
          }
          if(shape.type === "circle"){
            return (
              <div
                key={shape.id}
                style={{
                  position:"absolute",
                  top:shape.y,
                  left:shape.x,
                  width:"120px",
                  height:"120px",
                  borderRadius:"50%",
                  border:`3px solid ${shape.color}`
                }}
              />
            )
          }
          return null;
        })}

        {/* NOTES */}

        {notes.map(note=>(
          <div
            key={note.id}
            style={{
              position:"absolute",
              top:note.y,
              left:note.x,
              background:"#facc15",
              padding:"10px",
              borderRadius:"6px",
              width:"120px",
              cursor:"move"
            }}
            contentEditable
          >
            {note.text}
          </div>
        ))}

      </div>

    </div>
  );
}

export default Whiteboard;