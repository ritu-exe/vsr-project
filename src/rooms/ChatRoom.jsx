import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { getMessages, sendMessage } from "../services/api";

const socket = io("http://localhost:5000");

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userCount, setUserCount] = useState(0);

  // 🔐 Get logged-in user
  const username = localStorage.getItem("username") || "Guest";

  // 🔽 Auto-scroll ref
  const bottomRef = useRef(null);

  // 🟢 Load messages + realtime updates
  useEffect(() => {
    if (!roomId) return;

    // fetch messages from backend
    getMessages(roomId).then((data) => {
      setMessages(data);
    });

    // realtime message listener
    socket.on("newMessage", ({ roomId: msgRoomId, message }) => {
      if (msgRoomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // online users listener
    socket.on("userCount", (count) => {
      setUserCount(count);
    });

    return () => {
      socket.off("newMessage");
      socket.off("userCount");
    };
  }, [roomId]);

  // 🔽 Auto-scroll when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 💬 Send message
  async function handleSend() {
    if (!input.trim()) return;

    const newMessage = {
      user: username,
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    await sendMessage(roomId, newMessage);
    setInput("");
  }

  return (
    <div>
      {/* 🔷 HEADER */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Room: {roomId}</h3>
        <p style={{ fontSize: "12px", color: "#4caf50" }}>
          🟢 {userCount} users online
        </p>
      </div>

      {/* 💬 MESSAGES */}
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          paddingRight: "5px",
        }}
      >
        {messages.length === 0 && (
          <p style={{ opacity: 0.6 }}>No messages yet</p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "8px",
              padding: "8px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "6px",
            }}
          >
            <strong>{msg.user}</strong>{" "}
            <span style={{ fontSize: "11px", opacity: 0.6 }}>
              {msg.time}
            </span>
            <div>{msg.text}</div>
          </div>
        ))}

        {/* 🔽 Auto-scroll target */}
        <div ref={bottomRef}></div>
      </div>

      {/* ✏️ INPUT */}
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            outline: "none",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "10px 16px",
            borderRadius: "6px",
            background: "#4caf50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;