"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import Timeline from "@/components/timeline";

const API_URL = "http://localhost:4000/api/v1";

export default function PublicAlumniProfileLayout({ userId }: { userId: string }) {
  const cleanId = decodeURIComponent(userId).trim();  // ✅ Clean ID once

  const [alum, setAlum] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH HELPERS ----------------

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/baseUsers/profile/${cleanId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setAlum(data.data);
    } catch (err) {
      console.warn("Failed to load alumni profile:", err);
    }
  };

  const loadExperiences = async () => {
    try {
      const res = await fetch(`${API_URL}/alumni/getExperienceById/${cleanId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setExperiences(data.data || []);
    } catch {}
  };

  const loadProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/alumni/getProjects/public/${cleanId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setProjects(data.data || []);
    } catch {}
  };

  const loadAchievements = async () => {
    try {
      const res = await fetch(`${API_URL}/alumni/getAchievements/public/${cleanId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setAchievements(data.data || []);
    } catch {}
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    const init = async () => {
      if (!cleanId) return;

      await Promise.all([
        loadProfile(),
        loadExperiences(),
        loadProjects(),
        loadAchievements(),
      ]);

      setLoading(false);
    };

    init();
  }, [cleanId]);

  // ---------------- UI STATES ----------------

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!alum) return null;

  const fullName = `${alum.first_name} ${alum.middle_name || ""} ${alum.last_name}`.trim();

  // ---------------- UI ----------------

  return (
    <div className="space-y-8 p-8 max-w-5xl mx-auto transition-all duration-300">

      {/* HEADER */}
      <header className="rounded-2xl border border-[--color-border]/40 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[--color-blue] via-[--color-purple] to-[--color-yellow]" />

        <div className="p-6 -mt-14 flex items-end gap-5">
          <div className="h-24 w-24 rounded-2xl ring-4 ring-white shadow-md overflow-hidden">
            <Image
              src={alum.avatar || "/placeholder.jpg"}
              width={96}
              height={96}
              className="object-cover"
              alt={fullName}
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {fullName}
              <BadgeCheck className="text-[--color-blue]" />
            </h1>

            <p className="text-sm text-[--color-muted]">
              Alumni • Batch {alum.batch_year}
            </p>

            {alum.department && (
              <p className="text-sm text-[--color-muted]">
                {alum.degree?.toUpperCase()} — {alum.department}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CARD */}
      <div className="rounded-2xl p-6 border-2 border-[--color-purple] bg-[--color-bg] shadow-sm">

        {/* TIMELINE */}
        <Timeline
          projects={projects.map((p) => ({
            title: p.title,
            start_date: p.startDate,
          }))}
          achievements={achievements.map((a) => ({
            title: a.title,
            start_date: a.date,
          }))}
          experiences={experiences.map((e) => ({
            title: e.title,
            start_date: e.start_date,
          }))}
        />

        {/* RECENT EXPERIENCE */}
        <div className="mt-8 space-y-3">
          <h3 className="font-semibold text-lg">Recent Experience</h3>

          {experiences.length === 0 && (
            <p className="text-sm text-[--color-muted] italic">No experience added yet.</p>
          )}

          {experiences
            .slice()
            .reverse()
            .slice(0, 3)
            .map((exp) => (
              <div
                key={exp._id}
                className="p-4 rounded-xl border border-[--color-border] bg-[--color-card] shadow-sm"
              >
                <h4 className="font-semibold">{exp.title}</h4>
                <p className="text-sm text-[--color-muted]">{exp.company}</p>
                <p className="text-xs text-[--color-muted] mt-1">
                  {new Date(exp.start_date).toLocaleDateString()} →{" "}
                  {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : "Present"}
                </p>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}
