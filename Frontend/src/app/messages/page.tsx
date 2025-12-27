"use client";

import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import {
  initSocket,
  joinRoom,
  sendSocketMessage,
  onReceiveMessage,
  disconnectSocket,
} from "@/utils/socketClient";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);

  const endRef = useRef<HTMLDivElement | null>(null);

  // Get current user from localStorage
  const me =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "{}")
      : {};

  // Scroll to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 1️⃣ Load conversations from backend
  useEffect(() => {
    const loadConvs = async () => {
      setLoadingConvs(true);
      try {
        const res = await fetchWithRefresh(
          "http://localhost:4000/api/v1/chat/conversations",
          { credentials: "include" }
        );
        const data = await res.json();
        if (Array.isArray(data.data)) {
          setConversations(data.data);
          if (data.data.length) setActiveConv(data.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConvs(false);
      }
    };
    loadConvs();
  }, []);

  // 2️⃣ Join socket room & fetch messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    const convId = activeConv._id;
    joinRoom(convId);

    const fetchMsgs = async () => {
      try {
        const res = await fetchWithRefresh(
          `http://localhost:4000/api/v1/chat/messages/${convId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setMessages(Array.isArray(data.data) ? data.data.reverse() : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMsgs();
  }, [activeConv]);

  // 3️⃣ Handle real-time incoming messages
  useEffect(() => {
    initSocket();
    onReceiveMessage((msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    });
    return () => disconnectSocket();
  }, []);

  // Send a message
  const send = () => {
    if (!text.trim() || !activeConv) return;
    sendSocketMessage({
      conversationId: activeConv._id,
      text: text.trim(),
    });
    setText("");
  };

  // Get the user object of the conversation
  const getOtherUser = (conv: any) => conv.user || null;

  const other = activeConv ? getOtherUser(activeConv) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-6rem)]">
      {/* SIDEBAR */}
      <aside className="card p-4 overflow-y-auto">
        <h3 className="font-semibold mb-2">Conversations</h3>
        <div className="grid gap-2">
          {loadingConvs ? (
            <div className="text-[--color-muted]">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-[--color-muted]">No conversations</div>
          ) : (
            conversations.map((c) => {
              const user = getOtherUser(c);
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveConv(c)}
                  className={`text-left rounded-xl px-3 py-2 border ${
                    activeConv?._id === c._id
                      ? "border-[--color-blue] bg-[--color-blue-50]"
                      : "border-[--color-border] hover:bg-[--color-blue-50]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || "/default-avatar.png"}
                      className="h-8 w-8 rounded-full object-cover"
                      alt="Avatar"
                    />
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {user ? `${user.first_name} ${user.last_name}` : "Unknown"}
                      </p>
                      <p className="text-xs text-[--color-muted] truncate">
                        {c.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN CHAT SECTION */}
      <section className="md:col-span-2 card flex flex-col h-full overflow-hidden">
        {!activeConv ? (
          <div className="flex items-center justify-center flex-1 text-[--color-muted]">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-[--color-border] p-4">
              <p className="font-semibold">
                {other ? `${other.first_name} ${other.last_name}` : "Conversation"}
              </p>
              <p className="text-xs text-[--color-muted]">{other?.role}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m) => {
                const senderId =
                  typeof m.sender === "string" ? m.sender : m.sender?._id;
                const isMe = String(senderId) === String(me._id);

                return (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                      isMe
                        ? "ml-auto bg-[--color-blue] text-white"
                        : "mr-auto bg-[--color-blue-50]"
                    }`}
                  >
                    <p className="text-sm">{m.text}</p>
                    <p className="text-[10px] opacity-75 mt-1 text-right">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </motion.div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 p-3 border-t border-[--color-border]"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 rounded-xl bg-transparent border border-[--color-border] px-3 py-2 outline-none"
              />
              <button type="submit" className="btn btn-primary flex gap-2">
                <Send size={16} /> Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
