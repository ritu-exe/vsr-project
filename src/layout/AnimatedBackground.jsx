import "./animatedBackground.css";

export default function AnimatedBackground() {
  return (
    <div className="animated-bg-root">
      <div className="background-layer gradient-layer"></div>
      <div className="background-layer texture-layer"></div>
    </div>
  );
}
