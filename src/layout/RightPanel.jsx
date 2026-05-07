import React, { useState, useEffect } from "react";
import ChatBot from "../ChatBot";
import axios from "axios";

function RightPanel({ isOpen, toggle }) {

  // 🔥 STATES
  const [mode, setMode] = useState("chat");

  const [pdfAction, setPdfAction] = useState("summary");
  const [pdfOutput, setPdfOutput] = useState("");
  const [pdfQuestion, setPdfQuestion] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [notesInput, setNotesInput] = useState("");
  const [notesOutput, setNotesOutput] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔥 CLEAR OLD DATA
  useEffect(() => {
    if (mode === "pdf") {
      setNotesOutput("");
    } else if (mode === "notes") {
      setPdfOutput("");
    }
  }, [mode]);

  // 📄 UPLOAD PDF
  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPdfFile(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", pdfAction);
    formData.append("question", pdfQuestion);

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.REACT_APP_AI_URL || "http://localhost:8082"}/ai/pdf`,
        formData
      );

      setPdfOutput(res.data.reply);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ❓ ASK FROM PDF
  const askPDF = async () => {
    if (!pdfFile) {
      alert("Upload PDF first");
      return;
    }

    if (!pdfQuestion) return;

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("action", "qa");
    formData.append("question", pdfQuestion);

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.REACT_APP_AI_URL || "http://localhost:8082"}/ai/pdf`,
        formData
      );

      setPdfOutput(res.data.reply);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 📝 NOTES
  const generateNotes = async () => {
    if (!notesInput) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/chat`,
        { message: "notes:" + notesInput }
      );

      setNotesOutput(res.data.reply);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FORMAT TEXT
  const formatText = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*(.*?)\*\*/g, "\n$1\n")
      .replace(/- /g, "• ")
      .replace(/\n{2,}/g, "\n\n");
  };

  return (
    <aside className={`right-panel glass ${isOpen ? "open" : "collapsed"}`}>

      {/* TOGGLE */}
      <div className="right-panel-toggle" onClick={toggle}>
        {isOpen ? "❯" : "❮"}
      </div>

      {isOpen && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}>

          <h3 className="gradient-text">AI Assistant</h3>

          {/* 🔥 TABS */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
            <button onClick={() => setMode("chat")}>💬</button>
            <button onClick={() => setMode("pdf")}>📄</button>
            <button onClick={() => setMode("notes")}>📝</button>
          </div>

          {/* 🔥 CONTENT */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%"
          }}>

            {/* 💬 CHAT */}
            {mode === "chat" && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <ChatBot />
              </div>
            )}

            {/* 📄 PDF */}
            {mode === "pdf" && (
              <div style={{ color: "white" }}>

                {/* ACTION SELECT */}
                <select
                  value={pdfAction}
                  onChange={(e) => setPdfAction(e.target.value)}
                  style={{
                    marginBottom: "10px",
                    padding: "6px",
                    borderRadius: "6px"
                  }}
                >
                  <option value="summary">📄 Summarize</option>
                  <option value="notes">📝 Notes</option>
                  <option value="qa">❓ Ask Question</option>
                </select>

                {/* QUESTION */}
                {pdfAction === "qa" && (
                  <>
                    <input
                      value={pdfQuestion}
                      onChange={(e) => setPdfQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") askPDF();
                      }}
                      placeholder="Ask from PDF..."
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                        marginBottom: "10px"
                      }}
                    />

                    <button
                      onClick={askPDF}
                      style={{
                        padding: "8px 12px",
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        marginBottom: "10px",
                        cursor: "pointer"
                      }}
                    >
                      Ask
                    </button>
                  </>
                )}

                {/* UPLOAD */}
                <label style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  background: "#3b82f6",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "10px"
                }}>
                  📄 Upload PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePDF}
                    style={{ display: "none" }}
                  />
                </label>

                {/* LOADING */}
                {loading && <p>Processing...</p>}

                {/* OUTPUT (SCROLL FIXED) */}
                <div style={{
                  height: "250px",
                  overflowY: "auto",
                  background: "#0f172a",
                  padding: "12px",
                  borderRadius: "10px",
                  whiteSpace: "pre-wrap"
                }}>
                  {formatText(pdfOutput)}
                </div>
              </div>
            )}

            {/* 📝 NOTES */}
            {mode === "notes" && (
              <div>

                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Paste content..."
                  style={{
                    width: "100%",
                    height: "100px",
                    borderRadius: "8px",
                    padding: "8px"
                  }}
                />

                <button onClick={generateNotes}>
                  Generate
                </button>

                {loading && <p>Generating...</p>}

                <div style={{
                  height: "250px",
                  overflowY: "auto",
                  background: "#0f172a",
                  padding: "12px",
                  borderRadius: "10px",
                  whiteSpace: "pre-wrap"
                }}>
                  {formatText(notesOutput)}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </aside>
  );
}

export default RightPanel;