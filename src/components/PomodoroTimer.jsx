import { useEffect, useState, useRef } from "react";

const MODES = [
  { label: "Focus", duration: 25 * 60, color: "#6366f1" },
  { label: "Break", duration: 5 * 60, color: "#10b981" },
];

export default function PomodoroTimer() {
  const [modeIdx, setModeIdx] = useState(0);
  const [time, setTime] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);

  const mode = MODES[modeIdx];
  const progress = 1 - time / mode.duration;

  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ * (1 - progress);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 0) {
          clearInterval(interval);
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  function switchMode(idx) {
    setModeIdx(idx);
    setTime(MODES[idx].duration);
    setRunning(false);
  }

  function reset() {
    setTime(mode.duration);
    setRunning(false);
  }

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  return (
    <div style={styles.wrap}>
      {/* Mode pills */}
      <div style={styles.modePills}>
        {MODES.map((m, i) => (
          <button
            key={m.label}
            onClick={() => switchMode(i)}
            style={{
              ...styles.modePill,
              background: modeIdx === i ? `${m.color}20` : "transparent",
              color: modeIdx === i ? m.color : "#334155",
              borderColor: modeIdx === i ? `${m.color}50` : "transparent",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div style={styles.circleWrap}>
        <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          {/* Progress */}
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={mode.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            style={{
              transition: running ? "stroke-dashoffset 1s linear" : "none",
              filter: `drop-shadow(0 0 6px ${mode.color}99)`,
            }}
          />
        </svg>

        {/* Center time */}
        <div style={styles.centerTime}>
          <span style={{ ...styles.timeText, color: mode.color }}>
            {mm}:{ss}
          </span>
          <span style={styles.modeLabel}>{mode.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            ...styles.ctrlBtn,
            background: `linear-gradient(135deg, ${mode.color}, #3b82f6)`,
            boxShadow: `0 2px 12px ${mode.color}55`,
          }}
        >
          {running ? "⏸" : "▶"}
        </button>
        <button onClick={reset} style={styles.resetBtn} title="Reset">
          ↺
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    margin: "14px 6px 8px",
    padding: "14px 12px",
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.06) 100%)",
    border: "1px solid rgba(99,102,241,0.18)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    position: "relative",
    overflow: "hidden",
  },
  modePills: {
    display: "flex",
    gap: 4,
    width: "100%",
  },
  modePill: {
    flex: 1,
    padding: "4px 0",
    border: "1px solid",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "Inter, sans-serif",
    letterSpacing: "0.04em",
  },
  circleWrap: {
    position: "relative",
    width: 80,
    height: 80,
  },
  centerTime: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: 1,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
  },
  modeLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  controls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#475569",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
