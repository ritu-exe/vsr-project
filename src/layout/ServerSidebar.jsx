import { Hash, Mic, Video, PenTool, Plus } from "lucide-react";

function ServerSidebar({
  servers,
  setServers,
  selectedServer,
  setSelectedServer,
  selectedRoom,
  setSelectedRoom,
}) {
  function createServer() {
    const name = prompt("Enter server name");
    if (!name) return;

    const newServer = {
      id: Date.now().toString(),
      name,
      rooms: [
        {
          id: Date.now().toString() + "-room",
          name: "general",
          type: "chat",
        },
      ],
    };

    setServers((prev) => [...prev, newServer]);
    setSelectedServer(newServer);
    setSelectedRoom(newServer.rooms[0]);
  }

  function createRoom(serverId) {
    const name = prompt("Enter room name");
    if (!name) return;

    const type = prompt(
      "Enter room type: chat / voice / video / board",
      "chat"
    );

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
      prev.map((server) => {
        if (server.id !== serverId) return server;

        const updatedRooms = server.rooms.filter(
          (room) => room.id !== roomId
        );

        if (updatedRooms.length === 0) return server;

        if (roomId === selectedRoom.id) {
          setSelectedRoom(updatedRooms[0]);
        }

        return { ...server, rooms: updatedRooms };
      })
    );
  }

  // 🔹 ICON BASED ON ROOM TYPE (PROFESSIONAL)
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

  return (
    <aside className="server-sidebar glass">
      {servers.map((server) => (
        <div key={server.id} className="server-block">
          {/* SERVER ICON */}
          <div
            className={`server-name ${
              server.id === selectedServer.id ? "active" : ""
            }`}
            onClick={() => {
              setSelectedServer(server);
              setSelectedRoom(server.rooms[0]);
            }}
            title={server.name}
          >
            {server.name[0].toUpperCase()}
          </div>

          {/* ROOM LIST */}
          {server.id === selectedServer.id && (
            <div className="room-list">
              <div
                className="room-item create-room"
                onClick={() => createRoom(server.id)}
              >
                <Plus size={14} />
                <span>Add Room</span>
              </div>

              {server.rooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-item ${
                    room.id === selectedRoom.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedRoom(room)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    deleteRoom(server.id, room.id);
                  }}
                  title="Right click to delete"
                >
                  <span className="room-icon">
                    {getRoomIcon(room.type)}
                  </span>
                  <span className="room-name">{room.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* CREATE SERVER */}
      <div
        className="server-name create-server"
        onClick={createServer}
        title="Create Server"
      >
        +
      </div>

      {/* STATUS */}
      <div className="sidebar-status">
        🟢 Focus Mode Active
      </div>
    </aside>
  );
}

export default ServerSidebar;
