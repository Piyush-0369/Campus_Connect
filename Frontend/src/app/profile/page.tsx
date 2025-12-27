"use client";

import { useEffect, useState } from "react";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";
import AlumniLayout from "@/components/layouts/AlumniLayout";
import StudentLayout from "@/components/layouts/StudentLayout";

const BASE_URL = "http://localhost:4000/api/v1/baseUsers";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async (redirectToLogin = false) => {
    try {
      await fetchWithRefresh(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Server logout failed, clearing client session anyway", error);
    } finally {
      document.cookie = "accessToken=; Max-Age=0; path=/;";
      document.cookie = "refreshToken=; Max-Age=0; path=/;";
      window.location.href = redirectToLogin ? "/login" : "/";
    }
  };


  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      const response = await fetchWithRefresh(`${BASE_URL}/deleteAccount`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        alert("Your account has been deleted.");
        handleLogout(true);
      } else {
        const err = await response.json().catch(() => null);
        alert("Failed to delete account: " + (err?.message || "Please try again."));
      }
    } catch {
      alert("Error connecting to server.");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithRefresh(`${BASE_URL}/getProfile`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) return handleLogout(true);

        const data = await res.json();
        if (!data.success) return handleLogout(true);

        setUserData(data.data);
      } catch {
        handleLogout(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-peach-200 to-mint-200 flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  // ✅ Now decide which layout to use
  if (!userData) return null;

    // ✅ Admin Profile
if (userData.role === "Admin") {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center relative
        bg-[#0a0a0a] border border-[#1a1a1a] shadow-[0_0_25px_rgba(0,0,255,0.3)]
        backdrop-blur-xl"
      >
        {/* Avatar with neon ring */}
        <div className="flex justify-center mb-6">
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden 
            ring-4 ring-blue-500 shadow-[0_0_20px_rgba(0,120,255,0.6)]"
          >
            <img
              src={userData.avatar || "/placeholder.jpg"}
              alt="Admin avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name + Role */}
        <h1 className="text-3xl font-bold text-blue-400 tracking-wide">
          Welcome, {userData.first_name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-8">
          {/* Logout */}
          <button
            onClick={() => handleLogout(true)}
            className="w-full py-3 rounded-lg text-white font-medium
            bg-gradient-to-r from-blue-600 to-purple-600 
            shadow-[0_0_12px_rgba(0,102,255,0.7)]
            hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}


  // ✅ Student Layout
  if (userData.role === "Student") {
    return (
      <StudentLayout>
        {/* You can pass extra content here if needed */}
        <div className="p-4 text-sm opacity-60 text-center">
          Student Personal Profile Overview
          <button className="btn btn-ghost ml-2" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </StudentLayout>
    );
  }

  // ✅ Alumni Layout
  if (userData.role === "Alumni") {
    return (
      <AlumniLayout>
        <div className="p-4 text-sm opacity-60 text-center">
          Alumni Personal Dashboard
          <button className="btn btn-ghost ml-2" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </AlumniLayout>
    );
  }

  // 🚨 Unknown role fallback
  return <div className="text-center p-10">Unknown role</div>;
}
