import React, { useState } from "react";
import initialServers from "../data/servers";
import TopNavbar from "./TopNavbar";         // TopNavbar.js -> export default TopNavbar
import ServerSidebar from "./ServerSidebar"; // ServerSidebar.js -> export default ServerSidebar
import RightPanel from "./RightPanel";       // RightPanel.js -> export default RightPanel
import ChatRoom from "../rooms/ChatRoom";    // ChatRoom.js -> export default ChatRoom
import "./layout.css";

function AppLayout() { 
  const [currentView, setCurrentView] = useState("home");
  const [servers, setServers] = useState(initialServers);
 const [selectedServer, setSelectedServer] = useState(initialServers[0] || {});
const [selectedRoom, setSelectedRoom] = useState(
  (initialServers[0]?.rooms?.[0]) || {}
);

  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

return (
  <div className="app-root">
   <TopNavbar
  goHome={() => setCurrentView("home")}
  goFocus={() => setCurrentView("focus")}
  goCompiler={() => setCurrentView("compiler")}
  goProgress={() => setCurrentView("progress")}
/>


    {currentView === "home" ? (
<div className="home-placeholder">
    <h1>Welcome!</h1>
    <p>Click a server to start.</p>
  </div>    ) : (
      <div className="app-body">
        <ServerSidebar
          servers={servers}
          setServers={setServers}
          selectedServer={selectedServer}
          setSelectedServer={setSelectedServer}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
        />

        <main className="main-room">
          <h2 className="gradient-text">
            {selectedServer.name} / {selectedRoom.name}
          </h2>

          <RoomRenderer room={selectedRoom} />
        </main>

        <RightPanel
          isOpen={isRightPanelOpen}
          toggle={() => setIsRightPanelOpen((prev) => !prev)}
        />
      </div>
    )}
  </div>
);

}
function RoomRenderer({ room }) {
  if (!room || !room.type) return <p>Select a room</p>;

  switch (room.type) {
    case "chat":
      return <ChatRoom roomId={room.id || "default"} />;
    case "voice":
      return <p>🎧 Voice Room (coming soon)</p>;
    case "video":
      return <p>🎥 Video Room (coming soon)</p>;
    case "board":
      return <p>🧠 Whiteboard (coming soon)</p>;
    default:
      return <p>Select a room</p>;
  }
}

export default AppLayout;
