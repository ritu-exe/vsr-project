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
      setChat((prev) => [...prev, { sender: "bot", text: `PDF Summary:\n\n${res.data.reply}` }]);
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
    <div className="chat-root" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" }}>

      {/* MESSAGES */}
      <div className="chat-messages" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>

        {chat.length === 0 && (
          <div className="chat-empty" style={{ color: "#475569", fontSize: 13, textAlign: "center", marginTop: 24 }}>
            Ask anything, or upload a PDF 📎
          </div>
        )}

        {chat.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", position: "relative" }}>
              <div
                className={msg.sender === "bot" ? "chat-msg-bot" : ""}
                style={{
                  padding: "9px 13px",
                  borderRadius: msg.sender === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  background: msg.sender === "user" ? "linear-gradient(135deg, #6366f1, #3b82f6)" : "rgba(26,32,53,0.9)",
                  color: "white",
                  fontSize: 13,
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  border: msg.sender === "bot" ? "1px solid rgba(255,255,255,0.06)" : "none"
                }}
              >
                {msg.text}
              </div>
              {msg.sender === "bot" && (
                <button
                  onClick={() => navigator.clipboard.writeText(msg.text)}
                  style={{
                    position: "absolute", top: 6, right: 6,
                    padding: "2px 7px", fontSize: 10,
                    borderRadius: 5,
                    border: "1px solid rgba(99,102,241,0.3)",
                    background: "rgba(99,102,241,0.15)",
                    color: "#818cf8",
                    cursor: "pointer"
                  }}
                >copy</button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div className="chat-thinking" style={{
              padding: "9px 14px",
              borderRadius: "14px 14px 14px 3px",
              background: "rgba(26,32,53,0.9)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#475569", fontSize: 13
            }}>
              <span style={{ animation: "pulse 1.5s infinite", display: "inline-block" }}>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input-bar" style={{
        display: "flex", gap: 8, padding: "10px 12px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        alignItems: "center",
        background: "rgba(8,12,20,0.8)"
      }}>
        <label style={{ cursor: "pointer", fontSize: 16, color: "#475569", flexShrink: 0 }} title="Upload PDF">
          📎
          <input type="file" accept=".pdf" onChange={handleFile} disabled={loading} style={{ display: "none" }} />
        </label>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything..."
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          style={{
            flex: 1, padding: "8px 12px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            color: "inherit",
            fontSize: 13
          }}
        />

        <button onClick={sendMessage} disabled={loading} style={{
          width: 34, height: 34, borderRadius: "50%",
          background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #3b82f6)",
          color: "white", border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0
        }}>➤</button>
      </div>
    </div>
  );
}

export default ChatBot;
