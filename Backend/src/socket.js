// socket.js
import { Server } from "socket.io";
import { Message } from "./models/message.model.js";
import { Conversation } from "./models/conversation.model.js";
import jwt from "jsonwebtoken";

const parseCookies = (cookieString = "") =>
  cookieString.split(";").map(c => c.trim()).filter(Boolean).reduce((acc, pair) => {
    const [k, ...v] = pair.split("=");
    acc[k] = decodeURIComponent(v.join("="));
    return acc;
  }, {});

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    try {
      // parse accessToken from handshake cookies
      const cookieHeader = socket.handshake.headers?.cookie || "";
      const cookies = parseCookies(cookieHeader);
      const accessToken = cookies.accessToken;
      if (!accessToken) {
        console.log("Socket connection without accessToken - disconnecting", socket.id);
        socket.disconnect();
        return;
      }
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded._id;
    } catch (err) {
      console.log("Socket auth failed:", err?.message || err);
      socket.disconnect();
      return;
    }

    console.log("Socket connected:", socket.id, "user:", socket.userId);

    socket.on("joinRoom", (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId);
    });

    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        if (!socket.userId) return;
        if (!conversationId || !text) return;

        const message = await Message.create({ conversationId, sender: socket.userId, text });
        // populate sender info for frontend
        const populated = await Message.findById(message._id).populate("sender", "first_name last_name avatar role");

        io.to(conversationId).emit("receiveMessage", populated);

        // update conversation's updatedAt so server-side sorting works
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
      } catch (err) {
        console.error("Error saving/sending message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export { setupSocket };
