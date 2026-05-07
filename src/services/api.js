const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const getRooms = async () => {
  const res = await fetch(`${BASE}/api/rooms`);
  return res.json();
};

export const getMessages = async (roomId) => {
  const res = await fetch(`${BASE}/api/messages/${roomId}`);
  return res.json();
};

export const sendMessage = async (roomId, message) => {
  const res = await fetch(`${BASE}/api/messages/${roomId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(message),
  });
  return res.json();
};

export const signup = async (data) => {
  const res = await fetch(`${BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const login = async (data) => {
  const res = await fetch(`${BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createRoom = async (name) => {
  const res = await fetch(`${BASE}/api/rooms`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
};
