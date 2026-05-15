import React, { useEffect, useRef } from "react";
import { useVoice } from "../context/VoiceContext";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiPhoneOff, FiUsers, FiEdit3, FiCode, FiYoutube
} from "react-icons/fi";
import Whiteboard from "./Whiteboard";
import Compiler from "../pages/Compiler";
import SharedYouTube from "./SharedYouTube";

/* ── Participant tile ───────────────────────────────────────── */
function ParticipantTile({ stream, username, isLocal }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().length > 0;

  return (
    <div style={tileStyle}>
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          style={videoStyle}
        />
      ) : (
        <div style={avatarTileStyle}>
          <div style={avatarCircleStyle}>
            {username?.slice(0, 2).toUpperCase() || "??"}
          </div>
        </div>
      )}
      <div style={tileLabelStyle}>
        {isLocal ? "You" : username}
        {isLocal && <span style={youBadge}>• Local</span>}
      </div>
    </div>
  );
}

/* ── Local audio tile (no video by default) ─────────────────── */
function LocalTile({ username, isMuted, isCameraOn, localStream }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && localStream) videoRef.current.srcObject = localStream;
  }, [localStream]);

  const hasVideo = localStream && localStream.getVideoTracks().length > 0;

  return (
    <div style={{ ...tileStyle, border: "1.5px solid rgba(99,102,241,0.5)" }}>
      {hasVideo ? (
        <video ref={videoRef} autoPlay muted playsInline style={videoStyle} />
      ) : (
        <div style={avatarTileStyle}>
          <div style={{ ...avatarCircleStyle, background: "linear-gradient(135deg,#6366f1,#3b82f6)" }}>
            {username?.slice(0, 2).toUpperCase()}
          </div>
          {isMuted && (
            <div style={mutedBadgeStyle}><FiMicOff size={10} /></div>
          )}
        </div>
      )}
      <div style={tileLabelStyle}>
        You {isMuted ? "🔇" : "🎙"}
      </div>
    </div>
  );
}

/* ── Main VoiceRoom ─────────────────────────────────────────── */
export default function VoiceRoom({ roomId, roomName }) {
  const {
    currentVoiceRoom, participants, localStream,
    isMuted, isCameraOn, isScreenSharing,
    joinVoiceRoom, leaveVoiceRoom,
    toggleMute, toggleCamera, startScreenShare,
  } = useVoice();

  const username = localStorage.getItem("username") || "User";
  const isInThisRoom = currentVoiceRoom?.id === roomId;
  const [activeActivity, setActiveActivity] = React.useState(null);

  // Remote participants audio
  const audioRefs = useRef({});
  useEffect(() => {
    participants.forEach(({ peerId, stream }) => {
      if (stream && audioRefs.current[peerId]) {
        audioRefs.current[peerId].srcObject = stream;
      }
    });
  }, [participants]);

  if (!isInThisRoom) {
    return (
      <div style={lobbyStyle}>
        <div style={lobbyIconStyle}>🔊</div>
        <h2 style={{ color: "#c7d2fe", margin: "0 0 8px", fontSize: 22 }}>
          # {roomName}
        </h2>
        <p style={{ color: "#475569", margin: "0 0 28px", fontSize: 14 }}>
          Voice · Video · Screen Share
        </p>
        <p style={{ color: "#334155", fontSize: 12, marginBottom: 24 }}>
          {participants.length === 0
            ? "No one is here yet — be the first!"
            : `${participants.length} participant${participants.length > 1 ? "s" : ""} in this room`}
        </p>
        <button
          style={joinBtnStyle}
          onClick={() => joinVoiceRoom({ id: roomId, name: roomName })}
        >
          🎙 Join {roomName}
        </button>
      </div>
    );
  }

  return (
    <div style={roomWrapStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ color: "#a78bfa", fontSize: 18 }}>🔊</span>
        <span style={{ color: "#c7d2fe", fontWeight: 700, fontSize: 16 }}>
          {roomName}
        </span>
        <span style={{ color: "#334155", fontSize: 12, marginLeft: "auto" }}>
          <FiUsers size={12} style={{ marginRight: 4 }} />
          {participants.length + 1} connected
        </span>
      </div>

      {/* Main Content Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Participant grid */}
        <div style={{ ...gridStyle(participants.length + 1), width: activeActivity ? "260px" : "100%", flex: activeActivity ? "none" : 1, borderRight: activeActivity ? "1px solid rgba(255,255,255,0.06)" : "none", display: "flex", flexDirection: activeActivity ? "column" : "grid" }}>
          <LocalTile
            username={username}
            isMuted={isMuted}
            isCameraOn={isCameraOn}
            localStream={localStream}
          />
          {participants.map(({ peerId, username: peerName, stream }) => (
            <React.Fragment key={peerId}>
              <audio
                ref={(el) => { if (el) audioRefs.current[peerId] = el; }}
                autoPlay
                style={{ display: "none" }}
              />
              <ParticipantTile
                stream={stream}
                username={peerName}
                isLocal={false}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Activity Area */}
        {activeActivity === "whiteboard" && (
          <div style={{ flex: 1, height: "100%", overflow: "hidden", background: "#06080f", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <Whiteboard roomId={roomId} isEmbedded={true} />
          </div>
        )}
        {activeActivity === "compiler" && (
          <div style={{ flex: 1, height: "100%", overflow: "hidden", background: "#06080f", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <Compiler roomId={roomId} isEmbedded={true} />
          </div>
        )}
        {activeActivity === "youtube" && (
          <div style={{ flex: 1, height: "100%", overflow: "hidden", background: "#06080f", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <SharedYouTube roomId={roomId} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={controlBarStyle}>
        <button
          style={ctrlBtn(isMuted, "#ef4444")}
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FiMicOff size={18} /> : <FiMic size={18} />}
          <span>{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button
          style={ctrlBtn(isCameraOn, "#6366f1")}
          onClick={toggleCamera}
          title={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraOn ? <FiVideo size={18} /> : <FiVideoOff size={18} />}
          <span>{isCameraOn ? "Camera On" : "Camera"}</span>
        </button>

        <button
          style={ctrlBtn(isScreenSharing, "#10b981")}
          onClick={startScreenShare}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          <FiMonitor size={18} />
          <span>{isScreenSharing ? "Stop Share" : "Screen"}</span>
        </button>

        <button
          style={ctrlBtn(activeActivity === "whiteboard", "#a78bfa")}
          onClick={() => setActiveActivity(a => a === "whiteboard" ? null : "whiteboard")}
          title="Shared Whiteboard"
        >
          <FiEdit3 size={18} />
          <span>Board</span>
        </button>

        <button
          style={ctrlBtn(activeActivity === "compiler", "#fbbf24")}
          onClick={() => setActiveActivity(a => a === "compiler" ? null : "compiler")}
          title="Shared Compiler"
        >
          <FiCode size={18} />
          <span>Code</span>
        </button>

        <button
          style={ctrlBtn(activeActivity === "youtube", "#ef4444")}
          onClick={() => setActiveActivity(a => a === "youtube" ? null : "youtube")}
          title="Shared YouTube"
        >
          <FiYoutube size={18} />
          <span>YouTube</span>
        </button>

        <button
          style={{ ...ctrlBtn(false, "#ef4444"), background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
          onClick={leaveVoiceRoom}
          title="Leave call"
        >
          <FiPhoneOff size={18} />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const roomWrapStyle = {
  display: "flex", flexDirection: "column",
  height: "100%", background: "rgba(6,8,15,0.6)",
  borderRadius: 16, overflow: "hidden",
};

const headerStyle = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "14px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)",
};

const gridStyle = (count) => ({
  flex: 1,
  display: "grid",
  gridTemplateColumns: count <= 1 ? "1fr" : count <= 2 ? "1fr 1fr" : count <= 4 ? "1fr 1fr" : "repeat(3, 1fr)",
  gap: 12,
  padding: 16,
  overflowY: "auto",
  alignContent: "start",
});

const tileStyle = {
  position: "relative",
  borderRadius: 14,
  overflow: "hidden",
  background: "rgba(17,24,39,0.8)",
  border: "1px solid rgba(255,255,255,0.06)",
  aspectRatio: "16/9",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const videoStyle = {
  width: "100%", height: "100%",
  objectFit: "cover",
};

const avatarTileStyle = {
  width: "100%", height: "100%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(17,24,39,0.8))",
  position: "relative",
};

const avatarCircleStyle = {
  width: 64, height: 64, borderRadius: "50%",
  background: "linear-gradient(135deg, #1e293b, #0f172a)",
  border: "2px solid rgba(99,102,241,0.3)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 22, fontWeight: 800, color: "#6366f1",
};

const tileLabelStyle = {
  position: "absolute", bottom: 8, left: 10,
  fontSize: 11, color: "#94a3b8", fontWeight: 600,
  background: "rgba(0,0,0,0.5)", padding: "2px 8px",
  borderRadius: 20, display: "flex", gap: 6, alignItems: "center",
};

const youBadge = {
  fontSize: 9, color: "#6366f1", background: "rgba(99,102,241,0.2)",
  padding: "1px 5px", borderRadius: 8,
};

const mutedBadgeStyle = {
  position: "absolute", bottom: 8, right: 8,
  background: "rgba(239,68,68,0.8)", borderRadius: "50%",
  width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
  color: "white",
};

const controlBarStyle = {
  display: "flex", justifyContent: "center", gap: 10,
  padding: "14px 20px",
  background: "rgba(0,0,0,0.3)",
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const ctrlBtn = (active, color) => ({
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: 4, padding: "10px 18px", borderRadius: 12,
  border: active ? `1px solid ${color}44` : "1px solid rgba(255,255,255,0.08)",
  background: active ? `${color}22` : "rgba(255,255,255,0.04)",
  color: active ? color : "#94a3b8",
  cursor: "pointer", fontSize: 10, fontWeight: 600,
  transition: "all 0.2s", fontFamily: "Inter, sans-serif",
  minWidth: 70,
});

const lobbyStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  justifyContent: "center", height: "100%",
  background: "radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)",
};

const lobbyIconStyle = {
  fontSize: 52, marginBottom: 16,
  filter: "drop-shadow(0 0 20px rgba(99,102,241,0.4))",
};

const joinBtnStyle = {
  padding: "14px 36px", borderRadius: 14,
  background: "linear-gradient(135deg, #6366f1, #3b82f6)",
  color: "white", border: "none", cursor: "pointer",
  fontSize: 15, fontWeight: 700, fontFamily: "Inter, sans-serif",
  boxShadow: "0 0 24px rgba(99,102,241,0.4)",
  transition: "all 0.2s",
};
