import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const AI_URL = process.env.REACT_APP_AI_URL || "http://localhost:8082";

function ChatBot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", "summary");

    setLoading(true);
    try {
      const res = await axios.post(`${AI_URL}/ai/pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setChat((prev) => [...prev, { sender: "bot", text: `📄 PDF Summary:\n\n${res.data.reply}` }]);
    } catch {
      setChat((prev) => [...prev, { sender: "bot", text: "Failed to process PDF." }]);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    const updatedChat = [...chat, { sender: "user", text: userMsg }];
    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND}/api/chat`, { message: userMsg });
      setChat([...updatedChat, { sender: "bot", text: res.data.reply }]);
    } catch {
      setChat([...updatedChat, { sender: "bot", text: "Sorry, AI is unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0,
      background: "#0a0f1e",
      borderRadius: "12px",
      overflow: "hidden"
    }}>

      {/* MESSAGES */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {chat.length === 0 && (
          <div style={{ color: "#334155", fontSize: "13px", textAlign: "center", marginTop: "20px" }}>
            Ask anything, or upload a PDF 📎
          </div>
        )}

        {chat.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
          }}>
            <div style={{
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.sender === "user"
                ? "linear-gradient(135deg, #6366f1, #3b82f6)"
                : "rgba(30, 41, 59, 0.9)",
              color: "white",
              fontSize: "13px",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              border: msg.sender === "bot" ? "1px solid rgba(99,102,241,0.15)" : "none"
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "10px 16px",
              borderRadius: "16px 16px 16px 4px",
              background: "rgba(30,41,59,0.9)",
              border: "1px solid rgba(99,102,241,0.15)",
              color: "#64748b",
              fontSize: "13px"
            }}>
              <span style={{ animation: "pulse 1.5s infinite" }}>AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{
        display: "flex",
        gap: "8px",
        padding: "10px",
        borderTop: "1px solid #1e293b",
        alignItems: "center",
        background: "rgba(2,6,23,0.8)"
      }}>
        <label style={{ cursor: "pointer", fontSize: "18px", color: "#64748b", flexShrink: 0 }}
          title="Upload PDF">
          📎
          <input type="file" accept=".pdf" onChange={handleFile} disabled={loading}
            style={{ display: "none" }} />
        </label>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything..."
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: "20px",
            border: "1px solid #1e293b",
            outline: "none",
            background: "#1e293b",
            color: "white",
            fontSize: "13px"
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            width: "36px", height: "36px",
            borderRadius: "50%",
            background: loading ? "#1e293b" : "linear-gradient(135deg, #6366f1, #3b82f6)",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
