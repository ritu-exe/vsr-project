import { useState, useRef, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "System",
      text: "Welcome to the study room 👋",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  function sendMessage() {
    if (input.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      user: "You",
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  }

  // auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>💬 Study Room Chat</div>

      <div style={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} style={styles.message}>
            <div style={styles.user}>
              {msg.user} <span style={styles.time}>{msg.time}</span>
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputBox}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    padding: "10px",
    fontWeight: "bold",
    borderBottom: "1px solid #334155",
  },
  messages: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
  },
  message: {
    marginBottom: "15px",
  },
  user: {
    fontWeight: "600",
    fontSize: "14px",
  },
  time: {
    fontSize: "11px",
    marginLeft: "6px",
    color: "#94a3b8",
  },
  inputBox: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    borderTop: "1px solid #334155",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default Chat;
