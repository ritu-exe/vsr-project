import PomodoroTimer from "../components/PomodoroTimer";
import { useState } from "react";
import { Hash, Mic, Video, PenTool, Plus } from "lucide-react";

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

function getPinnedRooms(rooms) {
  return rooms.filter((r) => r.name === "announcements");
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
  setCurrentView
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
              setSelectedRoom(room);
              setCurrentView("room");   // ⭐ FIX
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
  setCurrentView   // ⭐ added
}) {
  const [search, setSearch] = useState("");
  const [focusMode] = useState(false);

  function createServer() {
    const name = prompt("Enter server name");
    if (!name) return;

    const newServer = {
      id: Date.now().toString(),
      name,
      rooms: [
        { id: "general", name: "general-chat", type: "chat" },
        { id: "ann", name: "announcements", type: "chat" },
        { id: "fe-help", name: "frontend-help", type: "chat" },
        { id: "be-help", name: "backend-help", type: "chat" },
        { id: "voice", name: "dev-meet", type: "voice" },
        { id: "video", name: "daily-standup", type: "video" },
        { id: "board", name: "whiteboard", type: "board" },
      ],
    };

    setServers((prev) => [...prev, newServer]);
    setSelectedServer(newServer);
    setSelectedRoom(newServer.rooms[0]);
  }

  function createRoom(serverId) {
    const name = prompt("Enter room name");
    if (!name) return;

    const type = prompt("chat / voice / video / board", "chat");

    const newRoom = {
      id: Date.now().toString(),
      name,
      type,
    };

    setServers((prev) =>
      prev.map((server) =>
        server.id === serverId
          ? { ...server, rooms: [...server.rooms, newRoom] }
          : server
      )
    );

    setSelectedRoom(newRoom);
  }

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
        const pinned = getPinnedRooms(filteredRooms);

        return (
          <div key={server.id} className="server-block">
            <div
              className={`server-avatar ${
                server.id === selectedServer.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedServer(server);
                setSelectedRoom(server.rooms[0]);
                setCurrentView("room");  // ⭐ FIX
              }}
              title={server.name}
            >
              <span>{server.name[0].toUpperCase()}</span>
            </div>

            {server.id === selectedServer.id && (
              <div className="room-list">
                <div className="sidebar-search">
                  <input
                    placeholder="Search rooms…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <RoomSection
                  title="GENERAL"
                  rooms={grouped.general}
                  {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setCurrentView }}
                />

                <RoomSection
                  title="HELP"
                  rooms={grouped.help}
                  {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setCurrentView }}
                />

                <RoomSection
                  title="TEXT CHANNELS"
                  rooms={grouped.text}
                  {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setCurrentView }}
                />

                <RoomSection
                  title="VOICE CHANNELS"
                  rooms={grouped.voice}
                  {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setCurrentView }}
                />

                <RoomSection
                  title="VIDEO CHANNELS"
                  rooms={grouped.video}
                  {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setCurrentView }}
                />

                <RoomSection
                  title="WHITEBOARD"
                  rooms={grouped.board}
                  {...{ serverId: server.id, selectedRoom, setSelectedRoom, deleteRoom, focusMode, setCurrentView }}
                />
              </div>
            )}
          </div>
        );
      })}

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