const servers = [
  {
    id: "dev",
    name: "Development",
    rooms: [
      { id: "ann", name: "announcements", type: "chat", category: "pinned" },

      { id: "gen", name: "general-chat", type: "chat", category: "general" },

      { id: "fh", name: "frontend-help", type: "chat", category: "help" },
      { id: "bh", name: "backend-help", type: "chat", category: "help" },

      { id: "fc", name: "frontend-chat", type: "chat", category: "text" },
      { id: "bc", name: "backend-chat", type: "chat", category: "text" },

      { id: "vm", name: "dev-meet", type: "voice", category: "voice" },

      { id: "vs", name: "daily-standup", type: "video", category: "video" },

      { id: "wb", name: "whiteboard", type: "board", category: "board" }
    ]
  }
];

export default servers;
