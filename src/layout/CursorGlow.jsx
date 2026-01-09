import { useEffect } from "react";
import "./cursorGlow.css";

function CursorGlow() {
  useEffect(() => {
    const spotlight = document.createElement("div");
    spotlight.className = "cursor-spotlight";
    document.body.appendChild(spotlight);

    const move = (e) => {
      spotlight.style.left = e.clientX + "px";
      spotlight.style.top = e.clientY + "px";
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      spotlight.remove();
    };
  }, []);

  return null;
}

export default CursorGlow;
