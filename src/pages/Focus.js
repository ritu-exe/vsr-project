import { useState, useEffect } from "react";

function Focus() {
  const [time, setTime] = useState(25 * 60); // 25 minutes
  const [running, setRunning] = useState(false);
  const [audio, setAudio] = useState(null);

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
    <div>
      <h2>🧘 Focus Room</h2>

      <h1>
        {minutes}:{seconds < 10 ? "0" : ""}
        {seconds}
      </h1>

      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button onClick={reset}>Reset</button>

      <hr />

      <h3>🎧 Focus Sounds</h3>
      <button onClick={() => playSound("rain")}>Rain</button>
      <button onClick={() => playSound("birds")}>Birds</button>
      <button onClick={stopSound}>Stop Sound</button>
    </div>
  );
}

export default Focus;
