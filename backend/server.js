require("dotenv").config();
// Allow fallback to local MongoDB if MONGO_URI is missing (for local dev only)
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/virtual-study-room";
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());

const { JWT_SECRET, MONGO_URI, PORT, AI_SERVICE_URL } = process.env;

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedDefaultRooms();
  })
  .catch((err) => console.error("MongoDB error:", err));

// --------------------
// MODELS
// --------------------
const User = require("./models/users");
const Message = require("./models/Message");
const ServerModel = require("./models/Server");

const sessionSchema = new mongoose.Schema({
  user: String,
  startTime: Number,
  endTime: Number,
  duration: Number,
});
const Session = mongoose.model("Session", sessionSchema);

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: "chat" },
});
const Room = mongoose.model("Room", roomSchema);

// --------------------
// AUTH MIDDLEWARE
// --------------------
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// --------------------
// HTTP + Socket Setup
// --------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins },
});

// --------------------
// AUTH APIs
// --------------------
app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, password: hashedPassword }).save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// FRIENDS & INVITES API
// --------------------
app.get("/api/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      friends: user.friends || [],
      friendRequests: user.friendRequests || [],
      serverInvites: user.serverInvites || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/friends/request", authMiddleware, async (req, res) => {
  try {
    const { targetUsername } = req.body;
    if (targetUsername === req.user.username) return res.status(400).json({ error: "Cannot add yourself" });
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) return res.status(404).json({ error: "User not found" });
    
    const currentUser = await User.findOne({ username: req.user.username });
    if (currentUser.friends.includes(targetUsername)) return res.status(400).json({ error: "Already friends" });
    
    const alreadySent = targetUser.friendRequests.find(r => r.from === req.user.username);
    if (alreadySent) return res.status(400).json({ error: "Request already sent" });
    
    targetUser.friendRequests.push({ from: req.user.username, status: "pending" });
    await targetUser.save();
    res.json({ message: "Friend request sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/friends/accept", authMiddleware, async (req, res) => {
  try {
    const { fromUsername } = req.body;
    const user = await User.findOne({ username: req.user.username });
    const requestIndex = user.friendRequests.findIndex(r => r.from === fromUsername);
    if (requestIndex === -1) return res.status(404).json({ error: "No request found" });
    
    user.friendRequests.splice(requestIndex, 1);
    if (!user.friends.includes(fromUsername)) user.friends.push(fromUsername);
    await user.save();
    
    const sender = await User.findOne({ username: fromUsername });
    if (sender && !sender.friends.includes(req.user.username)) {
      sender.friends.push(req.user.username);
      await sender.save();
    }
    res.json({ message: "Friend added!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/servers/:serverId/invite", authMiddleware, async (req, res) => {
  try {
    const { targetUsername } = req.body;
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ error: "Server not found" });
    
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) return res.status(404).json({ error: "User not found" });
    
    if (server.members.includes(targetUsername)) return res.status(400).json({ error: "User already in server" });
    
    const alreadyInvited = targetUser.serverInvites.find(i => i.serverId === req.params.serverId);
    if (alreadyInvited) return res.status(400).json({ error: "Invite already sent" });
    
    targetUser.serverInvites.push({
      serverId: server._id.toString(),
      serverName: server.name,
      from: req.user.username
    });
    await targetUser.save();
    res.json({ message: "Server invite sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/servers/invites/accept", authMiddleware, async (req, res) => {
  try {
    const { serverId } = req.body;
    const user = await User.findOne({ username: req.user.username });
    
    const inviteIndex = user.serverInvites.findIndex(i => i.serverId === serverId);
    if (inviteIndex === -1) return res.status(404).json({ error: "Invite not found" });
    
    user.serverInvites.splice(inviteIndex, 1);
    await user.save();
    
    const server = await ServerModel.findById(serverId);
    if (server && !server.members.includes(req.user.username)) {
      server.members.push(req.user.username);
      await server.save();
    }
    res.json({ message: "Joined server!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --------------------
// SERVERS API
// --------------------
app.get("/api/servers", authMiddleware, async (req, res) => {
  try {
    const username = req.user.username;
    const servers = await ServerModel.find({
      $or: [
        { ownerId: "system" },
        { ownerId: username },
        { members: username }
      ]
    }).sort({ createdAt: 1 });
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/servers", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Server name required" });
    const username = req.user.username;
    const newServer = await ServerModel.create({
      name,
      ownerId: username,
      members: [username],
      rooms: [
        { name: "general-chat",  type: "chat"  },
        { name: "announcements", type: "chat"  },
        { name: "Lounge",        type: "voice" },
        { name: "Study Room",    type: "video" },
        { name: "Whiteboard",    type: "board" },
      ],
    });
    res.json(newServer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a room to an existing server
app.post("/api/servers/:serverId/rooms", authMiddleware, async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name) return res.status(400).json({ error: "Room name required" });
    const srv = await ServerModel.findById(req.params.serverId);
    if (!srv) return res.status(404).json({ error: "Server not found" });
    srv.rooms.push({ name, type: type || "chat" });
    await srv.save();
    res.json(srv.rooms[srv.rooms.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to server
app.post("/api/servers/:serverId/members", authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });
    const srv = await ServerModel.findById(req.params.serverId);
    if (!srv) return res.status(404).json({ error: "Server not found" });
    
    // check if current user is owner or system
    if (srv.ownerId !== req.user.username && srv.ownerId !== "system") {
      return res.status(403).json({ error: "Only the owner can add members" });
    }
    
    if (!srv.members) srv.members = [];
    if (!srv.members.includes(username)) {
      srv.members.push(username);
      await srv.save();
    }
    res.json({ message: "Member added", server: srv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// ROOMS API (legacy — kept for message routing)
// --------------------
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Room name required" });
    const newRoom = await new Room({ name, type: "chat" }).save();
    res.json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// MESSAGES API
// --------------------
app.get("/api/messages/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/messages/:roomId", async (req, res) => {
  try {
    const message = await new Message({
      roomId: req.params.roomId,
      user: req.body.user,
      text: req.body.text,
      time: req.body.time,
    }).save();

    io.emit("newMessage", { roomId: req.params.roomId, message });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// FOCUS SESSION API
// --------------------
app.post("/api/focus/start", authMiddleware, async (req, res) => {
  try {
    const { user } = req.body;
    const session = await new Session({ user, startTime: Date.now() }).save();
    res.json({ message: "Session started", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/focus/end", authMiddleware, async (req, res) => {
  try {
    const { user } = req.body;
    const session = await Session.findOne({ user, endTime: null });
    if (!session) return res.status(400).json({ error: "No active session" });

    session.endTime = Date.now();
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);
    await session.save();
    res.json({ message: "Session ended", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// AI CHAT ROUTE
// --------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/ai/chat`, { message });
    res.json({ reply: response.data.reply });
  } catch (error) {
    console.error("AI error:", error.message);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

// --------------------
// SEED DEFAULT ROOMS
// --------------------
async function seedDefaultRooms() {
  // Seed default server with rooms
  const existing = await ServerModel.findOne({ name: "Study Room" });
  if (!existing) {
    await ServerModel.create({
      name: "Study Room",
      ownerId: "system",
      rooms: [
        { name: "general-chat",  type: "chat"  },
        { name: "announcements", type: "chat"  },
        { name: "Lounge",        type: "voice" },
        { name: "Study Room", type: "video" },
        { name: "Whiteboard",    type: "board" },
      ],
    });
    console.log("✅ Seeded default Study Room server with Lounge");
  }
}

// --------------------
// ONLINE USERS + WebRTC SIGNALING (Socket.io)
// --------------------
let onlineUsers = 0;

// voiceRooms: { roomId -> Set of socketIds }
const voiceRooms = new Map();
// socketToRoom: { socketId -> roomId }
const socketToRoom = new Map();
// socketToUser: { socketId -> username }
const socketToUser = new Map();

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("userCount", onlineUsers);

  // ── WebRTC: Join a voice room ──────────────────────────
  socket.on("join-voice-room", ({ roomId, username }) => {
    // Leave any existing room first
    const prevRoom = socketToRoom.get(socket.id);
    if (prevRoom) {
      const prevSet = voiceRooms.get(prevRoom);
      if (prevSet) {
        prevSet.delete(socket.id);
        socket.to(prevRoom).emit("voice-peer-left", { peerId: socket.id });
        socket.leave(prevRoom);
      }
    }

    // Join new room
    socket.join(roomId);
    socketToRoom.set(socket.id, roomId);
    socketToUser.set(socket.id, username || "User");

    if (!voiceRooms.has(roomId)) voiceRooms.set(roomId, new Set());
    const roomSet = voiceRooms.get(roomId);

    // Send existing peers to the new user
    const existingPeers = [...roomSet].map((id) => ({
      peerId: id,
      username: socketToUser.get(id) || "User",
    }));
    socket.emit("voice-room-peers", existingPeers);

    // Tell existing peers about the new user
    socket.to(roomId).emit("voice-new-peer", {
      peerId: socket.id,
      username: username || "User",
    });

    roomSet.add(socket.id);
    console.log(`🔊 ${username} joined voice room ${roomId}`);
  });

  // ── WebRTC: Leave voice room ───────────────────────────
  socket.on("leave-voice-room", () => {
    handleLeaveVoice(socket);
  });

  // ── WebRTC: Offer ──────────────────────────────────────
  socket.on("voice-offer", ({ targetId, sdp }) => {
    io.to(targetId).emit("voice-offer", { fromId: socket.id, sdp });
  });

  // ── WebRTC: Answer ─────────────────────────────────────
  socket.on("voice-answer", ({ targetId, sdp }) => {
    io.to(targetId).emit("voice-answer", { fromId: socket.id, sdp });
  });

  // ── WebRTC: ICE Candidate ──────────────────────────────
  socket.on("voice-ice-candidate", ({ targetId, candidate }) => {
    io.to(targetId).emit("voice-ice-candidate", { fromId: socket.id, candidate });
  });

  // ── Shared Activities (Whiteboard, Compiler) ───────────
  socket.on("activity-sync", ({ roomId, type, data }) => {
    socket.to(roomId).emit("activity-sync", { type, data });
  });

  // ── Disconnect ─────────────────────────────────────────
  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("userCount", onlineUsers);
    handleLeaveVoice(socket);
    socketToUser.delete(socket.id);
  });
});

function handleLeaveVoice(socket) {
  const roomId = socketToRoom.get(socket.id);
  if (!roomId) return;
  const roomSet = voiceRooms.get(roomId);
  if (roomSet) {
    roomSet.delete(socket.id);
    socket.to(roomId).emit("voice-peer-left", { peerId: socket.id });
  }
  socket.leave(roomId);
  socketToRoom.delete(socket.id);
}


// --------------------
// START SERVER
// --------------------
server.listen(PORT || 5000, () => {
  console.log(`Server running on http://localhost:${PORT || 5000}`);
});
