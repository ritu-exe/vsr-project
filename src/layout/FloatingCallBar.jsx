import React from "react";
import { useVoice } from "../context/VoiceContext";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiPhoneOff } from "react-icons/fi";

export default function FloatingCallBar({ setPage, setSelectedRoom, servers }) {
  const {
    currentVoiceRoom,
    isMuted, isCameraOn, isScreenSharing,
    toggleMute, toggleCamera, startScreenShare, leaveVoiceRoom,
  } = useVoice();

  if (!currentVoiceRoom) return null;

  function goToVoiceRoom() {
    // Navigate to the voice room
    if (setSelectedRoom && servers) {
      for (const server of servers) {
        const room = server.rooms.find((r) => r.id === currentVoiceRoom.id);
        if (room) { setSelectedRoom(room); break; }
      }
    }
    if (setPage) setPage("chat");
  }

  return (
    <div style={barStyle}>
      {/* Room info — clickable to navigate back */}
      <button style={roomInfoStyle} onClick={goToVoiceRoom} title="Go to voice room">
        <span style={waveStyle}>🔊</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>
            Voice Connected
          </div>
          <div style={{ fontSize: 10, color: "#475569" }}>
            # {currentVoiceRoom.name}
          </div>
        </div>
      </button>

      {/* Controls */}
      <div style={controlsStyle}>
        <button
          style={miniBtn(isMuted, "#ef4444")}
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FiMicOff size={13} /> : <FiMic size={13} />}
        </button>

        <button
          style={miniBtn(isCameraOn, "#6366f1")}
          onClick={toggleCamera}
          title={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraOn ? <FiVideo size={13} /> : <FiVideoOff size={13} />}
        </button>

        <button
          style={miniBtn(isScreenSharing, "#10b981")}
          onClick={startScreenShare}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          <FiMonitor size={13} />
        </button>

        <button
          style={{ ...miniBtn(false, "#ef4444"), background: "rgba(239,68,68,0.15)" }}
          onClick={leaveVoiceRoom}
          title="Leave call"
        >
          <FiPhoneOff size={13} />
        </button>
      </div>
    </div>
  );
}

const barStyle = {
  margin: "8px 0 6px",
  padding: "10px 10px",
  borderRadius: 12,
  background: "rgba(16,185,129,0.07)",
  border: "1px solid rgba(16,185,129,0.2)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const roomInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
  width: "100%",
};

const waveStyle = {
  fontSize: 18,
  animation: "pulse 2s infinite",
};

const controlsStyle = {
  display: "flex",
  gap: 6,
  justifyContent: "flex-start",
};

const miniBtn = (active, color) => ({
  width: 30, height: 30,
  borderRadius: 8,
  border: active ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.08)",
  background: active ? `${color}22` : "rgba(255,255,255,0.04)",
  color: active ? color : "#475569",
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.2s",
});
