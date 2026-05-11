import { FiFileText } from "react-icons/fi";
import Whiteboard from "../rooms/Whiteboard";
import Home from "../pages/Home";
import Particles from "./Particles";
import AnimatedBackground from "./AnimatedBackground";
import CursorGlow from "./CursorGlow";
import React, { useState, useEffect } from "react";
import { getRooms } from "../services/api";
import TopNavbar from "./TopNavbar";
import ServerSidebar from "./ServerSidebar";
import RightPanel from "./RightPanel";
import ChatRoom from "../rooms/ChatRoom";
import "./layout.css";
import Focus from "../pages/Focus";
import Compiler from "../pages/Compiler";
import Progress from "../pages/Progress";

function AppLayout({ children, page, setPage }) {

  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState({});
  const [selectedRoom, setSelectedRoom] = useState({});
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  /* ================= LOAD ROOMS ================= */

  useEffect(() => {
    getRooms().then((data) => {
      const formattedServers = [
        {
          id: "backend",
          name: "Study Room",
          rooms: data.map((room) => ({
            id: room.id,
            name: room.name,
            type: room.type || "chat",
            category: "general",
          })),
        },
      ];

      setServers(formattedServers);
      setSelectedServer(formattedServers[0]);

      if (formattedServers[0].rooms.length > 0) {
        setSelectedRoom(formattedServers[0].rooms[0]);
      }
    });
  }, []);

  return (
    <div className="app-root">
      <CursorGlow />
      <Particles />
      <AnimatedBackground />

      {/* TOP NAV */}
      <TopNavbar
        goHome={() => setPage("home")}
        goFocus={() => setPage("focus")}
        goCompiler={() => setPage("compiler")}
        goProgress={() => setPage("progress")}
        currentPage={page}
      />

      <div className="app-body">

        {/* LEFT SIDEBAR */}
        <ServerSidebar
          servers={servers}
          setServers={setServers}
          selectedServer={selectedServer}
          setSelectedServer={setSelectedServer}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          setPage={setPage}   // ✅ correct
        />

        {/* CENTER */}
        <main className="main-room">

          {page === "home" && <Home setPage={setPage} />}

          {page === "focus" && <Focus />}

          {page === "compiler" && (
            <div className="compiler-wrapper">
              <Compiler />
            </div>
          )}

        

{page === "progress" && <Progress />}
          {page === "chat" && (
            <>
              <h2 className="whiteboard-title">
                <FiFileText className="wb-heading-icon" />
                Chat Room
              </h2>

              <RoomRenderer room={selectedRoom} />
            </>
          )}

          {/* ✅ OPTIONAL: direct whiteboard page */}
          {page === "whiteboard" && <Whiteboard />}

        </main>

        {/* RIGHT PANEL */}
        <RightPanel
          isOpen={isRightPanelOpen}
          toggle={() => setIsRightPanelOpen((prev) => !prev)}
        />

      </div>
    </div>
  );
}

/* ================= ROOM RENDERER ================= */

function RoomRenderer({ room }) {
  console.log("RENDERING ROOM:", room);

  if (!room || !room.type) {
    return <p>Select a room</p>;
  }

  switch (room.type) {
    case "chat":
      return <ChatRoom roomId={room.id} />;

    case "voice":
      return <p>🎧 Voice Room (coming soon)</p>;

    case "video":
      return <p>🎥 Video Room (coming soon)</p>;

    case "board":
      return <Whiteboard />;

    default:
      return <p>Select a room</p>;
  }
}

export default AppLayout;