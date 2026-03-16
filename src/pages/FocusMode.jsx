import React, { useState, useEffect } from "react";

function FocusMode() {

  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {

    let timer;

    if (running && time > 0) {
      timer = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);

  }, [running, time]);

  const formatTime = () => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div style={{textAlign:"center",padding:"100px"}}>

      <h1>Focus Mode 🎯</h1>

      <h2 style={{fontSize:"60px"}}>
        {formatTime()}
      </h2>

      <button onClick={()=>setRunning(true)}>Start</button>
      <button onClick={()=>setRunning(false)}>Pause</button>

    </div>
  );
}

export default FocusMode;