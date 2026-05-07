import { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import "./Compiler.css";
import { updateProgress } from "../services/progressService";



const languages = [
  { id: 63, name: "JavaScript", value: "javascript" },
  { id: 71, name: "Python", value: "python" },
  { id: 54, name: "C++", value: "cpp" },
  { id: 62, name: "Java", value: "java" }
];

export default function Compiler() {
  const [code, setCode] = useState("// Write your code here");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Your output will appear here...");
  const [language, setLanguage] = useState(languages[0]);
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");
    updateProgress("compilerRuns", 1);

    try {
      const response = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: code,
          stdin: input,
          language_id: language.id
        }
      );

      const res = response.data;

      setOutput(
        res.stdout ||
        res.stderr ||
        res.compile_output ||
        "No output"
      );
    } catch (err) {
      setOutput("Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="compiler-page">

      {/* TOP BAR */}
      <div className="top-bar">
        <h2>⚡ Compiler</h2>

        <select
          value={language.id}
          onChange={(e) =>
            setLanguage(
              languages.find((l) => l.id === parseInt(e.target.value))
            )
          }
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>

        <button onClick={runCode} disabled={loading}>
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {/* MAIN */}
      <div className="main-container">

        {/* LEFT - EDITOR */}
        <div className="editor-section">
          <Editor
            height="500px"
            language={language.value}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />
        </div>

        {/* RIGHT */}
        <div className="right-section">

          <div className="input-section">
            <h3>Input</h3>
            <textarea
              placeholder="Enter input..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="output-section">
            <h3>Output</h3>
            <pre>{output}</pre>
          </div>

        </div>
      </div>
    </div>
  );
}