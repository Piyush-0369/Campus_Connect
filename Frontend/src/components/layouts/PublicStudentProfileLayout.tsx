"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useModal } from "@/components/providers/useModal";
import Timeline from "@/components/timeline";

const API_URL = "http://localhost:4000/api/v1";

export default function PublicStudentProfileLayout({ userId }: { userId: string }) {
  const cleanId = decodeURIComponent(userId).trim();
  const { openModal } = useModal();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD STUDENT PROFILE ----------------
  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/baseUsers/profile/${cleanId}`);
      const data = await res.json();

      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.warn("Failed to load public student profile", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadProfile();
      setLoading(false);
    };
    init();
  }, [cleanId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <div className="p-10 text-center">User not found</div>;

  const fullName = `${user.first_name} ${user.middle_name || ""} ${user.last_name}`.trim();

  // Extract nested lists
  const achievements = user.achievements || [];
  const experiences = user.experience || [];
  const projects = user.projects || [];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 fade-in">

      {/* HEADER */}
      <div className="card p-8 rounded-2xl border border-[--color-border] bg-[--color-bg] shadow-sm">
        <div className="flex items-start gap-6">

          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[--color-blue]/40">
            <Image
              src={user.avatar || "/placeholder.jpg"}
              alt={fullName}
              width={160}
              height={160}
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-semibold">{fullName}</h1>

                <p className="text-[--color-muted]">{user.department || "Student"}</p>

                <p className="text-sm text-[--color-muted] mt-1">
                  {user.degree?.toUpperCase()} • Batch {user.batch_year}
                </p>
              </div>

              {/* PUBLIC VIEW BUTTONS */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    openModal("project", {
                      projects,
                      readOnly: true,   // ❗ Disable edit buttons
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Projects
                </button>

                <button
                  onClick={() =>
                    openModal("achievement", {
                      achievements,
                      readOnly: true,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white"
                >
                  Achievements
                </button>

                <button
                  onClick={() =>
                    openModal("experience", {
                      experiences,
                      readOnly: true,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                >
                  Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <Timeline
        projects={projects.map((p: any) => ({
          title: p.title,
          start_date: p.start_date || p.startDate,
        }))}
        achievements={achievements.map((a: any) => ({
          title: a.title,
          start_date: a.date,
        }))}
        experiences={experiences.map((e: any) => ({
          title: e.title,
          start_date: e.start_date,
        }))}
      />
    </div>
  );
}
