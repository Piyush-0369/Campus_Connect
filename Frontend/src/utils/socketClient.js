// src/utils/socketClient.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      transportOptions: {
        polling: { withCredentials: true },
      },
      autoConnect: true,
    });
  }
  return socket;
};

export const joinRoom = (conversationId) => {
  if (!socket) initSocket();
  socket.emit("joinRoom", conversationId);
};

export const sendSocketMessage = (payload) => {
  if (!socket) initSocket();
  socket.emit("sendMessage", payload); // payload: { conversationId, text }
};

export const onReceiveMessage = (cb) => {
  if (!socket) initSocket();
  socket.off("receiveMessage");
  socket.on("receiveMessage", cb);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
