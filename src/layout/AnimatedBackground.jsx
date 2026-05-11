import { useEffect, useState } from "react";
import "./animatedBackground.css";

export default function AnimatedBackground() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.body.classList.contains("light-mode"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (isLight) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: -1,
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 50%, #f8fafc 100%)",
        pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: -100, left: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: -1,
      background: "linear-gradient(135deg, #06080f 0%, #0b0f1a 60%, #06080f 100%)",
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      {/* Primary orb - top left */}
      <div style={{
        position: "absolute", top: -180, left: -120,
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)",
        pointerEvents: "none",
        animation: "orbPulse 8s ease-in-out infinite",
      }} />

      {/* Cyan orb - bottom right */}
      <div style={{
        position: "absolute", bottom: -200, right: -120,
        width: 650, height: 650, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.03) 40%, transparent 70%)",
        pointerEvents: "none",
        animation: "orbPulse 10s ease-in-out infinite reverse",
        animationDelay: "2s",
      }} />

      {/* Violet orb - center */}
      <div style={{
        position: "absolute", top: "30%", left: "40%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
        animation: "orbPulse 12s ease-in-out infinite",
        animationDelay: "4s",
      }} />

      {/* Subtle grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Noise texture for depth */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: 0.02,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        pointerEvents: "none",
      }} />
    </div>
  );
}
