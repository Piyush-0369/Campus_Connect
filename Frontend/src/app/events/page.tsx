"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";
import EventCard from "@/components/EventCard";
import EditEventModal from "./EditEventModal"; // ← IMPORT MODAL

export type Role = "Admin" | "Student" | "Alumni" | null;
export type EventStatus = "Upcoming" | "Completed" | "Cancelled";
export type EventCategory = "Upcoming" | "Past" | "Recommended" | string;

export type EventItem = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  mode?: string;
  organizer?: string;
  speaker?: string;
  tags?: string[];
  banner?: string;
  status?: EventStatus;
  category?: EventCategory;
};

const BASE = "http://localhost:4000/api/v1/baseUsers";
const CATEGORIES: EventCategory[] = ["Upcoming", "Past", "Recommended"];

export default function EventsPage(): JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const [viewing, setViewing] = useState<EventItem | null>(null);
  const [editing, setEditing] = useState<EventItem | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory>("Upcoming");

  useEffect(() => {
    const load = async () => {
      try {
        const profRes = await fetchWithRefresh(`${BASE}/getProfile`, {
          credentials: "include",
        });

        if (profRes.ok) {
          const p = await profRes.json();
          setRole(p?.data?.role ?? null);
        }

        const res = await fetchWithRefresh(`${BASE}/getAllEvents`, {
          credentials: "include",
        });

        const data = await res.json();
        setEvents(data?.data?.events ?? []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Handle updates coming from Edit Modal
  const handleUpdated = (updated: EventItem) => {
    setEvents((prev) =>
      prev.map((ev) => (ev._id === updated._id ? updated : ev))
    );
  };

  // Handle deletion
  const handleDeleted = (deletedId: string) => {
    setEvents((prev) => prev.filter((ev) => ev._id !== deletedId));
  };

  const filtered = useMemo(() => {
    const now = new Date().setHours(0, 0, 0, 0);
    const q = query.toLowerCase();

    return events.filter((e) => {
      const d = new Date(e.date).setHours(0, 0, 0, 0);
      if (categoryFilter === "Upcoming" && d < now) return false;
      if (categoryFilter === "Past" && d >= now) return false;

      return (
        (e.title || "").toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q)
      );
    });
  }, [events, query, categoryFilter]);

  if (loading) return <div className="p-10">Loading events...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 min-h-screen space-y-6 transition-colors
                 bg-[#FAF6EF] text-black
                 dark:bg-gradient-to-br dark:from-[#0a0d24] dark:to-[#1a1440] 
                 dark:text-[#e8e8ff]"
    >
      <header className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Events</h1>

        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-2 rounded-md transition 
                ${
                  categoryFilter === c
                    ? "bg-amber-500 text-black dark:bg-purple-600 dark:text-white"
                    : "border dark:border-white/20"
                }`}
            >
              {c}
            </button>
          ))}

          <input
            className="border rounded-md px-3 py-2 dark:bg-black/20 dark:border-white/20"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((e) => (
            <EventCard
              key={e._id}
              event={e}
              role={role}
              onView={setViewing}
              onEdit={(ev) => {
                setEditing(ev);
              }}
            />
          ))
        ) : (
          <div className="text-center col-span-full text-gray-500">
            No events found.
          </div>
        )}
      </section>

      {/* ---------------- VIEW MODAL ---------------- */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="
                w-full max-w-lg rounded-xl p-6 shadow-xl
                bg-[#FAF6EF] text-[#1a1a1a]
                dark:bg-gradient-to-br dark:from-[#0a0d24] dark:to-[#1a1440]
                dark:text-[#e8e8ff]
                border border-black/10 dark:border-white/10
              "
            >
              <h2 className="text-2xl font-bold mb-3">{viewing.title}</h2>

              {viewing.description && (
                <p className="text-sm opacity-80 mb-4">{viewing.description}</p>
              )}

              <div className="space-y-2 text-sm opacity-90">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(viewing.date).toDateString()}</span>
                </div>

                {viewing.time && (
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{viewing.time}</span>
                  </div>
                )}

                {viewing.location && (
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{viewing.location}</span>
                  </div>
                )}

                {viewing.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {viewing.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-md
                          bg-blue-200 text-blue-800
                          dark:bg-purple-900 dark:text-purple-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setViewing(null)}
                className="mt-6 w-full py-2 rounded-md font-medium
                           bg-amber-400 text-black
                           hover:bg-amber-500
                           dark:bg-purple-600 dark:text-white dark:hover:bg-purple-500"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- EDIT MODAL ---------------- */}
      <EditEventModal
        event={editing}
        onClose={() => setEditing(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </motion.div>
  );
}
