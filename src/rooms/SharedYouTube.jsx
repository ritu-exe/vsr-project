import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
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
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.headerIconWrapper}>
          <FiYoutube size={20} color="#fff" />
        </div>
        <div>
          <h3 style={styles.headerTitle}>Shared YouTube</h3>
          <p style={styles.headerSubtitle}>Watch videos together in real-time</p>
        </div>
      </div>

      {/* Video Player Area */}
      <div style={styles.playerWrapper}>
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
          <div style={styles.emptyPlayer}>
            <div style={styles.emptyPlayerPulse}>
              <FiYoutube size={48} color="#ef4444" />
            </div>
            <h4 style={styles.emptyPlayerText}>Ready to watch?</h4>
            <div style={styles.emptyPlayerSubtext}>Search for a video below and start a shared session.</div>
          </div>
        )}
      </div>

      {/* Search and Results */}
      <div style={styles.searchSection}>
        <form onSubmit={searchYouTube} style={styles.searchForm}>
          <div style={styles.inputWrapper}>
            <FiSearch size={18} color="#94a3b8" style={{ marginLeft: 16 }} />
            <input
              type="text"
              placeholder="Search YouTube..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button type="submit" style={styles.searchBtn} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <div style={styles.errorText}>{error}</div>}

        <div style={styles.resultsGrid}>
          {results.map((item) => (
            <div key={item.id.videoId} className="yt-result-card" style={styles.resultCard} onClick={() => playVideo(item.id.videoId)}>
              <div style={styles.thumbnailWrapper}>
                <img src={item.snippet.thumbnails.medium.url} alt="thumbnail" style={styles.thumbnail} />
                <div className="play-overlay" style={styles.playOverlay}>
                  <div style={styles.playButtonGlow}>
                    <FiPlay size={24} color="white" style={{ marginLeft: 4 }} />
                  </div>
                </div>
              </div>
              <div style={styles.resultInfo}>
                <div style={styles.resultTitle}>{item.snippet.title}</div>
                <div style={styles.resultChannel}>{item.snippet.channelTitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: {
    display: "flex", flexDirection: "column", height: "100%",
    background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)", fontFamily: "'Inter', sans-serif",
    color: "white"
  },
  header: {
    display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
    background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)"
  },
  headerIconWrapper: {
    background: "linear-gradient(135deg, #ef4444, #b91c1c)",
    padding: "10px", borderRadius: "12px", display: "flex",
    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
  },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em" },
  headerSubtitle: { margin: "4px 0 0 0", fontSize: 13, color: "#94a3b8" },
  
  playerWrapper: {
    width: "100%", aspectRatio: "16/9", position: "relative",
    background: "#000", borderBottom: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  },
  emptyPlayer: {
    width: "100%", height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", 
    background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)"
  },
  emptyPlayerPulse: {
    padding: "20px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)",
    marginBottom: 20, boxShadow: "0 0 40px rgba(239, 68, 68, 0.2)"
  },
  emptyPlayerText: { margin: 0, fontSize: 20, fontWeight: 600, color: "#f1f5f9" },
  emptyPlayerSubtext: { marginTop: 8, color: "#64748b", fontSize: 14 },
  
  searchSection: { flex: 1, padding: "24px", paddingBottom: "100px", overflowY: "auto" },
  searchForm: { display: "flex", gap: 12, marginBottom: 24 },
  inputWrapper: {
    flex: 1, display: "flex", alignItems: "center",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px", overflow: "hidden", transition: "border-color 0.2s, background 0.2s"
  },
  searchInput: {
    flex: 1, background: "transparent", border: "none",
    padding: "14px 16px", color: "white", outline: "none",
    fontFamily: "'Inter', sans-serif", fontSize: 15
  },
  searchBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", color: "white", 
    padding: "0 24px", borderRadius: "14px", cursor: "pointer", 
    fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", transition: "transform 0.1s, box-shadow 0.2s"
  },
  
  errorText: { color: "#fca5a5", fontSize: 13, marginBottom: 16, background: "rgba(239, 68, 68, 0.1)", padding: "10px 14px", borderRadius: "8px" },
  
  resultsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 },
  resultCard: {
    background: "rgba(255,255,255,0.02)", borderRadius: "16px", overflow: "hidden",
    cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)",
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s"
  },
  thumbnailWrapper: { position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" },
  thumbnail: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" },
  playOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    opacity: 0, transition: "opacity 0.3s ease"
  },
  playButtonGlow: {
    width: 56, height: 56, borderRadius: "50%", background: "#ef4444",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)", transform: "scale(0.8)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  
  resultInfo: { padding: "16px" },
  resultTitle: {
    fontSize: 14, color: "#f8fafc", fontWeight: 600, marginBottom: 8, lineHeight: 1.4,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
  },
  resultChannel: { fontSize: 12, color: "#94a3b8", fontWeight: 500 }
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .yt-result-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.1); }
    .yt-result-card:hover img { transform: scale(1.05); }
    .yt-result-card:hover .play-overlay { opacity: 1; }
    .yt-result-card:hover .play-overlay > div { transform: scale(1); }
  `;
  document.head.appendChild(style);
}
