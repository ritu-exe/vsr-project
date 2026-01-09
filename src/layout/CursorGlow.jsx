import { useEffect } from "react";
import "./cursorGlow.css";

function CursorGlow() {
  useEffect(() => {
    const handleClick = (e) => {
      const ripple = document.createElement("div");
      ripple.className = "click-ripple";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";

      document.body.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    };

    document.addEventListener("click", handleClick);

    // CLEANUP (VERY IMPORTANT)
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null; // nothing to render
}

export default CursorGlow;
