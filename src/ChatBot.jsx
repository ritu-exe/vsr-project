import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

function ChatBot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ PDF FUNCTION
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", "summary");

    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_AI_URL || "http://localhost:8082"}/ai/pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setChat((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (error) {
      setChat((prev) => [...prev, { sender: "bot", text: "Failed to process PDF." }]);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // ✅ CHAT FUNCTION
  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const updatedChat = [...chat, { sender: "user", text: message }];
    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/chat`, { message });
      setChat([...updatedChat, { sender: "bot", text: res.data.reply }]);
    } catch (error) {
      setChat([...updatedChat, { sender: "bot", text: "Sorry, AI is unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const container = document.getElementById("chat-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}, [chat]);

return (
  <div style={{
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
    flex: 1,
    overflow: "hidden",
    background: "#0f172a",
    borderRadius: "12px",
    padding: "10px"
  }}>

    {/* CHAT AREA */}
    <div
      id="chat-container"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: "5px",
      }}
    >
      {chat.map((msg, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            marginBottom: "10px"
          }}
        >
          <div
            style={{
              maxWidth: "75%",
              padding: "10px 14px",
              borderRadius: "16px",
              background: msg.sender === "user" ? "#3b82f6" : "#1e293b",
              color: "white",
              fontSize: "14px",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}
          >
            {msg.text}
          </div>
        </div>
      ))}

      {/* 🔥 Typing indicator */}
      {loading && (
        <div style={{ color: "#aaa", fontSize: "12px" }}>
          AI is typing...
        </div>
      )}
    </div>

    {/* INPUT AREA */}
    <div style={{
      display: "flex",
      gap: "8px",
      marginTop: "10px",
      alignItems: "center"
    }}>

      {/* PDF Upload */}
      <label style={{ cursor: "pointer", fontSize: "18px", title: "Upload PDF" }}>
        📎
        <input
          type="file"
          accept=".pdf"
          onChange={handleFile}
          disabled={loading}
          style={{ display: "none" }}
        />
      </label>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask anything... (or upload a PDF 📎)"
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "20px",
          border: "none",
          outline: "none",
          background: "#1e293b",
          color: "white"
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          padding: "10px 14px",
          borderRadius: "50%",
          background: "#3b82f6",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        ➤
      </button>
    </div>
  </div>
);
}
export default ChatBot;
