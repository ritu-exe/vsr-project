import { useEffect } from "react";
import "./animatedBackground.css";

export default function AnimatedBackground() {
  useEffect(() => {
    const booksLayer = document.getElementById("booksLayer");

    for (let i = 0; i < 14; i++) {
      const book = document.createElement("div");
      book.className = "book";

      const width = Math.random() * 60 + 40;
      const height = Math.random() * 100 + 80;

      book.style.width = `${width}px`;
      book.style.height = `${height}px`;
      book.style.left = `${Math.random() * 100}%`;
      book.style.top = `${Math.random() * 100}%`;
      book.style.animationDelay = `${Math.random() * 10}s`;

      for (let j = 0; j < 3; j++) {
        const line = document.createElement("div");
        line.className = "book-lines";
        line.style.top = `${20 + j * 20}%`;
        book.appendChild(line);
      }

      booksLayer?.appendChild(book);
    }
  }, []);

  return (
    <div className="animated-bg-root">
      <div className="background-layer gradient-layer"></div>
      <div className="background-layer texture-layer"></div>
      <div className="background-layer books-layer" id="booksLayer"></div>
    </div>
  );
}
