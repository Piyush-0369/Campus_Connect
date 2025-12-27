"use client";

import { motion } from "framer-motion";
import { Calendar, MessageSquare, User } from "lucide-react";
import Carousel from "@/components/Carousel";
import QuickCard from "@/components/QuickCard";
import AnnouncementCard from "@/components/AnnouncementCard";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="grid lg:grid-cols-3 gap-4">
        {/* ===== LEFT SECTION ===== */}
        <div className="lg:col-span-2 space-y-4">
          {/* Welcome card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="
              card p-6 
              bg-gradient-to-br 
              from-white via-[--color-blue-50] to-[--color-yellow]/20 
              dark:from-[#0a0f1f] dark:via-[--color-blue]/20 dark:to-[--color-purple]/30 
              border border-[--color-border]
              shadow-lg
            "
          >
            <h1 className="text-2xl md:text-3xl font-bold text-balance text-[--color-fg]">
              Welcome back, Jordan!
            </h1>
            <p className="text-sm text-[--color-muted] mt-1">
              Here’s what’s happening across campus this week.
            </p>

            {/* Quick links */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <QuickCard
                icon={<MessageSquare size={18} color="var(--color-blue)" />}
                title="Messages"
                href="/messages"
              />
              <QuickCard
                icon={<Calendar size={18} color="var(--color-yellow)" />}
                title="Events"
                href="/events"
              />
              <QuickCard
                icon={<User size={18} color="var(--color-purple)" />}
                title="Profile"
                href="/profile"
              />
            </div>
          </motion.div>

          {/* Announcement Card */}
          <AnnouncementCard
            title="Alumni Night — RSVP Open"
            description="Join 200+ alumni for mentorship and networking on Nov 15."
            cta={
              <a
                href="/events"
                className="
                  btn btn-gradient 
                  shadow-md 
                  hover:shadow-[0_0_20px_var(--color-blue)] 
                  transition-all
                "
              >
                Explore
              </a>
            }
          />
        </div>

        {/* ===== RIGHT SECTION ===== */}
        <div
          className="
            lg:col-span-1 card p-6
            bg-gradient-to-br 
            from-[--color-blue-50]/60 to-white 
            dark:from-[#0f162a] dark:to-[--color-navy]
            border border-[--color-border]
            shadow-md
          "
        >
          <h3 className="font-semibold text-[--color-fg]">Featured</h3>
          <p className="text-sm text-[--color-muted] mb-3">
            Students, Alumni & Events
          </p>
          <Carousel
            items={[
              {
                id: "1",
                title: "Priya • Alumni (Verified)",
                subtitle: "Mentor — AI Engineering",
              },
              {
                id: "2",
                title: "AI Club Hackathon",
                subtitle: "Nov 10 · 24 hrs",
              },
              {
                id: "3",
                title: "Jordan Lee",
                subtitle: "Level 5 • 72 XP",
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
