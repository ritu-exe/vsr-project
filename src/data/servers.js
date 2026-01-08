const servers = [
  {
    id: "server-1",
    name: "DSA Study Group",
    rooms: [
      { id: "room-1", name: "general-chat", type: "chat" },
      { id: "room-2", name: "voice-room", type: "voice" },
      { id: "room-3", name: "video-room", type: "video" },
      { id: "room-4", name: "whiteboard", type: "board" },
    ],
  },
  {
    id: "server-2",
    name: "Web Dev",
    rooms: [
      { id: "room-5", name: "frontend-chat", type: "chat" },
      { id: "room-6", name: "backend-chat", type: "chat" },
      { id: "room-7", name: "dev-meet", type: "voice" },
    ],
  },
];

export default servers;
