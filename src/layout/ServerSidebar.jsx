import PomodoroTimer from "../components/PomodoroTimer";
import { useState } from "react";
import { Hash, Mic, Video, PenTool, Plus, Search, ChevronDown, ChevronRight } from "lucide-react";
import { createServer as apiCreateServer, createRoomInServer } from "../services/api";
import FloatingCallBar from "./FloatingCallBar";

/* ─── helpers ──────────────────────────────────────────────── */

const TYPE_META = {
  voice: { icon: Mic,      color: "#10b981", label: "Voice" },
  video: { icon: Video,    color: "#f97316", label: "Video" },
  board: { icon: PenTool,  color: "#a78bfa", label: "Board" },
  chat:  { icon: Hash,     color: "#6366f1", label: "Text"  },
};

function getRoomMeta(type) {
  return TYPE_META[type] || TYPE_META.chat;
}

function hasUnread(room) {
  return room.name.includes("help");
}

function groupRoomsBySection(rooms) {
  return {
    general: rooms.filter((r) => r.name.includes("general")),
    help:    rooms.filter((r) => r.name.includes("help")),
    text:    rooms.filter((r) => r.type === "chat" && !r.name.includes("general") && !r.name.includes("help")),
    voice:   rooms.filter((r) => r.type === "voice"),
    video:   rooms.filter((r) => r.type === "video"),
    board:   rooms.filter((r) => r.type === "board"),
  };
}

/* ─── RoomSection ──────────────────────────────────────────── */

function RoomSection({ title, rooms, icon: SectionIcon, sectionColor, serverId, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }) {
  const [open, setOpen] = useState(true);
  if (!rooms.length) return null;

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Section header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={sectionHeaderStyle}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {open
            ? <ChevronDown size={10} style={{ color: "#334155" }} />
            : <ChevronRight size={10} style={{ color: "#334155" }} />}
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#334155" }}>
            {title}
          </span>
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700,
          background: `${sectionColor}22`,
          color: sectionColor,
          padding: "1px 6px", borderRadius: 10,
          border: `1px solid ${sectionColor}33`,
        }}>
          {rooms.length}
        </span>
      </button>

      {/* Room items */}
      {open && rooms.map((room) => {
        const meta = getRoomMeta(room.type);
        const Icon = meta.icon;
        const isActive = room.id === selectedRoom.id;
        const isDimmed = focusMode && !isActive;

        return (
          <div
            key={room.id}
            onClick={() => { setSelectedRoom(room); setPage("chat"); }}
            onContextMenu={(e) => { e.preventDefault(); deleteRoom(serverId, room.id); }}
            style={{
              ...roomItemStyle,
              opacity: isDimmed ? 0.3 : 1,
              pointerEvents: isDimmed ? "none" : "auto",
              background: isActive
                ? `linear-gradient(135deg, ${meta.color}22, ${meta.color}12)`
                : "transparent",
              border: isActive
                ? `1px solid ${meta.color}33`
                : "1px solid transparent",
              color: isActive ? "#e2e8f0" : "#475569",
            }}
            className="sidebar-room-item"
          >
            {/* Left accent bar */}
            {isActive && (
              <div style={{
                position: "absolute",
                left: 0, top: "20%", bottom: "20%",
                width: 3,
                borderRadius: "0 3px 3px 0",
                background: meta.color,
                boxShadow: `0 0 8px ${meta.color}88`,
              }} />
            )}

            <span style={{
              width: 24, height: 24,
              borderRadius: 7,
              background: isActive ? `${meta.color}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${isActive ? meta.color + "40" : "rgba(255,255,255,0.05)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              color: isActive ? meta.color : "#334155",
              transition: "all 0.2s",
            }}>
              <Icon size={11} />
            </span>

            <span style={{
              flex: 1,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#c7d2fe" : "#475569",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
            }}>
              {room.name}
            </span>

            {hasUnread(room) && (
              <span style={{
                width: 6, height: 6,
                borderRadius: "50%",
                background: "#3b82f6",
                boxShadow: "0 0 6px #3b82f6",
                flexShrink: 0,
                animation: "pulse 2s infinite",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── UserBadge ────────────────────────────────────────────── */

function UserBadge() {
  const username = localStorage.getItem("username") || "Student";
  const initials = username.slice(0, 2).toUpperCase();
  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f97316"];
  const color = colors[username.charCodeAt(0) % colors.length];

  return (
    <div style={userBadgeStyle}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `linear-gradient(135deg, ${color}, #3b82f6)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: "white",
        boxShadow: `0 0 14px ${color}55, 0 0 0 2px ${color}33`,
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c7d2fe", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {username}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b981", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "#334155", fontWeight: 500 }}>Online</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────── */

export default function ServerSidebar({
  servers, setServers,
  selectedServer, setSelectedServer,
  selectedRoom, setSelectedRoom,
  setPage,
}) {
  const [search, setSearch] = useState("");
  const [focusMode] = useState(false);

  /* ---- Create server ---- */
  async function createServer() {
    const name = prompt("Enter server name");
    if (!name) return;
    try {
      const saved = await apiCreateServer(name);
      const newServer = {
        id: saved._id || saved.id,
        name: saved.name,
        rooms: (saved.rooms || []).map((r) => ({
          id: r._id || r.id,
          name: r.name,
          type: r.type || "chat",
        })),
      };
      setServers((prev) => [...prev, newServer]);
      setSelectedServer(newServer);
      setSelectedRoom(newServer.rooms[0]);
    } catch (err) {
      console.error(err);
      alert("Failed to create server");
    }
  }

  /* ---- Create room ---- */
  async function createRoom(serverId) {
    const name = prompt("Enter room name");
    if (!name) return;
    
    // Quick prompt for type
    const typeStr = prompt("Enter type: chat, voice, video, board", "chat");
    const type = ["chat", "voice", "video", "board"].includes(typeStr) ? typeStr : "chat";

    try {
      const newRoomFromAPI = await createRoomInServer(serverId, name, type);
      const newRoom = { id: newRoomFromAPI._id || newRoomFromAPI.id, name: newRoomFromAPI.name, type: newRoomFromAPI.type || "chat" };
      setServers((prev) =>
        prev.map((s) => s.id === serverId ? { ...s, rooms: [...s.rooms, newRoom] } : s)
      );
      setSelectedRoom(newRoom);
      setPage("chat");
    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    }
  }

  /* ---- Delete room ---- */
  function deleteRoom(serverId, roomId) {
    if (!window.confirm("Delete this room?")) return;
    setServers((prev) =>
      prev.map((s) =>
        s.id === serverId ? { ...s, rooms: s.rooms.filter((r) => r.id !== roomId) } : s
      )
    );
  }

  return (
    <aside style={asideStyle}>

      {/* ── Server header block ── */}
      {servers.map((server) => {
        const isSelected = server.id === selectedServer.id;
        const filteredRooms = server.rooms.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase())
        );
        const grouped = groupRoomsBySection(filteredRooms);

        return (
          <div key={server.id} style={{ marginBottom: 4 }}>

            {/* Server pill */}
            <div
              onClick={() => { setSelectedServer(server); setSelectedRoom(server.rooms[0]); setPage("chat"); }}
              style={serverPillStyle(isSelected)}
            >
              <div style={serverAvatarStyle(isSelected)}>
                {server.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#c7d2fe" : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {server.name}
                </div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>
                  {server.rooms.length} channel{server.rooms.length !== 1 ? "s" : ""}
                </div>
              </div>
              {isSelected && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1", flexShrink: 0 }} />
              )}
            </div>

            {/* Room list — only for selected server */}
            {isSelected && (
              <div style={{ padding: "6px 0 2px" }}>

                {/* Search */}
                <div style={searchWrapStyle}>
                  <Search size={12} style={{ color: "#334155", flexShrink: 0 }} />
                  <input
                    placeholder="Search channels…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={searchInputStyle}
                  />
                </div>

                {/* Sections */}
                <RoomSection title="GENERAL"        icon={Hash}    sectionColor="#6366f1" rooms={grouped.general} {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="HELP"           icon={Hash}    sectionColor="#f97316" rooms={grouped.help}    {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="TEXT CHANNELS"  icon={Hash}    sectionColor="#6366f1" rooms={grouped.text}    {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="VOICE CHANNELS" icon={Mic}     sectionColor="#10b981" rooms={grouped.voice}   {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="VIDEO CHANNELS" icon={Video}   sectionColor="#f97316" rooms={grouped.video}   {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="WHITEBOARD"     icon={PenTool} sectionColor="#a78bfa" rooms={grouped.board}   {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />

                {/* Add room */}
                <button onClick={() => createRoom(server.id)} style={addRoomBtnStyle}>
                  <span style={addRoomIconStyle}>
                    <Plus size={10} />
                  </span>
                  Add Channel
                </button>

              </div>
            )}
          </div>
        );
      })}

      {/* ── Add server ── */}
      <button onClick={createServer} style={addServerBtnStyle}>
        <span style={addServerIconStyle}><Plus size={12} /></span>
        New Server
      </button>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Pomodoro ── */}
      <div>
        <div style={sectionLabelStyle}>⏱ Quick Timer</div>
        <PomodoroTimer />
      </div>

      {/* ── Divider ── */}
      <div style={dividerStyle} />

      {/* ── Floating Call Bar ── */}
      <FloatingCallBar setPage={setPage} setSelectedRoom={setSelectedRoom} servers={servers} />

      {/* ── User badge ── */}
      <UserBadge />

    </aside>
  );
}

/* ─── Styles ───────────────────────────────────────────────── */

const asideStyle = {
  width: 252,
  minWidth: 252,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "14px 10px 14px",
  background: "rgba(9, 12, 22, 0.98)",
  borderRight: "1px solid rgba(255,255,255,0.04)",
  overflowY: "auto",
  overflowX: "hidden",
  gap: 0,
};

function serverPillStyle(active) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: active ? "rgba(99,102,241,0.1)" : "transparent",
    border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
    marginBottom: 4,
  };
}

function serverAvatarStyle(active) {
  return {
    width: 36, height: 36,
    borderRadius: 11,
    background: active
      ? "linear-gradient(135deg, #6366f1, #3b82f6)"
      : "linear-gradient(135deg, #1e293b, #0f172a)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 800, color: active ? "white" : "#334155",
    boxShadow: active ? "0 0 18px rgba(99,102,241,0.4), 0 0 0 2px rgba(99,102,241,0.3)" : "none",
    transition: "all 0.25s ease",
    flexShrink: 0,
    letterSpacing: "-0.02em",
  };
}

const searchWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 10px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  margin: "0 2px 10px",
  transition: "border-color 0.2s",
};

const searchInputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#94a3b8",
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "6px 8px",
  borderRadius: 7,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  marginBottom: 3,
  transition: "background 0.15s",
};

const roomItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 8px 7px 12px",
  margin: "1px 0",
  borderRadius: 10,
  cursor: "pointer",
  transition: "all 0.18s ease",
  position: "relative",
  overflow: "hidden",
};

const addRoomBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 10px",
  margin: "6px 2px 2px",
  borderRadius: 10,
  border: "1px dashed rgba(99,102,241,0.2)",
  background: "transparent",
  color: "#334155",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  width: "calc(100% - 4px)",
  fontFamily: "Inter, sans-serif",
};

const addRoomIconStyle = {
  width: 18, height: 18,
  borderRadius: 6,
  background: "rgba(99,102,241,0.12)",
  border: "1px solid rgba(99,102,241,0.2)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#6366f1",
  flexShrink: 0,
};

const addServerBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  margin: "4px 0",
  borderRadius: 10,
  border: "1px solid rgba(16,185,129,0.15)",
  background: "rgba(16,185,129,0.06)",
  color: "#34d399",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s ease",
  width: "100%",
  fontFamily: "Inter, sans-serif",
  letterSpacing: "0.01em",
};

const addServerIconStyle = {
  width: 20, height: 20,
  borderRadius: 7,
  background: "rgba(16,185,129,0.15)",
  border: "1px solid rgba(16,185,129,0.25)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#34d399",
  flexShrink: 0,
};

const sectionLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#1e293b",
  padding: "0 8px",
  marginBottom: 2,
};

const dividerStyle = {
  height: 1,
  background: "rgba(255,255,255,0.04)",
  margin: "10px 0",
};

const userBadgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 8px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
};