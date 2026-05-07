import { useState, useEffect, useRef } from "react";
import rainSound from "../assets/rain.mp3";
import birdSound from "../assets/birds.mp3";
import { updateProgress } from "../services/progressService";

function Focus() {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  const rainRef = useRef(null);
  const birdRef = useRef(null);
  const currentAudio = useRef(null);

  /* ENABLE FOCUS MODE UI */
  useEffect(() => {
    document.body.classList.add("focus-mode");
    return () => {
      document.body.classList.remove("focus-mode");
    };
  }, []);

  /* TIMER */
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev === 0) {
          clearInterval(interval);

          // 🔥 TRACK PROGRESS WHEN SESSION COMPLETES
          updateProgress("focusTime", 25);
          updateProgress("sessions", 1);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  function start() {
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setTime(25 * 60);
  }

  /* 🔥 SOUND ENGINE */
  function playRain() {
    stopSound();

    const audio = rainRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {});

    currentAudio.current = audio;
  }

  function playBirds() {
    stopSound();

    const audio = birdRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {});

    currentAudio.current = audio;
  }

  function stopSound() {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
    }
  }

  return (
    <div className="main-room focus-room">

      <h2 className="gradient-text">🧘 Focus Room</h2>

      <h1 className="focus-timer">
        {minutes}:{seconds < 10 ? "0" : ""}{seconds}
      </h1>

      {/* CONTROLS */}
      <div className="focus-controls">
        {!running ? (
          <button className="toggle-btn" onClick={start}>
            ▶ Start
          </button>
        ) : (
          <button className="toggle-btn" onClick={pause}>
            ⏸ Pause
          </button>
        )}

        <button className="toggle-btn" onClick={reset}>
          🔁 Reset
        </button>
      </div>

      <hr />

      {/* SOUND SECTION */}
      <h3>🎧 Focus Sounds</h3>

      <div className="focus-sounds">
        <button onClick={playRain}>🌧 Rain</button>
        <button onClick={playBirds}>🐦 Birds</button>
        <button onClick={stopSound}>⏹ Stop</button>
      </div>

      {/* AUDIO ELEMENTS */}
      <audio ref={rainRef} src={rainSound} loop />
      <audio ref={birdRef} src={birdSound} loop />

    </div>
  );
}

export default Focus;