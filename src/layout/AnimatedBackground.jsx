import "./animatedBackground.css";

export default function AnimatedBackground() {
  return (
    <>
      {/* Real photo background */}
      <div className="real-books-bg" />

      {/* Animated overlay */}
      <div className="animated-bg-root">
        <div className="background-layer gradient-layer" />
        <div className="background-layer texture-layer" />
      </div>
    </>
  );
}
