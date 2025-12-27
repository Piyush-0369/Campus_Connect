"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function AlumniEditProfileModal({
  open,
  alum,
  onClose,
  onUpdate
}: any) {

  const [form, setForm] = useState({
    first_name: alum.first_name || "",
    middle_name: alum.middle_name || "",
    last_name: alum.last_name || "",
    batch_year: alum.batch_year || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    try {
      const fd = new FormData();

      fd.append("first_name", form.first_name);
      fd.append("middle_name", form.middle_name);
      fd.append("last_name", form.last_name);
      fd.append("batch_year", form.batch_year);

      if (avatarFile) {
        fd.append("avatar", avatarFile);
      }

      await onUpdate(fd);   // send FormData
      onClose();
    } catch (err: any) {
      alert(err?.message || "Failed to update profile");
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
            className="w-full max-w-lg p-6 rounded-2xl bg-[--color-bg] dark:bg-[--color-navy] border border-[--color-border]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Profile</h2>
              <button onClick={onClose}>
                <X className="hover:text-red-400" />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3">

              <input
                className="w-full border px-3 py-2 rounded-lg bg-[--color-card]"
                placeholder="First Name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />

              <input
                className="w-full border px-3 py-2 rounded-lg bg-[--color-card]"
                placeholder="Middle Name"
                value={form.middle_name}
                onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
              />

              <input
                className="w-full border px-3 py-2 rounded-lg bg-[--color-card]"
                placeholder="Last Name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />

              <input
                className="w-full border px-3 py-2 rounded-lg bg-[--color-card]"
                placeholder="Batch Year"
                type="number"
                value={form.batch_year}
                onChange={(e) => setForm({ ...form, batch_year: e.target.value })}
              />

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[--color-muted]">
                  Upload New Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="w-full border px-3 py-2 rounded-lg bg-[--color-card]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-300 dark:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
