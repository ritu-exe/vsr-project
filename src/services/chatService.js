// In-memory message store
const messageStore = {};
const listeners = {};

export function getMessages(roomId) {
  return messageStore[roomId] || [];
}

export function sendMessage(roomId, message) {
  if (!messageStore[roomId]) {
    messageStore[roomId] = [];
  }

  messageStore[roomId].push(message);

  // notify listeners (simulate realtime)
  if (listeners[roomId]) {
    listeners[roomId].forEach((cb) => cb(message));
  }
}

export function subscribeToMessages(roomId, callback) {
  if (!listeners[roomId]) {
    listeners[roomId] = [];
  }

  listeners[roomId].push(callback);

  // cleanup (important for React)
  return () => {
    listeners[roomId] = listeners[roomId].filter(
      (cb) => cb !== callback
    );
  };
}
