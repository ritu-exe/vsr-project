import Whiteboard from "../rooms/Whiteboard";
import VoiceRoom from "../rooms/VoiceRoom";
import Home from "../pages/Home";
import Particles from "./Particles";
import AnimatedBackground from "./AnimatedBackground";
import CursorGlow from "./CursorGlow";
import React, { useState, useEffect } from "react";
import { getServers } from "../services/api";
import TopNavbar from "./TopNavbar";
import ServerSidebar from "./ServerSidebar";
import RightPanel from "./RightPanel";
import ChatRoom from "../rooms/ChatRoom";
import "./layout.css";
import Focus from "../pages/Focus";
import Compiler from "../pages/Compiler";
import Progress from "../pages/Progress";
import Friends from "../pages/Friends";

function AppLayout({ children, page, setPage }) {

  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState({});
  const [selectedRoom, setSelectedRoom] = useState({});
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  /* ================= LOAD ROOMS ================= */

  const fetchServers = () => {
    getServers().then((data) => {
      const serverList = Array.isArray(data) ? data : [];
      const formattedServers = serverList.map((srv) => ({
        id: srv._id || srv.id,
        name: srv.name,
        rooms: (srv.rooms || []).map((room) => ({
          id: room._id || room.id,
          name: room.name,
          type: room.type || "chat",
          category: "general",
        })),
        members: srv.members || [],
      }));

      setServers(formattedServers);
      
      setSelectedServer((prevServer) => {
        if (!prevServer || !prevServer.id) {
          const newSrv = formattedServers[0] || {};
          if (newSrv.rooms && newSrv.rooms.length > 0) setSelectedRoom(newSrv.rooms[0]);
          return newSrv;
        }
        return formattedServers.find(s => s.id === prevServer.id) || prevServer;
      });
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 5000);
    return () => clearInterval(interval);
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
        goFriends={() => setPage("friends")}
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
          {page === "friends" && <Friends />}
          {page === "chat" && <RoomRenderer room={selectedRoom} />}

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
  if (!room || !room.type) {
    return <p>Select a room</p>;
  }

  switch (room.type) {
    case "chat":
      return <ChatRoom roomId={room.id} roomName={room.name} />;

    case "voice":
    case "video":
      return <VoiceRoom roomId={room.id} roomName={room.name} />;

    case "board":
      return <Whiteboard />;

    default:
      return <p>Select a room</p>;
  }
}

export default AppLayout;