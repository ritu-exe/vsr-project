import { useEffect, useRef } from "react";
import "./animatedBackground.css";

export default function AnimatedBackground() {
  const booksRef = useRef(null);

  useEffect(() => {
    const layer = booksRef.current;
    if (!layer) return;

    for (let i = 0; i < 16; i++) {
      const book = document.createElement("div");
      book.className = "book";

      const width = Math.random() * 60 + 40;
      const height = Math.random() * 100 + 80;

      book.style.width = `${width}px`;
      book.style.height = `${height}px`;
      book.style.left = `${Math.random() * 100}%`;
      book.style.top = `${Math.random() * 100}%`;
      book.style.animationDelay = `${Math.random() * 8}s`;

      for (let j = 0; j < 3; j++) {
        const line = document.createElement("div");
        line.className = "book-lines";
        line.style.top = `${20 + j * 20}%`;
        book.appendChild(line);
      }

      layer.appendChild(book);
    }
  }, []);

  return (
    <div className="animated-bg-root">
      <div className="background-layer gradient-layer" />
      <div className="background-layer texture-layer" />
      <div
        className="background-layer books-layer"
        ref={booksRef}
      />
    </div>
  );
}
