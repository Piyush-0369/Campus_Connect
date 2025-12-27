"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";

const BASE_URL = "http://localhost:4000/api/v1/baseUsers";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetchWithRefresh(`${BASE_URL}/getProfile`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) router.replace("/profile");
        }
      } catch {
        // Not logged in — ignore
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!role || !email || !password) {
      setErrorMsg("Please select a role and fill all fields");
      return;
    }

    try {
      const res = await fetchWithRefresh(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, email, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setErrorMsg("Unexpected server response");
        return;
      }

      if (res.ok && data.success) {
        // Force full reload so session navbar updates
        window.location.href = "/profile";
      } else {
        setErrorMsg(data.message || "Invalid credentials");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="grid place-items-center h-[calc(100vh-6rem)]">
      <form
        onSubmit={handleSubmit}
        className="card p-6 w-full max-w-md bg-gradient-to-br from-white to-[--color-blue-50] dark:from-[--color-navy] dark:to-transparent"
      >
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-[--color-muted]">Sign in to College Connect</p>

        {errorMsg && (
          <div className="mt-3 p-2 bg-red-200 text-red-800 rounded">
            {errorMsg}
          </div>
        )}

        {/* Role Select */}
        <div className="flex justify-center gap-3 mt-4">
          {["Student", "Alumni", "Admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-lg font-medium transition
              ${role === r ? "bg-green-500 text-white " : "text-white-800 bg-gradient-to-tr from-purple-500 to-blue-400 text-white hover:from-teal-600 hover:to-blue-400 hover:opacity-90"}`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
            className="rounded-xl bg-transparent border border-[--color-border] px-3 py-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
            className="rounded-xl bg-transparent border border-[--color-border] px-3 py-2"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-semibold bg-purple-500 text-white-800
             bg-gradient-to-r from-cobalt-400 to-blue-400 
             text-white hover:to-rose-600 hover: opacity-90 
             transition-all duration-300"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="w-full py-2.5 rounded-lg font-semibold bg-purple-500 text-white-800
             bg-gradient-to-r from-cobalt-400 to-blue-400 
             text-white hover:to-rose-600 hover: opacity-90 
             transition-all duration-300"
          >
            Create an account
          </button>

        </div>
      </form>
    </div>
  );
}
