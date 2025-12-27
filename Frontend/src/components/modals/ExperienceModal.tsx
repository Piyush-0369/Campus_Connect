"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface Experience {
  _id?: string;
  title: string;
  company: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  isCurrent?: boolean;
}

interface Props {
  open: boolean;
  experiences: Experience[];
  onClose: () => void;

  // CRUD (disabled in readOnly)
  onAdd: (e: Experience) => Promise<any>;
  onUpdate: (id: string, e: Experience) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  refresh: () => Promise<void>;

  /** NEW — enables view-only mode */
  readOnly?: boolean;
}

export default function ExperienceModal({
  open,
  experiences,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  refresh,
  readOnly = false,
}: Props) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<Experience | null>(null);

  const [form, setForm] = useState<Experience>({
    title: "",
    company: "",
    description: "",
    start_date: "",
    end_date: null,
    isCurrent: false,
  });

  // Auto-sync on list refresh
  useEffect(() => {
    if (!readOnly && mode === "edit" && editing?._id) {
      const updated = experiences.find((e) => e._id === editing._id);
      if (updated) setForm(updated);
    }
  }, [experiences, readOnly]);

  const resetForm = () =>
    setForm({
      title: "",
      company: "",
      description: "",
      start_date: "",
      end_date: null,
      isCurrent: false,
    });

  const startAdd = () => {
    if (readOnly) return;
    resetForm();
    setMode("add");
    setEditing(null);
  };

  const startEdit = (exp: Experience) => {
    if (readOnly) return;
    setEditing(exp);
    setForm({
      ...exp,
      end_date: exp.end_date ?? null,
      isCurrent: !!exp.isCurrent,
    });
    setMode("edit");
  };

  const handleSubmit = async () => {
    if (readOnly) return;

    if (!form.title || !form.description || !form.start_date)
      return alert("Please fill Title, Description and Start Date");

    const payload: Experience = {
      title: form.title,
      company: form.company || "",
      description: form.description,
      start_date: form.start_date,
      end_date: form.isCurrent ? null : form.end_date || null,
      isCurrent: !!form.isCurrent,
    };

    try {
      if (mode === "add") await onAdd(payload);
      else if (editing?._id) await onUpdate(editing._id, payload);

      await refresh();
      setMode("list");
      resetForm();
    } catch (err: any) {
      alert(err?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (readOnly) return;
    if (!editing?._id) return;

    try {
      await onDelete(editing._id);
      await refresh();
      setMode("list");
      resetForm();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
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
            className="w-full max-w-xl p-6 rounded-2xl border border-[--color-border] bg-[--color-bg] dark:bg-[--color-navy] text-[--color-fg] shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">Experience</h2>
              <button onClick={onClose}>
                <X size={20} className="hover:text-red-400 transition" />
              </button>
            </div>

            {/* LIST VIEW */}
            {mode === "list" && (
              <div className="space-y-4">
                {experiences.length === 0 && (
                  <p className="text-[--color-muted]">No experience added yet.</p>
                )}

                {experiences
                  .slice()
                  .reverse()
                  .map((exp) => (
                    <div
                      key={exp._id}
                      className="p-4 rounded-xl border border-[--color-border] bg-[--color-card]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{exp.title}</h3>
                          <p className="text-sm text-[--color-muted]">{exp.company}</p>
                          <p className="text-xs text-[--color-muted] mt-1">
                            {new Date(exp.start_date).toLocaleDateString()} →{" "}
                            {exp.end_date
                              ? new Date(exp.end_date).toLocaleDateString()
                              : "Present"}
                          </p>
                        </div>

                        {/* 🔒 Hide edit button in readOnly mode */}
                        {!readOnly && (
                          <button
                            onClick={() => startEdit(exp)}
                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
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
                    className="mt-4 w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:opacity-90"
                  >
                    <Plus size={18} /> Add Experience
                  </button>
                )}
              </div>
            )}

            {/* FORM (only if NOT readOnly) */}
            {(mode === "add" || mode === "edit") && !readOnly && (
              <div className="space-y-4">
                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg bg-[--color-card]"
                />

                <input
                  placeholder="Company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg bg-[--color-card]"
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg bg-[--color-card] h-28"
                />

                <div className="flex gap-3">
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="flex-1 border px-3 py-2 rounded-lg bg-[--color-card]"
                  />

                  <input
                    type="date"
                    disabled={!!form.isCurrent}
                    value={form.end_date || ""}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="flex-1 border px-3 py-2 rounded-lg bg-[--color-card]"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.isCurrent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isCurrent: e.target.checked,
                        end_date: e.target.checked ? null : form.end_date,
                      })
                    }
                  />
                  <span className="text-sm text-[--color-muted]">
                    I currently work here
                  </span>
                </label>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => {
                      setMode("list");
                      resetForm();
                    }}
                    className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                  >
                    Cancel
                  </button>

                  {mode === "edit" && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold"
                  >
                    {mode === "add" ? "Add Experience" : "Save Changes"}
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
