"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PublicStudentProfileLayout from "@/components/layouts/PublicStudentProfileLayout";
import PublicAlumniProfileLayout from "@/components/layouts/PublicAlumniProfileLayout";

const API_URL = "http://localhost:4000/api/v1";

export default function PublicProfilePage() {
  const { id } = useParams();                       // ✅ Correct dynamic route access in client component
  const cleanId = decodeURIComponent(id).trim();    // Guaranteed proper ID

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ----------- LOAD PUBLIC USER PROFILE BASIC INFO -----------
  const loadPublicUser = async () => {
    try {
      const res = await fetch(
        `${API_URL}/baseUsers/profile/${cleanId}`,   // ✅ absolute URL so Next doesn't rewrite it
        { credentials: "include" }
      );

      const data = await res.json();
      setUserData(data.success ? data.data : null);
    } catch (error) {
      console.error("Public profile fetch failed:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cleanId) loadPublicUser();                  // 🚫 Avoid undefined fetch, ensures correct ID
  }, [cleanId]);

  // ----------- LOADING UI -----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-peach-200 to-mint-200">
        <div className="text-gray-700 text-lg font-medium animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  // ----------- USER NOT FOUND -----------
  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">User not found</h1>
        <p className="text-gray-500">
          The profile you are trying to view does not exist.
        </p>
      </div>
    );
  }

  // ----------- ROLE BASED PUBLIC VIEW -----------
  if (userData.role === "Student") {
    return <PublicStudentProfileLayout userId={cleanId} />;
  }

  if (userData.role === "Alumni") {
    return <PublicAlumniProfileLayout userId={cleanId} />;
  }

  // ----------- FALLBACK -----------
  return (
    <div className="p-10 text-center">
      Cannot display this profile type.
    </div>
  );
}
