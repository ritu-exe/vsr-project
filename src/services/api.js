const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Helper to handle 401 Unauthorized globally
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  }
  return res;
}

export const getRooms = async () => {
  const res = await apiFetch(`${BASE}/api/rooms`);
  return res.json();
};

export const getServers = async () => {
  const res = await apiFetch(`${BASE}/api/servers`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch servers");
  return res.json();
};

export const createServer = async (name) => {
  const username = localStorage.getItem("username") || "system";
  const res = await apiFetch(`${BASE}/api/servers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, ownerId: username }),
  });
  if (!res.ok) throw new Error("Failed to create server");
  return res.json();
};

export const createRoomInServer = async (serverId, name, type = "chat") => {
  const res = await apiFetch(`${BASE}/api/servers/${serverId}/rooms`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) throw new Error("Failed to create room in server");
  return res.json();
};

export const addMemberToServer = async (serverId, username) => {
  const res = await apiFetch(`${BASE}/api/servers/${serverId}/members`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Failed to add member to server");
  return res.json();
};

export const getMessages = async (roomId) => {
  const res = await apiFetch(`${BASE}/api/messages/${roomId}`);
  return res.json();
};

export const sendMessage = async (roomId, message) => {
  const res = await apiFetch(`${BASE}/api/messages/${roomId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(message),
  });
  return res.json();
};

export const signup = async (data) => {
  const res = await apiFetch(`${BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const login = async (data) => {
  const res = await apiFetch(`${BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createRoom = async (name) => {
  const res = await apiFetch(`${BASE}/api/rooms`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
};
