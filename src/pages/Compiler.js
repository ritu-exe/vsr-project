import { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import "./Compiler.css";
import { updateProgress } from "../services/progressService";

const languages = [
  { id: 63, name: "JavaScript", value: "javascript", emoji: "🟨" },
  { id: 71, name: "Python", value: "python", emoji: "🐍" },
  { id: 54, name: "C++", value: "cpp", emoji: "⚙️" },
  { id: 62, name: "Java", value: "java", emoji: "☕" },
];

const PLACEHOLDERS = {
  javascript: `// JavaScript — Write your code here
console.log("Hello, World!");`,
  python: `# Python — Write your code here
print("Hello, World!")`,
  cpp: `// C++ — Write your code here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  java: `// Java — Write your code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
};

export default function Compiler() {
  const [language, setLanguage] = useState(languages[0]);
  const [code, setCode] = useState(PLACEHOLDERS[languages[0].value]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [runCount, setRunCount] = useState(0);

  function handleLangChange(e) {
    const lang = languages.find((l) => l.id === parseInt(e.target.value));
    setLanguage(lang);
    setCode(PLACEHOLDERS[lang.value]);
    setOutput("");
  }

  const runCode = async () => {
    setLoading(true);
    setOutput("⏳ Running your code...");
    updateProgress("compilerRuns", 1);
    setRunCount((c) => c + 1);

    try {
      const response = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        { source_code: code, stdin: input, language_id: language.id }
      );
      const res = response.data;
      setOutput(res.stdout || res.stderr || res.compile_output || "No output");
    } catch (err) {
      setOutput("❌ Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="compiler-page">

      {/* TOP BAR */}
      <div className="top-bar">
        <h2>⚡ Compiler</h2>

        <select value={language.id} onChange={handleLangChange}>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.emoji} {lang.name}
            </option>
          ))}
        </select>

        <button onClick={runCode} disabled={loading}>
          {loading ? (
            <>
              <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "pulse 0.8s linear infinite", display: "inline-block" }} />
              Running
            </>
          ) : "▶ Run Code"}
        </button>

        <div className="compiler-status">
          <div className="status-dot" />
          Judge0 API • {runCount} run{runCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* MAIN */}
      <div className="main-container">

        {/* EDITOR */}
        <div className="editor-section">
          <Editor
            height="100%"
            language={language.value}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 13.5,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineNumbersMinChars: 3,
              renderLineHighlight: "gutter",
              cursorBlinking: "smooth",
              smoothScrolling: true,
            }}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="right-section">

          <div className="input-section">
            <h3>Stdin Input</h3>
            <textarea
              placeholder="Enter standard input here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="output-section">
            <h3>Output</h3>
            <pre style={{
              color: output.startsWith("❌") ? "#f87171"
                : output.startsWith("⏳") ? "#fbbf24"
                : "#86efac"
            }}>
              {output || "Your output will appear here..."}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}