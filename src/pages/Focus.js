import { useState, useEffect, useRef, useCallback } from "react";
import rainSound from "../assets/rain.mp3";
import birdSound from "../assets/birds.mp3";
import { updateProgress } from "../services/progressService";

/* ─── Pomodoro modes ─────────────────────────────────────── */
const MODES = [
  { label: "Focus",       duration: 25 * 60, color: "#6366f1" },
  { label: "Short Break", duration:  5 * 60, color: "#10b981" },
  { label: "Long Break",  duration: 15 * 60, color: "#3b82f6" },
];

/* ─── Ambient sounds ─────────────────────────────────────── */
const AMBIENT = [
  { key: "rain",  label: "🌧️ Rain",  color: "#3b82f6" },
  { key: "birds", label: "🐦 Birds", color: "#10b981" },
  { key: "cafe",  label: "☕ Cafe",  color: "#f97316" },
];

/* ─── Brain frequencies ──────────────────────────────────── */
const BRAIN_FREQS = [
  {
    region: "Frontal Lobe",
    emoji: "🧠",
    color: "#6366f1",
    hz: 40,
    beat: 40,
    wave: "gamma",
    desc: "Executive focus, decision-making & working memory",
    tag: "γ Gamma · 40 Hz",
  },
  {
    region: "Prefrontal Cortex",
    emoji: "⚡",
    color: "#8b5cf6",
    hz: 18,
    beat: 18,
    wave: "beta",
    desc: "Active thinking, concentration & alertness",
    tag: "β Beta · 18 Hz",
  },
  {
    region: "Hippocampus",
    emoji: "💾",
    color: "#06b6d4",
    hz: 6,
    beat: 6,
    wave: "theta",
    desc: "Memory consolidation, learning & creativity",
    tag: "θ Theta · 6 Hz",
  },
  {
    region: "Amygdala",
    emoji: "❤️",
    color: "#10b981",
    hz: 10,
    beat: 10,
    wave: "alpha",
    desc: "Emotional calm, stress relief & mindfulness",
    tag: "α Alpha · 10 Hz",
  },
  {
    region: "Parietal Lobe",
    emoji: "🔢",
    color: "#f59e0b",
    hz: 14,
    beat: 14,
    wave: "beta-low",
    desc: "Spatial reasoning, maths & sensory integration",
    tag: "β Low · 14 Hz",
  },
  {
    region: "Occipital Lobe",
    emoji: "👁️",
    color: "#ec4899",
    hz: 8,
    beat: 8,
    wave: "alpha-low",
    desc: "Visual processing, imagination & relaxed focus",
    tag: "α Low · 8 Hz",
  },
  {
    region: "Deep Sleep / Recovery",
    emoji: "🌙",
    color: "#334155",
    hz: 2,
    beat: 2,
    wave: "delta",
    desc: "Deep rest, body repair & subconscious processing",
    tag: "δ Delta · 2 Hz",
  },
];

/* ─── Web Audio helpers ──────────────────────────────────── */
function createBinauralBeat(audioCtx, gainNode, beatHz) {
  const baseFreq = 200;
  const L = audioCtx.createOscillator();
  const R = audioCtx.createOscillator();
  const mergerL = audioCtx.createChannelMerger(2);
  const mergerR = audioCtx.createChannelMerger(2);
  const gainL = audioCtx.createGain();
  const gainR = audioCtx.createGain();

  L.frequency.value = baseFreq;
  R.frequency.value = baseFreq + beatHz;
  L.type = "sine";
  R.type = "sine";
  gainL.gain.value = 0.18;
  gainR.gain.value = 0.18;

  L.connect(gainL); gainL.connect(gainNode);
  R.connect(gainR); gainR.connect(gainNode);
  L.start(); R.start();
  return [L, R];
}

function createPinkNoise(audioCtx, gainNode) {
  const bufSize = audioCtx.sampleRate * 2;
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < bufSize; i++) {
    const w = Math.random() * 2 - 1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
    b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
    data[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)/8; b6=w*0.115926;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const g = audioCtx.createGain(); g.gain.value = 0.12;
  src.connect(g); g.connect(gainNode); src.start();
  return src;
}

/* ═══════════════════════════════════════════════════════════ */

export default function Focus() {
  const [modeIdx, setModeIdx]       = useState(0);
  const [time, setTime]             = useState(MODES[0].duration);
  const [running, setRunning]       = useState(false);
  const [sessions, setSessions]     = useState(0);
  const [activeAmbient, setActiveAmbient] = useState(null);
  const [activeFreq, setActiveFreq] = useState(null);
  const [volume, setVolume]         = useState(0.6);

  const rainRef    = useRef(null);
  const birdRef    = useRef(null);
  const ambientRef = useRef(null); // current ambient audio element
  const audioCtxRef  = useRef(null);
  const freqNodesRef = useRef([]);
  const freqGainRef  = useRef(null);
  const cafeNodeRef  = useRef(null);
  const cafeCtxRef   = useRef(null);

  const mode    = MODES[modeIdx];
  const elapsed = mode.duration - time;
  const progress = elapsed / mode.duration; // 0→1 as timer runs

  /* Ring geometry: ring DEPLETES (full at start, empty at end) */
  const R    = 110;
  const circ = 2 * Math.PI * R;
  // We show a "remaining" ring: full stroke at start, shrinks to 0
  const dashOffset = circ * progress; // offset grows → visible arc shrinks

  /* ── Reset on mode switch ────────────────────────────────── */
  useEffect(() => {
    setTime(mode.duration);
    setRunning(false);
  }, [modeIdx]);

  /* ── Countdown interval ──────────────────────────────────── */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          if (modeIdx === 0) {
            updateProgress("focusTime", 25);
            updateProgress("sessions", 1);
            setSessions(s => s + 1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line

  /* ── Volume sync ─────────────────────────────────────────── */
  useEffect(() => {
    [rainRef.current, birdRef.current].forEach(a => { if (a) a.volume = volume; });
    if (freqGainRef.current) freqGainRef.current.gain.value = volume;
  }, [volume]);

  /* ── Cleanup on unmount ──────────────────────────────────── */
  useEffect(() => () => {
    stopAllAmbient(); stopFreq();
  }, []); // eslint-disable-line

  /* ── Ambient controls ────────────────────────────────────── */
  function stopAllAmbient() {
    [rainRef.current, birdRef.current].forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
    if (cafeNodeRef.current) { try { cafeNodeRef.current.stop(); } catch(_){} cafeNodeRef.current = null; }
    if (cafeCtxRef.current)  { cafeCtxRef.current.close(); cafeCtxRef.current = null; }
    ambientRef.current = null;
    setActiveAmbient(null);
  }

  function playAmbient(key) {
    if (activeAmbient === key) { stopAllAmbient(); return; }
    stopAllAmbient();

    if (key === "rain") {
      const a = rainRef.current; if (!a) return;
      a.volume = volume; a.currentTime = 0; a.play().catch(()=>{});
      ambientRef.current = a;
    } else if (key === "birds") {
      const a = birdRef.current; if (!a) return;
      a.volume = volume; a.currentTime = 0; a.play().catch(()=>{});
      ambientRef.current = a;
    } else if (key === "cafe") {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      cafeCtxRef.current = ctx;
      const g = ctx.createGain(); g.gain.value = volume; g.connect(ctx.destination);
      cafeNodeRef.current = createPinkNoise(ctx, g);
    }
    setActiveAmbient(key);
  }

  /* ── Brain frequency controls ────────────────────────────── */
  function stopFreq() {
    freqNodesRef.current.forEach(n => { try { n.stop(); } catch(_){} });
    freqNodesRef.current = [];
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    freqGainRef.current = null;
    setActiveFreq(null);
  }

  function playFreq(f) {
    if (activeFreq === f.region) { stopFreq(); return; }
    stopFreq();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const g = ctx.createGain(); g.gain.value = volume; g.connect(ctx.destination);
    freqGainRef.current = g;
    freqNodesRef.current = createBinauralBeat(ctx, g, f.beat);
    setActiveFreq(f.region);
  }

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"32px 40px", display:"flex", flexDirection:"column", gap:28, alignItems:"center", fontFamily:"Inter,sans-serif" }}>

      {/* HEADER */}
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", color:"#f97316", marginBottom:6, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ width:18, height:2, background:"#f97316", borderRadius:2, display:"inline-block" }} />
          Pomodoro Timer
          <span style={{ width:18, height:2, background:"#f97316", borderRadius:2, display:"inline-block" }} />
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#f1f5f9", margin:0, letterSpacing:"-0.03em", WebkitTextFillColor:"#f1f5f9" }}>
          Focus Room
        </h1>
        {sessions > 0 && <div style={{ fontSize:13, color:"#475569", marginTop:4 }}>🎉 {sessions} session{sessions!==1?"s":""} completed</div>}
      </div>

      {/* MODE TABS */}
      <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.04)", borderRadius:14, padding:4, border:"1px solid rgba(255,255,255,0.05)" }}>
        {MODES.map((m,i) => (
          <button key={m.label} onClick={() => setModeIdx(i)} style={{
            padding:"9px 20px", borderRadius:10, border:"none", fontWeight:600, fontSize:13, cursor:"pointer",
            transition:"all 0.2s", fontFamily:"Inter,sans-serif",
            background: modeIdx===i ? `${m.color}22` : "transparent",
            color: modeIdx===i ? m.color : "#475569",
            borderBottom: modeIdx===i ? `2px solid ${m.color}` : "2px solid transparent",
          }}>{m.label}</button>
        ))}
      </div>

      {/* CIRCULAR TIMER */}
      <div style={{ position:"relative", width:280, height:280, flexShrink:0 }}>
        <svg width="280" height="280" style={{ position:"absolute", top:0, left:0, transform:"rotate(-90deg)" }}>
          {/* Track (faint full ring) */}
          <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          {/* Remaining-time ring (depletes) */}
          <circle
            cx="140" cy="140" r={R} fill="none"
            stroke={mode.color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            style={{ transition:"stroke-dashoffset 1s linear", filter:`drop-shadow(0 0 14px ${mode.color}99)` }}
          />
        </svg>

        {/* Center */}
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
          <div style={{ fontSize:54, fontWeight:800, letterSpacing:3, color:mode.color, fontVariantNumeric:"tabular-nums", lineHeight:1, filter:`drop-shadow(0 0 18px ${mode.color}77)`, transition:"color 0.4s" }}>
            {mm}:{ss}
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em" }}>{mode.label}</div>
          <div style={{ fontSize:11, color:"#334155" }}>{Math.round(progress*100)}% elapsed</div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ display:"flex", gap:12 }}>
        <button
          onClick={() => setRunning(r => !r)}
          style={{
            padding:"13px 44px", borderRadius:14, border:"none", fontWeight:700, fontSize:15, cursor:"pointer",
            fontFamily:"Inter,sans-serif", letterSpacing:"0.02em",
            background: running ? `${mode.color}18` : `linear-gradient(135deg, ${mode.color}, #3b82f6)`,
            color: running ? mode.color : "white",
            border: running ? `1px solid ${mode.color}44` : "none",
            boxShadow: running ? "none" : `0 4px 20px ${mode.color}55`,
            transition:"all 0.2s",
          }}
        >
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          onClick={() => { setRunning(false); setTime(mode.duration); }}
          style={{ padding:"13px 24px", borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", fontWeight:600, fontSize:14, cursor:"pointer", background:"rgba(255,255,255,0.04)", color:"#64748b", fontFamily:"Inter,sans-serif" }}
        >
          🔁 Reset
        </button>
      </div>

      {/* VOLUME */}
      <div style={{ display:"flex", alignItems:"center", gap:10, width:"100%", maxWidth:400 }}>
        <span style={{ fontSize:12, color:"#334155", fontWeight:600, flexShrink:0 }}>🔊 Vol</span>
        <input type="range" min="0" max="1" step="0.05" value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          style={{ flex:1, accentColor: mode.color, cursor:"pointer" }}
        />
        <span style={{ fontSize:12, color:"#334155", width:32, textAlign:"right" }}>{Math.round(volume*100)}%</span>
      </div>

      {/* ─── AMBIENT SOUNDS ─── */}
      <div style={{ width:"100%", maxWidth:520 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"#334155", marginBottom:10, textAlign:"center" }}>
          🎧 Ambient Sounds
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {AMBIENT.map(s => {
            const active = activeAmbient === s.key;
            return (
              <button key={s.key} onClick={() => playAmbient(s.key)} style={{
                padding:"10px 20px", borderRadius:12, fontWeight:600, fontSize:13, cursor:"pointer",
                fontFamily:"Inter,sans-serif", transition:"all 0.2s",
                background: active ? `${s.color}18` : "rgba(255,255,255,0.04)",
                border: active ? `1px solid ${s.color}55` : "1px solid rgba(255,255,255,0.07)",
                color: active ? s.color : "#64748b",
                boxShadow: active ? `0 0 14px ${s.color}33` : "none",
              }}>
                {s.label} {active ? "●" : ""}
              </button>
            );
          })}
          <button onClick={() => stopAllAmbient()} style={{
            padding:"10px 16px", borderRadius:12, fontWeight:600, fontSize:13, cursor:"pointer",
            fontFamily:"Inter,sans-serif", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)", color:"#f87171",
          }}>⏹ Stop</button>
        </div>
      </div>

      {/* ─── BRAIN FREQUENCIES ─── */}
      <div style={{ width:"100%", maxWidth:720 }}>
        <div style={{ textAlign:"center", marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"#334155", marginBottom:4 }}>
            🧬 Brain Frequency Stimulation
          </div>
          <div style={{ fontSize:11, color:"#1e293b" }}>
            Binaural beats — use headphones for best effect
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:10 }}>
          {BRAIN_FREQS.map(f => {
            const active = activeFreq === f.region;
            return (
              <button key={f.region} onClick={() => playFreq(f)} style={{
                padding:"14px 14px", borderRadius:14, cursor:"pointer", textAlign:"left",
                fontFamily:"Inter,sans-serif", transition:"all 0.22s",
                background: active ? `${f.color}18` : "rgba(255,255,255,0.03)",
                border: active ? `1px solid ${f.color}55` : "1px solid rgba(255,255,255,0.06)",
                boxShadow: active ? `0 0 20px ${f.color}33, inset 0 0 12px ${f.color}0a` : "none",
                position:"relative", overflow:"hidden",
              }}>
                {/* Active pulse bar */}
                {active && (
                  <div style={{
                    position:"absolute", top:0, left:0, right:0, height:2,
                    background:`linear-gradient(90deg, ${f.color}, transparent)`,
                    animation:"shimmer 1.5s linear infinite",
                  }} />
                )}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:20 }}>{f.emoji}</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color: active ? f.color : "#e2e8f0", letterSpacing:"-0.01em" }}>{f.region}</div>
                    <div style={{
                      fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:8, display:"inline-block", marginTop:2,
                      background: `${f.color}22`, color: f.color, border:`1px solid ${f.color}33`, letterSpacing:"0.04em"
                    }}>{f.tag}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:"#334155", lineHeight:1.5 }}>{f.desc}</div>
                {active && (
                  <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ display:"flex", gap:2 }}>
                      {[1,2,3,4,5].map(b => (
                        <div key={b} style={{
                          width:3, height: 6 + b*3, borderRadius:2, background: f.color,
                          opacity:0.7, animation:`waveBar${b} 0.8s ease-in-out infinite`,
                          animationDelay:`${b*0.12}s`,
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize:10, color: f.color, fontWeight:700 }}>Active · {f.beat} Hz</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {activeFreq && (
          <div style={{ textAlign:"center", marginTop:12 }}>
            <button onClick={stopFreq} style={{
              padding:"8px 20px", borderRadius:10, border:"1px solid rgba(239,68,68,0.2)",
              background:"rgba(239,68,68,0.07)", color:"#f87171", fontSize:12, fontWeight:600,
              cursor:"pointer", fontFamily:"Inter,sans-serif",
            }}>⏹ Stop Frequency</button>
          </div>
        )}

        <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", fontSize:11, color:"#1e293b", textAlign:"center", lineHeight:1.6 }}>
          ⚠️ Binaural beats require <strong style={{color:"#334155"}}>stereo headphones</strong>. Keep volume comfortable. Not a medical treatment.
        </div>
      </div>

      {/* Tip */}
      <div style={{ maxWidth:440, textAlign:"center", padding:"14px 18px", borderRadius:14, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)", fontSize:13, color:"#475569", lineHeight:1.6 }}>
        💡 <strong style={{color:"#64748b"}}>Pro tip:</strong> Pair the Pomodoro timer with a brain frequency to maximise deep work sessions.
      </div>

      <audio ref={rainRef} src={rainSound} loop />
      <audio ref={birdRef} src={birdSound} loop />

      <style>{`
        @keyframes waveBar1 { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
        @keyframes waveBar2 { 0%,100%{transform:scaleY(0.6)} 50%{transform:scaleY(1)} }
        @keyframes waveBar3 { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        @keyframes waveBar4 { 0%,100%{transform:scaleY(0.7)} 50%{transform:scaleY(1)} }
        @keyframes waveBar5 { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
        @keyframes shimmer  { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }
      `}</style>
    </div>
  );
}