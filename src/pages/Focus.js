import { useState, useEffect } from "react";

function Focus() {
  const [time, setTime] = useState(25 * 60); // 25 minutes
  const [running, setRunning] = useState(false);
  const [audio, setAudio] = useState(null);

  /* 🔥 ADD THIS: Enable Focus Mode UI */
  useEffect(() => {
    document.body.classList.add("focus-mode");

    return () => {
      document.body.classList.remove("focus-mode");
    };
  }, []);

  /* TIMER LOGIC (UNCHANGED) */
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev === 0) {
          clearInterval(interval);
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

  function playSound(type) {
    if (audio) audio.pause();

    const sound =
      type === "rain"
        ? new Audio("https://www.soundjay.com/nature/rain-01.mp3")
        : new Audio("https://www.soundjay.com/nature/birds-01.mp3");

    sound.loop = true;
    sound.play();
    setAudio(sound);
  }

  function stopSound() {
    if (audio) audio.pause();
    setAudio(null);
  }

  return (
    <div className="main-room focus-room">
      <h2 className="gradient-text">🧘 Focus Room</h2>

      <h1 className="focus-timer">
        {minutes}:{seconds < 10 ? "0" : ""}
        {seconds}
      </h1>

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

      <h3>🎧 Focus Sounds</h3>

      <div className="focus-sounds">
        <button onClick={() => playSound("rain")}>🌧 Rain</button>
        <button onClick={() => playSound("birds")}>🐦 Birds</button>
        <button onClick={stopSound}>⏹ Stop</button>
      </div>
    </div>
  );
}

export default Focus;
