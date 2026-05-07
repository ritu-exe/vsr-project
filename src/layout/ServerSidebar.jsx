import PomodoroTimer from "../components/PomodoroTimer";
import { useState } from "react";
import { Hash, Mic, Video, PenTool, Plus } from "lucide-react";
import { createRoom as apiCreateRoom } from "../services/api";

/* ================= HELPERS ================= */

function getRoomIcon(type) {
  switch (type) {
    case "voice":
      return <Mic size={14} />;
    case "video":
      return <Video size={14} />;
    case "board":
      return <PenTool size={14} />;
    default:
      return <Hash size={14} />;
  }
}

function hasUnread(room) {
  return room.name.includes("help");
}

function groupRoomsBySection(rooms) {
  return {
    general: rooms.filter(
      (r) => r.name.includes("general") && r.name !== "announcements"
    ),
    help: rooms.filter((r) => r.name.includes("help")),
    text: rooms.filter(
      (r) =>
        r.type === "chat" &&
        !r.name.includes("general") &&
        !r.name.includes("help")
    ),
    voice: rooms.filter((r) => r.type === "voice"),
    video: rooms.filter((r) => r.type === "video"),
    board: rooms.filter((r) => r.type === "board"),
  };
}

/* ================= SECTION ================= */

function RoomSection({
  title,
  rooms,
  serverId,
  selectedRoom,
  setSelectedRoom,
  deleteRoom,
  focusMode,
  setPage   // 🔥 IMPORTANT
}) {
  const [open, setOpen] = useState(true);
  if (!rooms.length) return null;

  return (
    <div className="room-section">
      <div
        className="section-title clickable"
        onClick={() => setOpen(!open)}
      >
        <span className="arrow">{open ? "▾" : "▸"}</span>
        {title}
      </div>

      {open &&
        rooms.map((room) => (
          <div
            key={room.id}
            className={`room-item
              ${room.id === selectedRoom.id ? "active" : ""}
              ${focusMode && room.id !== selectedRoom.id ? "dimmed" : ""}
            `}
            onClick={() => {
              console.log("CLICKED ROOM:", room);

              setSelectedRoom(room);

              setPage("chat");   // 🔥 MAIN FIX (NO HACKS)
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              deleteRoom(serverId, room.id);
            }}
          >
            <span className="room-icon">
              {getRoomIcon(room.type)}
            </span>

            <span className="room-name">
              {room.name}
              {hasUnread(room) && <span className="unread-dot" />}
            </span>
          </div>
        ))}
    </div>
  );
}

/* ================= MAIN ================= */

function ServerSidebar({
  servers,
  setServers,
  selectedServer,
  setSelectedServer,
  selectedRoom,
  setSelectedRoom,
  setPage   // 🔥 IMPORTANT
}) {
  const [search, setSearch] = useState("");
  const [focusMode] = useState(false);

  /* ================= CREATE SERVER ================= */

  function createServer() {
    const name = prompt("Enter server name");
    if (!name) return;

    const newServer = {
      id: Date.now().toString(),
      name,
      rooms: [
        { id: "general", name: "general-chat", type: "chat" },
        { id: "ann", name: "announcements", type: "chat" }
      ],
    };

    setServers((prev) => [...prev, newServer]);
    setSelectedServer(newServer);
    setSelectedRoom(newServer.rooms[0]);
  }

  /* ================= CREATE ROOM ================= */

  async function createRoom(serverId) {
    const name = prompt("Enter room name");
    if (!name) return;

    try {
      const newRoomFromAPI = await apiCreateRoom(name);

      const newRoom = {
        id: newRoomFromAPI.id,
        name: newRoomFromAPI.name,
        type: "chat",   // 🔥 REQUIRED
      };

      setServers((prev) =>
        prev.map((server) =>
          server.id === serverId
            ? { ...server, rooms: [...server.rooms, newRoom] }
            : server
        )
      );

      setSelectedRoom(newRoom);
      setPage("chat");   // 🔥 OPEN CHAT DIRECTLY

    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    }
  }

  /* ================= DELETE ROOM ================= */

  function deleteRoom(serverId, roomId) {
    if (!window.confirm("Delete this room?")) return;

    setServers((prev) =>
      prev.map((server) =>
        server.id === serverId
          ? {
              ...server,
              rooms: server.rooms.filter((r) => r.id !== roomId),
            }
          : server
      )
    );
  }

  return (
    <aside className="server-sidebar glass">

      {servers.map((server) => {
        const filteredRooms = server.rooms.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase())
        );

        const grouped = groupRoomsBySection(filteredRooms);

        return (
          <div key={server.id} className="server-block">

            {/* SERVER ICON */}
            <div
              className={`server-avatar ${
                server.id === selectedServer.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedServer(server);
                setSelectedRoom(server.rooms[0]);
                setPage("chat");   // 🔥 IMPORTANT
              }}
              title={server.name}
            >
              <span>{server.name[0].toUpperCase()}</span>
            </div>

            {/* ROOM LIST */}
            {server.id === selectedServer.id && (
              <div className="room-list">

                {/* SEARCH */}
                <div className="sidebar-search">
                  <input
                    placeholder="Search rooms…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* CREATE ROOM */}
                <div
                  className="create-room-btn"
                  onClick={() => createRoom(server.id)}
                  style={{ cursor: "pointer", padding: "6px", color: "#22c55e" }}
                >
                  + Create Room
                </div>

                <RoomSection title="GENERAL" rooms={grouped.general} {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="HELP" rooms={grouped.help} {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="TEXT CHANNELS" rooms={grouped.text} {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="VOICE CHANNELS" rooms={grouped.voice} {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="VIDEO CHANNELS" rooms={grouped.video} {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />
                <RoomSection title="WHITEBOARD" rooms={grouped.board} {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setPage }} />

              </div>
            )}
          </div>
        );
      })}

      {/* CREATE SERVER */}
      <div className="create-server-btn" onClick={createServer}>
        <Plus size={16} />
        <span>Create Server</span>
      </div>

      <PomodoroTimer />

      <div className="sidebar-status">
        🧠 Focus Mode • Active
      </div>

    </aside>
  );
}

export default ServerSidebar;