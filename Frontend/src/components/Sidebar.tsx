"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  Calendar,
  MessageSquare,
  User,
  Settings,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";

const baseNav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState<string | undefined>("light");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setActiveTheme(theme === "system" ? systemTheme : theme);
  }, [theme, systemTheme]);

  // ✅ Fetch user role
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchWithRefresh("http://localhost:4000/api/v1/baseUsers/getProfile", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && data.data?.role) setRole(data.data.role);
      } catch (err) {
        console.error("Sidebar role fetch failed:", err);
      }
    };
    loadProfile();
  }, []);

  const isDark = activeTheme === "dark";

  // ✅ Conditionally include Admin link
  const nav = role === "Admin" ? [...baseNav, { href: "/admin", label: "Admin", icon: Shield }] : baseNav;

  return (
    <aside
      className={`hidden md:flex w-64 flex-col gap-3 p-5 border-r transition-all duration-500 
        ${
          isDark
            ? "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] border-gray-700 text-gray-100 shadow-lg"
            : "bg-gradient-to-b from-[#ffffff] via-[#dbeafe] to-[#fff8dc] border-gray-200 text-gray-900 shadow-md"
        }`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-2 py-1">
        <div
          className={`h-10 w-10 rounded-2xl transition-all duration-500 ${
            isDark
              ? "bg-gradient-to-r from-[#38bdf8] to-[#818cf8] shadow-[0_0_12px_rgba(56,189,248,0.4)]"
              : "bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] shadow-[0_0_14px_rgba(147,197,253,0.5)]"
          }`}
        />
        <div>
          <p
            className={`font-bold text-lg tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Campus Connect
          </p>
          <p
            className={`text-xs ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Unify. Engage. Grow.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 grid gap-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link key={href} href={href} className="group relative">
              <motion.div
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all
                  ${
                    active
                      ? isDark
                        ? "bg-gradient-to-r from-[#14b8a6] to-[#3b82f6] text-white shadow-[0_0_14px_rgba(56,189,248,0.5)]"
                        : "bg-gradient-to-r from-[#60a5fa] to-[#818cf8] text-white shadow-[0_0_14px_rgba(96,165,250,0.5)]"
                      : isDark
                      ? "text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.08)]"
                      : "text-gray-700 hover:text-gray-900 hover:bg-[#e0f2fe]/70 hover:shadow-[0_0_10px_rgba(147,197,253,0.3)]"
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="active-rail"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-full ${
                      isDark ? "bg-[#3b82f6]" : "bg-[#2563eb]"
                    }`}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`mt-auto text-xs px-3 pt-4 border-t ${
          isDark ? "border-white/10 text-gray-500" : "border-gray-300 text-gray-600"
        }`}
      >
        v1.0.0
      </div>
    </aside>
  );
}
