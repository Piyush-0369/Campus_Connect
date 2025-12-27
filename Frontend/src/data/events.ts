export type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  time: string;
  image?: string;
  category: "Upcoming" | "Past" | "Recommended";
};

export const events: Event[] = [
  {
    id: "e1",
    title: "AI Club Hackathon",
    description: "Build AI apps in 24 hours with mentors and prizes.",
    date: "2025-11-10",
    time: "10:00",
    image: "/event1.jpg",
    category: "Upcoming",
  },
  {
    id: "e2",
    title: "Alumni Networking Night",
    description: "Meet alumni across tech, finance, and design.",
    date: "2025-11-15",
    time: "18:30",
    image: "/event2.jpg",
    category: "Recommended",
  },
  {
    id: "e3",
    title: "Career Fair 2025",
    description: "Top companies hiring for internships and full-time.",
    date: "2025-10-20",
    time: "09:00",
    image: "/event3.jpg",
    category: "Past",
  },
  {
    id: "e4",
    title: "Design Sprint Workshop",
    description: "Rapid prototyping with alumni designers.",
    date: "2025-12-05",
    time: "14:00",
    image: "/event4.jpg",
    category: "Upcoming",
  },
  {
    id: "e5",
    title: "Data Science Meetup",
    description: "Lightning talks on ML Ops and LLMs.",
    date: "2025-11-20",
    time: "17:30",
    image: "/event5.jpg",
    category: "Recommended",
  },
];
