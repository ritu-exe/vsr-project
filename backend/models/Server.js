const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, default: "system" },
  rooms: [
    {
      name: { type: String, required: true },
      type: { type: String, default: "chat" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Server", serverSchema);
