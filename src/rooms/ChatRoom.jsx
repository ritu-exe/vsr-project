import { useEffect, useState } from "react";
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
} from "../services/chatService";

function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // load initial messages
    setMessages(getMessages(roomId));

    // subscribe to realtime updates
    const unsubscribe = subscribeToMessages(roomId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return unsubscribe;
  }, [roomId]);

  function handleSend() {
    if (!input.trim()) return;

    sendMessage(roomId, {
      user: "You",
      text: input,
      time: new Date().toLocaleTimeString(),
    });

    setInput("");
  }

  return (
    <div>
      {messages.length === 0 && (
        <p style={{ opacity: 0.6 }}>No messages yet</p>
      )}

      {messages.map((msg, i) => (
        <div key={i} style={{ marginBottom: "6px" }}>
          <strong>{msg.user}</strong>{" "}
          <span style={{ fontSize: "11px", opacity: 0.6 }}>
            {msg.time}
          </span>
          <div>{msg.text}</div>
        </div>
      ))}

      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px" }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
