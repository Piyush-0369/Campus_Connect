"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";
import { useModal } from "@/components/providers/useModal";
import Timeline from "@/components/timeline";

const BASE_URL = "http://localhost:4000/api/v1";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { openModal } = useModal();

  const [student, setStudent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);

  // ---------------------------------------------
  // LOGOUT
  // ---------------------------------------------
  const logout = async () => {
    try {
      await fetchWithRefresh(`${BASE_URL}/baseUsers/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    document.cookie = "accessToken=; Max-Age=0; path=/;";
    document.cookie = "refreshToken=; Max-Age=0; path=/;";
    router.replace("/login");
  };

  // ---------------------------------------------
  // REFRESH STATS (called after CRUD actions)
  // ---------------------------------------------
  const refreshStats = async () => {
    try {
      const res = await fetchWithRefresh(`${BASE_URL}/stats/evaluateProfile`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (data?.success) {
        const newStats = data.data.stats;

        // update student.local stats
        setStats(newStats);
        setStudent((prev: any) => ({
          ...prev,
          stats: newStats,
          level: data.data.level ?? prev.level,
          xp: data.data.xp ?? prev.xp,
          nextLevelXP: data.data.nextLevelXP ?? prev.nextLevelXP,
        }));
      }
    } catch (err) {
      console.warn("stats refresh failed", err);
    }
  };

  // ---------------------------------------------
  // PROFILE UPDATE
  // ---------------------------------------------
  const updateProfile = async (payload: any) => {
    const formData = new FormData();

    for (const key in payload) {
      if (key === "avatarFile" && payload.avatarFile) {
        formData.append("avatar", payload.avatarFile);
      } else {
        formData.append(key, payload[key]);
      }
    }

    const res = await fetchWithRefresh(`${BASE_URL}/students/updateProfile`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Profile update failed");

    setStudent(data.data);
    return data;
  };

  // ---------------------------------------------
  // LOADERS
  // ---------------------------------------------
  const loadProjects = async () => {
    try {
      const res = await fetchWithRefresh(`${BASE_URL}/students/getProjects`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch {}
  };

  const loadAchievements = async () => {
    try {
      const res = await fetchWithRefresh(`${BASE_URL}/students/getAchievements`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setAchievements(data.data);
    } catch {}
  };

  const loadExperiences = async () => {
    try {
      const res = await fetchWithRefresh(`${BASE_URL}/students/getExperience`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setExperiences(data.data);
    } catch {}
  };

  // ---------------------------------------------
  // INITIAL FETCH
  // ---------------------------------------------
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetchWithRefresh(`${BASE_URL}/baseUsers/getProfile`, { credentials: "include" });
        if (!res.ok) return logout();

        const data = await res.json();
        if (!data.success) return logout();

        setStudent(data.data);
        setStats(data.data.stats);

        await loadProjects();
        await loadAchievements();
        await loadExperiences();
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!student || !stats) return null;

  // ---------------------------------------------
  // CONSTRUCT STATS BREAKDOWN MANUALLY
  // ---------------------------------------------
  const statsBreakdown = [
    { name: "Technical Mastery", value: stats.technicalMastery },
    { name: "Project Power", value: stats.projectPower },
    { name: "Collaboration", value: stats.collaboration },
    { name: "Innovation & Creativity", value: stats.innovationCreativity },
    { name: "Problem Solving", value: stats.problemSolving },
    { name: "Academic Endurance", value: stats.academicEndurance },
    { name: "Leadership", value: stats.leadership },
    { name: "Extracurricular", value: stats.extracurricular },
  ];

  const fullName = `${student.first_name} ${student.middle_name || ""} ${student.last_name}`.trim();

  const nextXP = student.nextLevelXP || 1000;

  // ---------------------------------------------
  // CRUD WRAPPERS (all call refreshStats)
  // ---------------------------------------------
  const addExperience = async (payload: any) => {
    const res = await fetchWithRefresh(`${BASE_URL}/students/addExperience`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    await loadExperiences();
    await refreshStats();
    return data;
  };

  const updateExperience = async (id: string, payload: any) => {
    const res = await fetchWithRefresh(`${BASE_URL}/students/updateExperience/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    await loadExperiences();
    await refreshStats();
    return data;
  };

  const deleteExperience = async (id: string) => {
    const res = await fetchWithRefresh(`${BASE_URL}/students/deleteExperience/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    await loadExperiences();
    await refreshStats();
    return data;
  };

  const addProject = async (p: any) => {
    await fetchWithRefresh(`${BASE_URL}/students/addProject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    await loadProjects();
    await refreshStats();
  };

  const updateProject = async (id: string, p: any) => {
    await fetchWithRefresh(`${BASE_URL}/students/updateProject/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    await loadProjects();
    await refreshStats();
  };

  const deleteProject = async (id: string) => {
    await fetchWithRefresh(`${BASE_URL}/students/deleteProject/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadProjects();
    await refreshStats();
  };

  const addAchievement = async (a: any) => {
    await fetchWithRefresh(`${BASE_URL}/students/addAchievement`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
    });
    await loadAchievements();
    await refreshStats();
  };

  const updateAchievement = async (id: string, a: any) => {
    await fetchWithRefresh(`${BASE_URL}/students/updateAchievement/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
    });
    await loadAchievements();
    await refreshStats();
  };

  const deleteAchievement = async (id: string) => {
    await fetchWithRefresh(`${BASE_URL}/students/deleteAchievement/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadAchievements();
    await refreshStats();
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 fade-in">

      {/* HEADER */}
      <div className="card p-8 rounded-2xl border border-[--color-border] bg-[--color-bg] dark:bg-[--color-navy] shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[--color-blue]/40">
            <Image src={student.avatar || "/placeholder.jpg"} alt={fullName} width={160} height={160} className="object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-semibold">{fullName}</h1>
                <p className="text-[--color-muted]">{student.department || "Student"}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    openModal("project", {
                      projects,
                      onAdd: addProject,
                      onUpdate: updateProject,
                      onDelete: deleteProject,
                      refresh: loadProjects,
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
                      onAdd: addAchievement,
                      onUpdate: updateAchievement,
                      onDelete: deleteAchievement,
                      refresh: loadAchievements,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white"
                >
                  Achievements
                </button>
              </div>
            </div>

            {/* XP BAR */}
            <div className="mt-6">
              <div className="text-sm">Level {student.level}</div>

              <div className="w-full h-4 rounded-lg border border-[--color-border] bg-[--color-blue-50]/30 overflow-hidden shadow-inner mt-1">
                <div
                  className="h-full rounded-lg transition-all"
                  style={{
                    width: `${(student.xp / nextXP) * 100}%`,
                    background: "linear-gradient(90deg, var(--color-blue), var(--color-purple))",
                  }}
                />
              </div>

              <div className="text-xs mt-1">{student.xp} / {nextXP} XP</div>
            </div>

            <div className="flex gap-3 items-center">
              <button
                onClick={logout}
                className="mt-6 text-sm px-4 py-2 border border-red-400 text-red-600 rounded-lg"
              >
                Logout
              </button>

              <button
                onClick={() =>
                  openModal("studentEditProfile", {
                    student,
                    onUpdate: updateProfile,
                  })
                }
                className="mt-6 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS & EXPERIENCE */}
      <div className="grid grid-cols-12 gap-10">

        {/* Stats Breakdown */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {statsBreakdown.map((s: any) => (
            <div key={s.name} className="flex items-center gap-4">
              <div className="w-48 text-sm">{s.name}</div>

              <div className="flex-1 h-4 rounded-lg border border-[--color-border] bg-[--color-blue-50]/20 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-lg"
                  style={{
                    width: `${s.value}%`,
                    background: "linear-gradient(90deg, var(--color-blue), var(--color-purple))",
                  }}
                />
              </div>

              <div className="w-12 text-sm text-right">{s.value}%</div>
            </div>
          ))}
        </div>

        {/* Experience */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <h3 className="font-semibold text-[--color-fg] text-lg mb-2">Recent Experience</h3>

          {experiences.length === 0 && (
            <p className="text-[--color-muted] text-sm italic">No experiences added yet.</p>
          )}

          {experiences.slice().reverse().slice(0, 3).map((exp: any) => (
            <div key={exp._id} className="p-4 rounded-xl border border-[--color-border] bg-[--color-card] shadow-sm">
              <h4 className="font-semibold">{exp.title}</h4>
              <p className="text-sm text-[--color-muted]">{exp.company}</p>
              <p className="text-xs text-[--color-muted] mt-1">
                {new Date(exp.start_date).toLocaleDateString()} →{" "}
                {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : "Present"}
              </p>
            </div>
          ))}

          <button
            onClick={() =>
              openModal("experience", {
                experiences,
                onAdd: addExperience,
                onUpdate: updateExperience,
                onDelete: deleteExperience,
                refresh: loadExperiences,
              })
            }
            className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white w-full"
          >
            Manage Experience
          </button>
        </div>
      </div>

      {/* TIMELINE */}
      <Timeline
        projects={projects.map((p) => ({ title: p.title, start_date: p.startDate }))}
        achievements={achievements.map((a) => ({ title: a.title, start_date: a.date }))}
        experiences={experiences.map((e) => ({ title: e.title, start_date: e.start_date }))}
      />

      {children}
    </div>
  );
}
