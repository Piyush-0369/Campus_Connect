"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface Achievement {
  _id?: string;
  title: string;
  description: string;
  date: string;
}

interface Props {
  open: boolean;
  achievements: Achievement[];
  onClose: () => void;
  onAdd: (a: Achievement) => void;
  onUpdate: (id: string, a: Achievement) => void;
  onDelete: (id: string) => void;

  /** NEW — passed from public views */
  readOnly?: boolean;
}

export default function AchievementModal({
  open,
  achievements,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  readOnly = false, // default false for normal users
}: Props) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const [form, setForm] = useState<Achievement>({
    title: "",
    description: "",
    date: "",
  });

  const resetForm = () => setForm({ title: "", description: "", date: "" });

  const startAdd = () => {
    if (readOnly) return;
    resetForm();
    setMode("add");
  };

  const startEdit = (a: Achievement) => {
    if (readOnly) return;
    setEditingAchievement(a);
    setForm(a);
    setMode("edit");
  };

  const handleSubmit = () => {
    if (readOnly) return;

    if (!form.title || !form.description || !form.date)
      return alert("Please fill all fields");

    mode === "add"
      ? onAdd(form)
      : editingAchievement?._id && onUpdate(editingAchievement._id, form);

    resetForm();
    setMode("list");
  };

  const handleDelete = () => {
    if (readOnly) return;

    if (!editingAchievement?._id) return;
    onDelete(editingAchievement._id);
    setMode("list");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-md grid place-items-center z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xl p-6 rounded-2xl border border-[--color-border]
                       bg-[--color-bg] dark:bg-[--color-navy] text-[--color-fg] shadow-2xl"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">Achievements</h2>
              <button onClick={onClose}>
                <X size={22} className="hover:text-red-400 transition" />
              </button>
            </div>

            {/* LIST MODE */}
            {mode === "list" && (
              <div className="space-y-4">
                {achievements.length === 0 && (
                  <p className="text-[--color-muted]">No achievements yet.</p>
                )}

                {achievements.map((a) => (
                  <div
                    key={a._id}
                    className="p-4 rounded-xl border border-[--color-border] bg-[--color-card]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{a.title}</h3>
                        <p className="text-sm text-[--color-muted]">{a.description}</p>
                        <p className="text-xs text-[--color-muted] mt-1">
                          Earned: {new Date(a.date).toLocaleDateString()}
                        </p>
                      </div>

                      {/* 🔒 Hide edit button in readOnly mode */}
                      {!readOnly && (
                        <button
                          onClick={() => startEdit(a)}
                          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* 🔒 Hide Add button in readOnly mode */}
                {!readOnly && (
                  <button
                    onClick={startAdd}
                    className="mt-4 w-full py-3 rounded-lg flex items-center justify-center gap-2
                               bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90"
                  >
                    <Plus size={18} /> Add Achievement
                  </button>
                )}
              </div>
            )}

            {/* ADD/EDIT FORM — completely disabled in readOnly mode */}
            {(mode === "add" || mode === "edit") && !readOnly && (
              <div className="space-y-4">
                <input
                  placeholder="Achievement Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg bg-[--color-card] text-[--color-fg]"
                />

                <textarea
                  placeholder="Achievement Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg bg-[--color-card] text-[--color-fg] h-28"
                />

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg bg-[--color-card] text-[--color-fg]"
                />

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setMode("list")}
                    className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    Cancel
                  </button>

                  {mode === "edit" && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500
                               text-white font-semibold hover:opacity-90"
                  >
                    {mode === "add" ? "Add Achievement" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
