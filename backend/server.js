require("dotenv").config();
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
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB error:", err));

// --------------------
// MODELS
// --------------------
const User = require("./models/users");
const Message = require("./models/Message");

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
// ROOMS API
// --------------------
app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    if (rooms.length === 0) {
      // seed default rooms on first run
      const defaults = await Room.insertMany([
        { name: "General Chat", type: "chat" },
        { name: "Frontend Help", type: "chat" },
      ]);
      return res.json(defaults);
    }
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rooms", authMiddleware, async (req, res) => {
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
    const messages = await Message.find({ roomId: req.params.roomId }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/messages/:roomId", authMiddleware, async (req, res) => {
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
// ONLINE USERS (Socket.io)
// --------------------
let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("userCount", onlineUsers);

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("userCount", onlineUsers);
  });
});

// --------------------
// START SERVER
// --------------------
server.listen(PORT || 5000, () => {
  console.log(`Server running on http://localhost:${PORT || 5000}`);
});
