"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface Project {
  _id?: string;
  title: string;
  description: string;
  link: string;
  startDate: string;
  endDate?: string;
}

interface Props {
  open: boolean;
  projects: Project[];
  onClose: () => void;
  onAdd: (p: Project) => void;
  onUpdate: (id: string, p: Project) => void;
  onDelete: (id: string) => void;

  /** NEW — View-only mode */
  readOnly?: boolean;
}

export default function ProjectModal({
  open,
  projects,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  readOnly = false,
}: Props) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [form, setForm] = useState<Project>({
    title: "",
    description: "",
    link: "",
    startDate: "",
    endDate: "",
  });

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      link: "",
      startDate: "",
      endDate: "",
    });

  const forceRefresh = () => {
    setEditingProject(null);
    resetForm();
  };

  const startAdd = () => {
    if (readOnly) return;
    resetForm();
    setMode("add");
  };

  const startEdit = (p: Project) => {
    if (readOnly) return;
    setEditingProject(p);
    setForm(p);
    setMode("edit");
  };

  // 🔄 Auto-sync on edit refresh
  useEffect(() => {
    if (!readOnly && mode === "edit" && editingProject?._id) {
      const updated = projects.find((p) => p._id === editingProject._id);
      if (updated) setForm(updated);
    }
  }, [projects]);

  const handleSubmit = () => {
    if (readOnly) return;

    if (!form.title || !form.description || !form.startDate)
      return alert("Please fill all required fields");

    if (mode === "add") onAdd(form);
    else if (editingProject?._id) onUpdate(editingProject._id, form);

    forceRefresh();
    setMode("list");
  };

  const handleDelete = () => {
    if (readOnly) return;
    if (!editingProject?._id) return;

    onDelete(editingProject._id);
    forceRefresh();
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
              <h2 className="text-2xl font-bold">Projects</h2>
              <button onClick={onClose}>
                <X size={22} className="hover:text-red-400 transition" />
              </button>
            </div>

            {/* LIST MODE */}
            {mode === "list" && (
              <div className="space-y-4">
                {projects.length === 0 && (
                  <p className="text-[--color-muted]">No projects yet.</p>
                )}

                {projects.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 rounded-xl border border-[--color-border] bg-[--color-card] shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{p.title}</h3>
                        <p className="text-sm text-[--color-muted]">{p.description}</p>

                        <p className="text-xs text-[--color-muted] mt-1">
                          {p.startDate} → {p.endDate || "Present"}
                        </p>

                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            className="text-blue-400 text-sm underline mt-1 inline-block"
                          >
                            GitHub
                          </a>
                        )}
                      </div>

                      {/* 🔒 Hide edit button in read-only mode */}
                      {!readOnly && (
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 rounded-lg bg-[--color-blue] text-white hover:opacity-90 transition"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* 🔒 Hide Add Project button in read-only mode */}
                {!readOnly && (
                  <button
                    onClick={startAdd}
                    className="mt-4 w-full py-3 rounded-lg flex items-center justify-center gap-2
                               bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90"
                  >
                    <Plus size={18} /> Add Project
                  </button>
                )}
              </div>
            )}

            {/* ADD/EDIT FORM — disabled in readOnly */}
            {(mode === "add" || mode === "edit") && !readOnly && (
              <div className="space-y-4">
                <input
                  placeholder="Project Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg 
                             bg-[--color-card] text-[--color-fg]"
                />

                <textarea
                  placeholder="Project Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg 
                             bg-[--color-card] text-[--color-fg] h-28"
                />

                <input
                  placeholder="GitHub Link (optional)"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg 
                             bg-[--color-card] text-[--color-fg]"
                />

                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg 
                             bg-[--color-card] text-[--color-fg]"
                />

                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full border border-[--color-border] px-3 py-2 rounded-lg 
                             bg-[--color-card] text-[--color-fg]"
                />

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setMode("list")}
                    className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                               text-gray-900 dark:text-gray-100"
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
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500
                               text-white font-semibold hover:opacity-90"
                  >
                    {mode === "add" ? "Add Project" : "Save Changes"}
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
