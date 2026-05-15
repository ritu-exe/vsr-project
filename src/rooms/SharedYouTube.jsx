import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player/youtube";
import { socket } from "../context/VoiceContext";
import { FiSearch, FiPlay, FiYoutube } from "react-icons/fi";

export default function SharedYouTube({ roomId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [videoId, setVideoId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);

  // Sync listening
  useEffect(() => {
    if (!roomId) return;
    const handleSync = ({ type, data }) => {
      if (type === "youtube") {
        if (data.videoId !== undefined) setVideoId(data.videoId);
        if (data.playing !== undefined) setPlaying(data.playing);
      }
    };
    socket.on("activity-sync", handleSync);
    return () => socket.off("activity-sync", handleSync);
  }, [roomId]);

  const searchYouTube = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
      if (!API_KEY) {
        throw new Error("YouTube API Key is missing. Please add REACT_APP_YOUTUBE_API_KEY to your .env file.");
      }
      
      const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          maxResults: 6,
          q: query,
          type: "video",
          key: API_KEY,
        }
      });
      setResults(res.data.items);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    }
    setLoading(false);
  };

  const playVideo = (id) => {
    setVideoId(id);
    setPlaying(true);
    if (roomId) {
      socket.emit("activity-sync", { roomId, type: "youtube", data: { videoId: id, playing: true } });
    }
  };

  const handlePlay = () => {
    setPlaying(true);
    if (roomId) socket.emit("activity-sync", { roomId, type: "youtube", data: { playing: true } });
  };

  const handlePause = () => {
    setPlaying(false);
    if (roomId) socket.emit("activity-sync", { roomId, type: "youtube", data: { playing: false } });
  };

  return (
    <div style={containerStyle}>
      {/* Top Header */}
      <div style={headerStyle}>
        <FiYoutube size={22} color="#ef4444" />
        <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: 16 }}>Shared YouTube</h3>
      </div>

      {/* Video Player Area */}
      <div style={playerWrapperStyle}>
        {videoId ? (
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${videoId}`}
            width="100%"
            height="100%"
            playing={playing}
            controls={true}
            onPlay={handlePlay}
            onPause={handlePause}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        ) : (
          <div style={emptyPlayerStyle}>
            <FiYoutube size={48} color="#334155" style={{ marginBottom: 16 }} />
            <div style={{ color: "#64748b", fontSize: 14 }}>Search for a video below to start watching with friends!</div>
          </div>
        )}
      </div>

      {/* Search and Results */}
      <div style={searchSectionStyle}>
        <form onSubmit={searchYouTube} style={searchFormStyle}>
          <input
            type="text"
            placeholder="Search YouTube..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchInputStyle}
          />
          <button type="submit" style={searchBtnStyle} disabled={loading}>
            {loading ? "..." : <FiSearch size={16} />}
          </button>
        </form>

        {error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 10 }}>{error}</div>}

        <div style={resultsGridStyle}>
          {results.map((item) => (
            <div key={item.id.videoId} style={resultCardStyle} onClick={() => playVideo(item.id.videoId)}>
              <img src={item.snippet.thumbnails.medium.url} alt="thumbnail" style={thumbnailStyle} />
              <div style={resultInfoStyle}>
                <div style={resultTitleStyle}>{item.snippet.title}</div>
                <div style={resultChannelStyle}>{item.snippet.channelTitle}</div>
              </div>
              <div className="play-overlay" style={playOverlayStyle}>
                <FiPlay size={24} color="white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  display: "flex", flexDirection: "column", height: "100%",
  background: "#0f172a", fontFamily: "Inter, sans-serif"
};

const headerStyle = {
  display: "flex", alignItems: "center", gap: 10, padding: "16px 20px",
  background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)"
};

const playerWrapperStyle = {
  width: "100%", aspectRatio: "16/9", position: "relative",
  background: "#000", borderBottom: "1px solid rgba(255,255,255,0.06)"
};

const emptyPlayerStyle = {
  width: "100%", height: "100%", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", background: "#0b0f19"
};

const searchSectionStyle = {
  flex: 1, padding: 20, overflowY: "auto",
};

const searchFormStyle = {
  display: "flex", gap: 10, marginBottom: 20
};

const searchInputStyle = {
  flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  padding: "12px 16px", borderRadius: 12, color: "white", outline: "none",
  fontFamily: "Inter, sans-serif"
};

const searchBtnStyle = {
  background: "#ef4444", border: "none", color: "white", padding: "0 20px",
  borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center"
};

const resultsGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16
};

const resultCardStyle = {
  background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden",
  cursor: "pointer", position: "relative", border: "1px solid rgba(255,255,255,0.05)",
  transition: "transform 0.2s, background 0.2s",
};

const thumbnailStyle = {
  width: "100%", aspectRatio: "16/9", objectFit: "cover"
};

const resultInfoStyle = {
  padding: 12
};

const resultTitleStyle = {
  fontSize: 13, color: "#f1f5f9", fontWeight: 600, marginBottom: 6,
  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
};

const resultChannelStyle = {
  fontSize: 11, color: "#94a3b8"
};

const playOverlayStyle = {
  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
  opacity: 0, transition: "opacity 0.2s"
};

// Simple global style for hover (injecting via a hack since we are writing inline styles)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .play-overlay { opacity: 0; }
    div[style*="cursor: pointer"]:hover .play-overlay { opacity: 1; }
  `;
  document.head.appendChild(style);
}
