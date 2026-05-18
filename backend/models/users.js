const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: { type: [String], default: [] },
  friendRequests: [{
    from: String,
    status: { type: String, default: "pending" }
  }],
  serverInvites: [{
    serverId: String,
    serverName: String,
    from: String
  }]
});

module.exports = mongoose.model("User", userSchema);