const [currentView, setCurrentView] = useState("home");

import React, { useState } from "react";
import TopNavbar from "./TopNavbar";
import ServerSidebar from "./ServerSidebar";
import RightPanel from "./RightPanel";
import initialServers from "../data/servers";
import ChatRoom from "../rooms/ChatRoom";
import "./layout.css";
import Home from "../pages/Home";

function AppLayout() { 
  const [servers, setServers] = useState(initialServers);
  const [selectedServer, setSelectedServer] = useState(initialServers[0]);
  const [selectedRoom, setSelectedRoom] = useState(initialServers[0].rooms[0]);
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
      <Home onEnter={() => setCurrentView("workspace")} />
    ) : (
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
  switch (room.type) {
    case "chat":
      return <ChatRoom roomId={room.id} />;
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
