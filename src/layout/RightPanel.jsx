import { useState } from "react";
import ChatBot from "../ChatBot";
import axios from "axios";
import { FiMessageSquare, FiFileText, FiEdit, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AI_URL = process.env.REACT_APP_AI_URL || "http://localhost:8082";
const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const TAB_COLORS = {
  chat: "#6366f1",
  pdf: "#f97316",
  notes: "#10b981",
};

function RightPanel({ isOpen, toggle }) {
  const [mode, setMode] = useState("chat");
  const [pdfAction, setPdfAction] = useState("summary");
  const [pdfOutput, setPdfOutput] = useState("");
  const [pdfQuestion, setPdfQuestion] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [notesOutput, setNotesOutput] = useState("");
  const [loading, setLoading] = useState(false);



  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", pdfAction);
    if (pdfQuestion) formData.append("question", pdfQuestion);
    setLoading(true);
    try {
      const res = await axios.post(`${AI_URL}/ai/pdf`, formData);
      setPdfOutput(res.data.reply);
    } catch { setPdfOutput("Failed to process PDF."); }
    finally { setLoading(false); }
  };

  const askPDF = async () => {
    if (!pdfFile || !pdfQuestion) return;
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("action", "qa");
    formData.append("question", pdfQuestion);
    setLoading(true);
    try {
      const res = await axios.post(`${AI_URL}/ai/pdf`, formData);
      setPdfOutput(res.data.reply);
    } catch { setPdfOutput("Failed to get answer."); }
    finally { setLoading(false); }
  };

  const generateNotes = async () => {
    if (!notesInput) return;
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/api/chat`, { message: "notes:" + notesInput });
      setNotesOutput(res.data.reply);
    } catch { setNotesOutput("Failed to generate notes."); }
    finally { setLoading(false); }
  };

  const tabs = [
    { key: "chat", icon: FiMessageSquare, label: "AI Chat" },
    { key: "pdf", icon: FiFileText, label: "PDF" },
    { key: "notes", icon: FiEdit, label: "Notes" },
  ];

  const activeColor = TAB_COLORS[mode] || "#6366f1";

  return (
    <aside style={{
      height: "100%",
      flexShrink: 0,
      width: isOpen ? 308 : 0,
      background: "rgba(11,15,26,0.97)",
      borderLeft: "1px solid rgba(255,255,255,0.04)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      position: "relative",
    }}>

      {/* TOGGLE BUTTON */}
      <button
        onClick={toggle}
        style={{
          position: "absolute",
          top: "50%",
          left: -18,
          transform: "translateY(-50%)",
          width: 18,
          height: 52,
          background: "linear-gradient(180deg, #1e293b, #0b0f1a)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRight: "none",
          borderRadius: "8px 0 0 8px",
          color: "#475569",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(180deg, #6366f1, #3b82f6)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(180deg, #1e293b, #0b0f1a)";
          e.currentTarget.style.color = "#475569";
        }}
      >
        {isOpen ? <FiChevronRight size={10} /> : <FiChevronLeft size={10} />}
      </button>

      {isOpen && (
        <>
          {/* HEADER */}
          <div style={{ padding: "18px 16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>

            {/* Title row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${activeColor}, #3b82f6)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                  boxShadow: `0 0 12px ${activeColor}55`,
                  transition: "all 0.3s ease",
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em" }}>AI Assistant</div>
                  <div style={{ fontSize: 10, color: "#334155", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
                    Online
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 2, marginBottom: 0 }}>
              {tabs.map(({ key, icon: Icon, label }) => {
                const isActive = mode === key;
                const tabColor = TAB_COLORS[key];
                return (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      padding: "9px 0",
                      border: "none",
                      borderBottom: isActive ? `2px solid ${tabColor}` : "2px solid transparent",
                      background: isActive ? `${tabColor}10` : "transparent",
                      color: isActive ? tabColor : "#334155",
                      fontSize: 11.5,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderRadius: isActive ? "6px 6px 0 0" : "6px",
                    }}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* CHAT — always mounted, just hidden */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: mode === "chat" ? "flex" : "none", flexDirection: "column" }}>
              <ChatBot />
            </div>

            {/* PDF — always mounted, just hidden */}
            <div style={{ flex: 1, display: mode === "pdf" ? "flex" : "none", flexDirection: "column", padding: "14px 16px", gap: 10, overflow: "hidden" }}>
                <select value={pdfAction} onChange={(e) => setPdfAction(e.target.value)} style={inputStyle}>
                  <option value="summary">📝 Summarize PDF</option>
                  <option value="notes">📋 Generate Notes</option>
                  <option value="qa">❓ Ask a Question</option>
                </select>

                {pdfAction === "qa" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      value={pdfQuestion}
                      onChange={(e) => setPdfQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && askPDF()}
                      placeholder="Your question..."
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={askPDF} style={actionBtnStyle(activeColor)}>Ask</button>
                  </div>
                )}

                <label style={uploadBtnStyle}>
                  <span>{pdfFile ? `📄 ${pdfFile.name.slice(0, 22)}…` : "📂 Upload PDF"}</span>
                  <input type="file" accept="application/pdf" onChange={handlePDF} style={{ display: "none" }} />
                </label>

                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: activeColor, borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                    Processing...
                  </div>
                )}

                <div style={outputStyle}>
                  {pdfOutput || <span style={{ color: "#1e293b" }}>Output will appear here…</span>}
                </div>
              </div>

            {/* NOTES — always mounted, just hidden */}
            <div style={{ flex: 1, display: mode === "notes" ? "flex" : "none", flexDirection: "column", padding: "14px 16px", gap: 10, overflow: "hidden" }}>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Paste your content here to generate notes…"
                  style={{ ...inputStyle, height: 110, resize: "none", lineHeight: 1.6, overflow: "auto" }}
                />
                <button onClick={generateNotes} disabled={loading} style={actionBtnStyle(activeColor)}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                      Generating...
                    </span>
                  ) : "✨ Generate Notes"}
                </button>
                <div style={outputStyle}>
                  {notesOutput || <span style={{ color: "#1e293b" }}>Notes will appear here…</span>}
                </div>
              </div>
          </div>
        </>
      )}
    </aside>
  );
}

const inputStyle = {
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.04)",
  color: "#e2e8f0",
  fontSize: 13,
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s, background 0.2s",
};

function actionBtnStyle(color = "#6366f1") {
  return {
    padding: "9px 16px",
    borderRadius: 10,
    border: "none",
    background: `linear-gradient(135deg, ${color}, #3b82f6)`,
    color: "white",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.2s",
    flexShrink: 0,
    width: "100%",
    boxShadow: `0 2px 12px ${color}40`,
  };
}

const uploadBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "9px 16px",
  borderRadius: 10,
  border: "1px dashed rgba(99,102,241,0.35)",
  background: "rgba(99,102,241,0.05)",
  color: "#818cf8",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const outputStyle = {
  flex: 1,
  overflowY: "auto",
  background: "rgba(0,0,0,0.35)",
  padding: "12px 14px",
  borderRadius: 10,
  fontSize: 12.5,
  lineHeight: 1.7,
  color: "#94a3b8",
  whiteSpace: "pre-wrap",
  border: "1px solid rgba(255,255,255,0.04)",
};

export default RightPanel;
