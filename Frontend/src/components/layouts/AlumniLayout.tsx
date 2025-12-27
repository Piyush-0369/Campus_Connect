"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";
import { useModal } from "@/components/providers/useModal";
import Timeline from "@/components/timeline";

const BASE_URL = "http://localhost:4000/api/v1";

interface Props {
  children?: React.ReactNode;
  visitorMode?: boolean;         
  userOverride?: any;            
}

export default function AlumniLayout({
  children,
  visitorMode = false,
  userOverride = null
}: Props) {
  const router = useRouter();
  const { openModal } = useModal();

  const [alum, setAlum] = useState<any>(userOverride || null);
  const [loading, setLoading] = useState(!userOverride);
  const [experiences, setExperiences] = useState<any[]>([]);

  // ------------ LOAD EXPERIENCE (by ID) ------------
  const loadExperiences = async (uid: string) => {
    try {
      const res = await fetchWithRefresh(
        `${BASE_URL}/alumni/getExperienceById/${uid}`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (data.success) setExperiences(data.data || []);
      else setExperiences([]);
    } catch {
      setExperiences([]);
    }
  };

  // ------------ LOGOUT (disabled for visitors) ------------
  const logout = async () => {
    if (visitorMode) return;

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

  // ------------ UPDATE PROFILE (disabled for visitors) ------------
  const updateProfile = async (payload: any) => {
    if (visitorMode) return;

    const isFormData = payload instanceof FormData;

    const res = await fetchWithRefresh(`${BASE_URL}/alumni/updateProfile`, {
      method: "PATCH",
      credentials: "include",
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Profile update failed");

    setAlum(data.data);
    return data;
  };

  // ------------ INITIAL LOAD ------------
  useEffect(() => {
    // If someone else's profile is already provided → just load their experience
    if (userOverride) {
      loadExperiences(userOverride._id);
      return;
    }

    // Load logged-in alumni profile
    const load = async () => {
      try {
        const res = await fetchWithRefresh(`${BASE_URL}/baseUsers/getProfile`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!data.success) return router.replace("/login");

        setAlum(data.data);
        await loadExperiences(data.data._id);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ------------ CRUD (disabled for visitors) ------------
  const addExperience = async (payload: any) => {
    if (visitorMode) return;

    const res = await fetchWithRefresh(`${BASE_URL}/alumni/addExperience`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    await loadExperiences(alum._id);
    return data;
  };

  const updateExperience = async (id: string, payload: any) => {
    if (visitorMode) return;

    const res = await fetchWithRefresh(`${BASE_URL}/alumni/updateExperience/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    await loadExperiences(alum._id);
    return data;
  };

  const deleteExperience = async (id: string) => {
    if (visitorMode) return;

    const res = await fetchWithRefresh(`${BASE_URL}/alumni/deleteExperience/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    await loadExperiences(alum._id);
    return data;
  };

  // ------------ LOADING ------------
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!alum) return null;

  const fullName = `${alum.first_name} ${alum.middle_name || ""} ${alum.last_name}`.trim();

  // ------------ UI ------------
  return (
    <div className="space-y-8 p-8 max-w-5xl mx-auto transition-all duration-300">

      {/* --- HEADER --- */}
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
          </div>

          {/* ---- BUTTONS (HIDE in visitorMode) ---- */}
          {!visitorMode && (
            <div className="flex gap-2">
              <button
                onClick={() => openModal("alumniEditProfile", { alum, onUpdate: updateProfile })}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white"
              >
                Edit Profile
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-red-400 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="rounded-2xl p-6 border-2 border-[--color-purple] bg-[--color-bg] shadow-sm">

        {/* TIMELINE */}
        <Timeline projects={[]} achievements={[]} experiences={experiences} />

        {/* CRUD BUTTON hidden for visitor */}
        {!visitorMode && (
          <button
            onClick={() =>
              openModal("experience", {
                experiences,
                onAdd: addExperience,
                onUpdate: updateExperience,
                onDelete: deleteExperience,
                refresh: () => loadExperiences(alum._id),
              })
            }
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white w-full"
          >
            Manage Experience
          </button>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
