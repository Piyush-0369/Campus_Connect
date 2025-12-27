"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";

/* ----------------------- THEME COLORS ----------------------- */

const COLORS = {
  light: {
    bg: "bg-gradient-to-br from-orange-100 via-orange-50 to-white",
    card: "bg-white/80",
    border: "border-orange-200",
    text: "text-gray-900",
    tabActive: "bg-orange-500 text-white shadow-md",
    tabInactive: "bg-orange-200 text-gray-800 hover:bg-orange-300",
  },
  dark: {
    bg: "bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81]", // navy → purple
    card: "bg-white/5 backdrop-blur-sm",
    border: "border-purple-500/30",
    text: "text-gray-100",
    tabActive: "bg-purple-600 text-white shadow-md",
    tabInactive: "bg-purple-900/40 text-purple-200 hover:bg-purple-800/40",
  },
};

/* ----------------------- MAIN DASHBOARD ----------------------- */

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"events" | "verify">("events");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const T = isDark ? COLORS.dark : COLORS.light;

  return (
    <div className={`min-h-screen ${T.bg} p-6 flex flex-col items-center transition-all`}>

      {/* Title */}
      <h1 className={`text-4xl font-extrabold mb-8 tracking-tight drop-shadow-sm ${T.text}`}>
        Admin Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-10">
        {[
          { id: "events", label: "Create Event" },
          { id: "verify", label: "Verify Alumni" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "events" | "verify")}
            className={`px-6 py-2 rounded-lg font-medium transition
              ${activeTab === tab.id ? T.tabActive : T.tabInactive}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Box */}
      <div
        className={`w-full max-w-3xl p-8 rounded-2xl shadow-xl border ${T.card} ${T.border} transition-all`}
      >
        {activeTab === "events" && <EventForm isDark={isDark} />}
        {activeTab === "verify" && <VerifyAlumni isDark={isDark} />}
      </div>
    </div>
  );
}

/* ----------------------- EVENT CREATION FORM ----------------------- */

function EventForm({ isDark }: { isDark: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const res = await fetchWithRefresh("http://localhost:4000/api/v1/admins/createEvent", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Failed to create event");
      }

      alert("✅ Event created successfully!");
      e.target.reset();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-orange-600 dark:text-purple-300">
        Create a New Event
      </h2>

      {/* Input Generator */}
      {[
        { name: "title", placeholder: "Event Title", type: "text" },
        { name: "description", placeholder: "Event Description", textarea: true },
        { name: "date", type: "date" },
        { name: "time", type: "time" },
        { name: "location", placeholder: "Event Location", type: "text" },
      ].map((field) =>
        field.textarea ? (
          <textarea
            key={field.name}
            name={field.name}
            rows={4}
            placeholder={field.placeholder}
            className={`w-full border p-3 rounded-lg transition
              ${isDark ? "bg-gray-900 border-purple-500/40 text-white" : "bg-white border-orange-200"}`}
            required
          />
        ) : (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            className={`w-full border p-3 rounded-lg transition
              ${isDark ? "bg-gray-900 border-purple-500/40 text-white" : "bg-white border-orange-200"}`}
            required
          />
        )
      )}

      {/* Banner */}
      <input
        type="file"
        name="banner"
        accept="image/*"
        className={`w-full border p-3 rounded-lg transition
          file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm
          file:bg-orange-500 file:text-white hover:file:bg-orange-600
          ${isDark ? "bg-gray-900 border-purple-500/40 text-white" : "bg-white border-orange-200"}`}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-lg font-semibold shadow-md transition
          ${isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-500 hover:bg-orange-600"} 
          text-white disabled:opacity-60`}
      >
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}

/* ----------------------- ALUMNI VERIFICATION ----------------------- */

function VerifyAlumni({ isDark }: { isDark: boolean }) {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending alumni
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithRefresh(
          "http://localhost:4000/api/v1/admins/pending-approvalAlumni",
          { method: "GET", credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch pending alumni");

        const data = await res.json();
        setPending(data?.data?.[0]?.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleAction(id: string, action: "verify" | "deny") {
    try {
      setProcessing(id + action);

      const endpoint =
        action === "verify" ? "verify-Alumni" : "deny-Alumni";

      const method = action === "verify" ? "POST" : "DELETE";

      const res = await fetchWithRefresh(
        `http://localhost:4000/api/v1/admins/${endpoint}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alumni_id: id }),
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error(`Failed to ${action} alumni`);

      alert(action === "verify" ? "Verified!" : "Denied!");
      setPending((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return <p className="text-gray-500">Loading alumni...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (pending.length === 0) return <p>No pending alumni.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-orange-600 dark:text-purple-300">
        Verify Alumni
      </h2>

      <ul className="space-y-3">
        {pending.map((alum) => (
          <li
            key={alum._id}
            className={`p-4 rounded-xl border shadow flex justify-between 
              ${isDark ? "bg-gray-900 border-purple-500/40" : "bg-orange-50 border-orange-200"}`}
          >
            <span>
              {alum.first_name} {alum.middle_name || ""} {alum.last_name} — Batch {alum.batch_year}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(alum._id, "verify")}
                disabled={processing === alum._id + "verify"}
                className={`px-3 py-1 rounded-lg text-white font-semibold
                  ${isDark ? "bg-purple-700 hover:bg-purple-800" : "bg-black"}
                  disabled:opacity-50`}
              >
                {processing === alum._id + "verify" ? "Verifying..." : "Verify"}
              </button>

              <button
                onClick={() => handleAction(alum._id, "deny")}
                disabled={processing === alum._id + "deny"}
                className={`px-3 py-1 rounded-lg text-white font-medium
                  ${isDark ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"}
                  disabled:opacity-50`}
              >
                {processing === alum._id + "deny" ? "Denying..." : "Deny"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
