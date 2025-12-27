export type StudentProfile = {
  id: string;
  name: string;
  role: "student";
  avatar?: string;
  cover?: string;
  bio: string;
  xp: number; // 0..100 scale for demo
  level: number;
  badges: { id: string; label: string; icon?: string }[];
  stats: { events: number; projects: number; connections: number };
  achievements: { id: string; title: string; date: string }[];
  projects: { id: string; title: string; description: string; type: string; date: string }[];
  activity: { id: string; label: string; date: string }[];
};

export type AlumniProfile = {
  id: string;
  name: string;
  role: "alumni";
  verified?: boolean;
  avatar?: string;
  cover?: string;
  career: { company: string; role: string; period: string }[];
  achievements: { id: string; title: string; date: string }[];
  testimonials: { id: string; from: string; text: string }[];
  mentorshipSlots: { id: string; date: string; time: string }[];
};

export const students: StudentProfile[] = [
  {
    id: "1",
    name: "Jordan Lee",
    role: "student",
    avatar: "/avatar.png",
    cover: "/cover.jpg",
    bio: "CS undergrad passionate about AI for social good.",
    xp: 72,
    level: 5,
    badges: [
      { id: "b1", label: "Hackathon Winner" },
      { id: "b2", label: "Top Mentor" },
      { id: "b3", label: "Volunteer" },
    ],
    stats: { events: 18, projects: 6, connections: 120 },
    achievements: [
      { id: "a1", title: "Won AI Hackathon", date: "2025-10-01" },
      { id: "a2", title: "Published on DevPost", date: "2025-09-12" },
    ],
    projects: [
      { id: "p1", title: "Campus Navigator", description: "Wayfinding app with AR.", type: "Mobile", date: "2025-03-10" },
      { id: "p2", title: "StudyBuddy AI", description: "LLM-powered study assistant.", type: "Web", date: "2025-05-20" },
    ],
    activity: [
      { id: "ac1", label: "Attended Alumni Night", date: "2025-10-12" },
      { id: "ac2", label: "RSVP’d AI Hackathon", date: "2025-10-30" },
    ],
  },
  {
    id: "2",
    name: "Riley Chen",
    role: "student",
    avatar: "/avatar.png",
    cover: "/cover.jpg",
    bio: "Design + CS, exploring human-AI interaction.",
    xp: 35,
    level: 3,
    badges: [ { id: "b4", label: "Design Sprint" } ],
    stats: { events: 9, projects: 3, connections: 54 },
    achievements: [ { id: "a3", title: "Spoke at Meetup", date: "2025-08-22" } ],
    projects: [ { id: "p3", title: "Campus Kiosk", description: "Touch UI for info points.", type: "Kiosk", date: "2025-06-01" } ],
    activity: [ { id: "ac3", label: "Published a Figma kit", date: "2025-09-01" } ],
  },
];

export const alumni: AlumniProfile[] = [
  {
    id: "a1",
    name: "Priya Singh",
    role: "alumni",
    verified: true,
    avatar: "/avatar.png",
    cover: "/cover.jpg",
    career: [
      { company: "TechNova", role: "Senior AI Engineer", period: "2022 — Present" },
      { company: "DataWorks", role: "ML Engineer", period: "2020 — 2022" },
    ],
    achievements: [
      { id: "aa1", title: "Filed 2 AI Patents", date: "2024-08-01" },
    ],
    testimonials: [
      { id: "t1", from: "Jordan Lee", text: "Inspiring mentor with practical insights." },
    ],
    mentorshipSlots: [
      { id: "ms1", date: "2025-11-05", time: "17:00" },
      { id: "ms2", date: "2025-11-12", time: "17:00" },
    ],
  },
  {
    id: "a2",
    name: "Miguel Alvarez",
    role: "alumni",
    verified: false,
    avatar: "/avatar.png",
    cover: "/cover.jpg",
    career: [ { company: "CloudCore", role: "Frontend Lead", period: "2021 — Present" } ],
    achievements: [ { id: "aa2", title: "Launched Design System", date: "2025-05-15" } ],
    testimonials: [ { id: "t2", from: "Alex Johnson", text: "Great mentorship on React patterns." } ],
    mentorshipSlots: [ { id: "ms3", date: "2025-11-20", time: "16:00" } ],
  },
];
