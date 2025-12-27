"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const query = params.get("q") || "";
  const role = params.get("role") || "Student";
  const viaPhoto = params.get("via") === "photo";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------------- LOAD RESULTS ----------------
  useEffect(() => {
    if (viaPhoto) {
      const stored = localStorage.getItem("imgSearchResults");
      if (stored) {
        let list = JSON.parse(stored);

        // 🔥 filter similarity >= 50%
        list = list.filter(
          (u: any) =>
            typeof u.faceSimilarity === "number" &&
            u.faceSimilarity >= 0.5
        );

        setResults(list);
      }
      return;
    }

    if (query.trim()) fetchResults();
  }, [query, role, viaPhoto]);

  // ---------------- TEXT SEARCH ----------------
  const fetchResults = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("role", role);
      form.append("q", query);

      const res = await fetch(
        "http://localhost:4000/api/v1/baseUsers/searchUser",
        {
          method: "POST",
          credentials: "include",
          body: form,
        }
      );

      const data = await res.json();

      setResults(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- START CHAT ----------------
  const startChat = async (user: any) => {
    try {
      const res = await fetchWithRefresh(
        "http://localhost:4000/api/v1/chat/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            recipientId: user._id,
            recipientRole: user.role,
          }),
        }
      );

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Cannot start chat" }));
        throw new Error(err.message || "Cannot start chat");
      }

      const data = await res.json();
      router.push(`/messages?cid=${data.data._id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Cannot start chat");
    }
  };

  // ---------------- VIEW PROFILE ----------------
  const viewProfile = (user: any) => {
    router.push(`/profile/${user._id}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Search Results{" "}
        {viaPhoto ? "(Photo Match)" : query ? `for "${query}"` : ""}
      </h2>

      {loading && <p className="text-gray-500">Searching...</p>}
      {!loading && results.length === 0 && (
        <p>No matching users found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((user) => {
          const secondaryInfo =
            user.department ||
            user.branch ||
            user.course ||
            user.role ||
            "N/A";

          return (
            <div
              key={user._id}
              className="border p-4 rounded-lg bg-[var(--color-card)] shadow-sm hover:shadow-md transition flex flex-col gap-4"
            >
              {/* PROFILE SECTION */}
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  className="w-16 h-16 rounded-full object-cover border"
                  alt="Profile"
                />
                <div>
                  <h3 className="font-semibold">
                    {user.first_name} {user.last_name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {user.role} • {secondaryInfo}
                  </p>

                  <p className="text-xs text-gray-500">
                    Batch {user.batch_year || "N/A"}
                  </p>

                  {/* FACE SIMILARITY (ONLY FOR PHOTO SEARCH) */}
                  {viaPhoto && user.faceSimilarity !== undefined && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">
                        Similarity:{" "}
                        {(user.faceSimilarity * 100).toFixed(1)}%
                      </div>

                      <div className="w-full h-2 bg-gray-300 rounded-lg mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-lg transition-all"
                          style={{
                            width: `${user.faceSimilarity * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => viewProfile(user)}
                  className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 w-full"
                >
                  View Profile
                </button>

                <button
                  onClick={() => startChat(user)}
                  className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 w-full"
                >
                  Chat
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
