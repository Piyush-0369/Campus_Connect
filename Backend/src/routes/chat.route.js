import { Router } from "express";
import {
  initiateConversation,
  getUserConversations,
  getConversationMessages,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { canChat } from "../middlewares/chatAuth.middleware.js";

const router = Router();

// start a conversation (or get existing)
router.post("/initiate", verifyJWT, canChat, initiateConversation);

// get all conversations for logged-in user
router.get("/conversations", verifyJWT, getUserConversations);

// get messages of a conversation
router.get("/messages/:conversationId", verifyJWT, getConversationMessages);

export default router;
