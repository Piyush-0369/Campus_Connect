"use client";
import { motion } from "framer-motion";
import React from "react";
import { EventItem } from "@/app/events/page";

export default function EventCard({
  event,
  role,
  onView,
  onEdit,
}: {
  event: EventItem;
  role: "Admin" | "Student" | "Alumni" | null;
  onView: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
}) {
  return (
    <motion.article
      whileHover={{ y: -3, scale: 1.01 }}
      className="card overflow-hidden border rounded-xl shadow-sm bg-white dark:bg-neutral-900"
    >
      <div className="relative h-36 w-full">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute left-3 top-3 text-xs px-2 py-1 rounded-full bg-white/90 dark:bg-black/60 text-black dark:text-white">
          {event.category}
        </span>
      </div>

      <div className="p-4 flex flex-col space-y-2 h-48">
        <h3 className="font-semibold text-lg">{event.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {event.description}
        </p>

        <div className="mt-auto text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>{new Date(event.date).toDateString()}</span>
            <span>{event.time}</span>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onView(event)}
              className="w-1/2 px-3 py-2 bg-amber-400 text-black rounded-md"
            >
              View
            </button>

            {role === "Admin" ? (
              <button
                onClick={() => onEdit(event)}
                className="w-1/2 px-3 py-2 bg-blue-600 text-white rounded-md"
              >
                Edit
              </button>
            ) : (
              <button className="w-1/2 px-3 py-2 border rounded-md">
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
