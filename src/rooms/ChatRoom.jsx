import { useEffect, useState, useRef } from "react";
import { socket } from "../context/VoiceContext";
import { getMessages, sendMessage } from "../services/api";

function ChatRoom({ roomId, roomName }) {
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

    // fetch persisted messages from MongoDB on load
    getMessages(roomId).then((data) => {
      const msgList = Array.isArray(data) ? data : (data?.messages || data?.data || []);
      setMessages(msgList);
    });

    // realtime: server broadcasts saved message back to all clients (including sender)
    socket.on("newMessage", ({ roomId: msgRoomId, message }) => {
      if (msgRoomId === roomId) {
        // replace optimistic message with real saved one, or just append
        setMessages((prev) => {
          // avoid duplicates if socket fires fast
          const exists = prev.some(
            (m) => m._id && m._id === message._id
          );
          if (exists) return prev;
          // replace last optimistic (no _id) message with the real one
          const lastIdx = [...prev].reverse().findIndex((m) => !m._id && m.user === message.user && m.text === message.text);
          if (lastIdx !== -1) {
            const realIdx = prev.length - 1 - lastIdx;
            const updated = [...prev];
            updated[realIdx] = message;
            return updated;
          }
          return [...prev, message];
        });
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

    // ✅ Optimistic update — show message immediately in UI
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const result = await sendMessage(roomId, newMessage);
      if (result?.error) {
        console.error("Send failed:", result.error);
        // If auth error, still keep the optimistic message visible
      }
    } catch (err) {
      console.error("Network error sending message:", err);
    }
  }

  return (
    <div>
      {/* 🔷 HEADER */}
      <div style={{ marginBottom: "10px" }}>
        <h3># {roomName || "Chat Room"}</h3>
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