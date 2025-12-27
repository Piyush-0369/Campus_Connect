"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface Item {
  title: string;
  start_date: string; // ISO
}

interface Props {
  projects: Item[];
  achievements: Item[];
  experiences: Item[];
}

export default function Timeline({ projects, achievements, experiences }: Props) {
  // 👉 Alumni mode: only experience line
  const alumniMode = projects.length === 0 && achievements.length === 0;

  // Format as YYYY-MM
  const getMonth = (date: string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Build monthly dataset
  const data = useMemo(() => {
    const months = new Set<string>();

    const addMonth = (d: string) => months.add(getMonth(d));

    projects.forEach(p => addMonth(p.start_date));
    achievements.forEach(a => addMonth(a.start_date));
    experiences.forEach(e => addMonth(e.start_date));

    const sorted = [...months].sort();

    return sorted.map(month => ({
      month,
      projects: projects.filter(p => getMonth(p.start_date) === month).length,
      achievements: achievements.filter(a => getMonth(a.start_date) === month).length,
      experiences: experiences.filter(e => getMonth(e.start_date) === month).length,

      projectLabels: projects
        .filter(p => getMonth(p.start_date) === month)
        .map(p => `${p.title} (${p.start_date})`),

      achievementLabels: achievements
        .filter(a => getMonth(a.start_date) === month)
        .map(a => `${a.title} (${a.start_date})`),

      experienceLabels: experiences
        .filter(e => getMonth(e.start_date) === month)
        .map(e => `${e.title} (${e.start_date})`)
    }));
  }, [projects, achievements, experiences]);

  // Tooltip showing title + date
  const renderTooltip = ({ payload, label }: any) => {
    if (!payload?.length) return null;
    const p = payload[0].payload;

    return (
      <div className="bg-[--color-card] p-3 rounded-lg border border-[--color-border] shadow-xl text-[--color-fg]">
        <div className="font-bold mb-1">📅 {label}</div>

        {!alumniMode && p.projectLabels.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-indigo-400">Projects</div>
            {p.projectLabels.map((t: string, i: number) => (
              <div key={i} className="text-sm">{t}</div>
            ))}
          </div>
        )}

        {!alumniMode && p.achievementLabels.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-pink-400">Achievements</div>
            {p.achievementLabels.map((t: string, i: number) => (
              <div key={i} className="text-sm">{t}</div>
            ))}
          </div>
        )}

        {p.experienceLabels.length > 0 && (
          <div>
            <div className="font-semibold text-emerald-400">Experience</div>
            {p.experienceLabels.map((t: string, i: number) => (
              <div key={i} className="text-sm">{t}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-[380px] p-6 rounded-2xl border border-[--color-border]
                    bg-[--color-bg] dark:bg-[--color-navy] shadow-sm select-none">
      <h2 className="text-xl font-semibold mb-4">
        {alumniMode ? "Experience Timeline (Monthly)" : "Student Timeline (Monthly)"}
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" stroke="var(--color-muted)" />
          <YAxis allowDecimals={false} stroke="var(--color-muted)" />
          <Tooltip content={renderTooltip} />
          <Legend />

          {/* PROJECTS LINE — hidden for alumni */}
          {!alumniMode && (
            <Line
              type="monotone"
              dataKey="projects"
              name="Projects"
              stroke="#6366F1"
              strokeWidth={3}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
              isAnimationActive={false}
            />
          )}

          {/* ACHIEVEMENTS LINE — hidden for alumni */}
          {!alumniMode && (
            <Line
              type="monotone"
              dataKey="achievements"
              name="Achievements"
              stroke="#EC4899"
              strokeWidth={3}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
              isAnimationActive={false}
            />
          )}

          {/* EXPERIENCE LINE (always shown) */}
          <Line
            type="monotone"
            dataKey="experiences"
            name="Experience"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
