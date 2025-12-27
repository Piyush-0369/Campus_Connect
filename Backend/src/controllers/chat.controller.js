import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Initiate conversation (or fetch if exists)
const initiateConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user._id;

  let conversation = await Conversation.findOne({
    members: { $all: [senderId, recipientId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [senderId, recipientId],
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, conversation, "Conversation ready"));
});

const getUserConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    members: req.user._id,
  })
    .populate("members", "first_name last_name avatar email role")
    .sort({ updatedAt: -1 });

  const formatted = conversations.map(conv => {
    const otherPerson = conv.members.find(
      member => member._id.toString() !== req.user._id.toString()
    );

    return {
      _id: conv._id,
      user: otherPerson,     // only the person chatting with him
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    };
  });
  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Conversations fetched"));
});

// Get messages for a conversation
const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId }).populate(
    "sender",
    "first_name last_name avatar role"
  ).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched"));
});

export { initiateConversation, getUserConversations, getConversationMessages };
