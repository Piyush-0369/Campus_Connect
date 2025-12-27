export type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  lastMessage: string;
  messages: { id: string; from: "me" | "them"; text: string; time: string }[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Alex Johnson",
    avatar: "/avatar.png",
    online: true,
    lastMessage: "See you at the hackathon!",
    messages: [
      { id: "m1", from: "them", text: "Hey!", time: "09:15" },
      { id: "m2", from: "me", text: "Hello Alex, ready for the event?", time: "09:16" },
      { id: "m3", from: "them", text: "See you at the hackathon!", time: "09:18" },
    ],
  },
  {
    id: "c2",
    name: "AI Club",
    avatar: "/avatar.png",
    online: false,
    lastMessage: "RSVP closes tomorrow.",
    messages: [
      { id: "m1", from: "them", text: "Don’t forget to RSVP!", time: "08:00" },
      { id: "m2", from: "me", text: "On it!", time: "08:02" },
    ],
  },
  {
    id: "c3",
    name: "Events Bot",
    avatar: "/avatar.png",
    online: true,
    lastMessage: "New event: Design Sprint",
    messages: [
      { id: "m1", from: "them", text: "New event posted: Design Sprint", time: "07:05" },
      { id: "m2", from: "me", text: "Thanks!", time: "07:06" },
    ],
  },
];
