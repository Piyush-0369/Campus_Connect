"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";

const BASE_URL = "http://localhost:4000/api/v1";

interface Props {
  open: boolean;
  role: "Student" | "Alumni";
  onClose: () => void;
  onSubmit?: (data: FormData) => Promise<any>;
}

export default function DetailsCard({ open, role, onClose, onSubmit }: Props) {
  const [department, setDepartment] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [course, setCourse] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [about, setAbout] = useState("");

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const DEPARTMENTS = ["CSE", "ECE", "ME", "CE", "EEE", "IT"];

  // Cleanup preview
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;

    setImgFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const submitForm = async () => {
    if (!department) return alert("Select department");
    if (!batchYear) return alert("Batch year required");
    if (!course) return alert("Course required");
    if (!about) return alert("Write something about yourself");
    if (!imgFile) return alert("Upload avatar");
    if (role === "Student" && !courseDuration)
      return alert("Course duration is required");

    const form = new FormData();
    form.append("department", department);
    form.append("batch_year", batchYear);
    form.append("about_me", about);
    form.append("course", course);
    form.append("avatar", imgFile);

    if (role === "Student") {
      form.append("course_duration", courseDuration);
    }

    if (onSubmit) {
      try {
        setSubmitting(true);
        await onSubmit(form);
        setSubmitting(false);
        onClose();
      } catch (err: any) {
        setSubmitting(false);
        alert(err?.message);
      }
      return;
    }

    const studentRoute = `${BASE_URL}/students/completeStudentProfile`;
    const alumniRoute = `${BASE_URL}/alumni/completeAlumniProfile`;

    const uploadURL = role === "Student" ? studentRoute : alumniRoute;

    try {
      setSubmitting(true);

      const res = await fetch(uploadURL, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const raw = await res.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Invalid server response: " + raw.slice(0, 200));
      }

      if (!data.success) throw new Error(data.message || "Operation failed");

      alert("Profile updated successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Scrollable Modal Container */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 
            bg-[#0a0a0a] max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-[#0a0a0a] z-10">
              <h2 className="text-3xl font-bold text-center text-white">
                Complete Your Profile
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Department */}
              <div className="space-y-1">
                <label className="font-semibold text-white">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-gray-600 bg-[#111] text-white px-3 py-2 rounded-lg"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch year */}
              <input
                placeholder="Batch Year (e.g. 2024)"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="border border-gray-600 bg-[#111] text-white px-3 py-2 rounded-lg w-full"
              />

              {/* Course */}
              <input
                placeholder="Course (BTech / MTech / MCA...)"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="border border-gray-600 bg-[#111] text-white px-3 py-2 rounded-lg w-full"
              />

              {/* Course Duration (Student only) */}
              {role === "Student" && (
                <input
                  placeholder="Course Duration (Years)"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  className="border border-gray-600 bg-[#111] text-white px-3 py-2 rounded-lg w-full"
                />
              )}

              {/* About */}
              <textarea
                placeholder="Write something about yourself..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full border border-gray-600 bg-[#111] text-white px-3 py-2 rounded-lg h-28"
              />

              {/* Avatar Upload */}
              <div className="space-y-1">
                <label className="font-semibold text-white">Profile Image</label>

                <label
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
                  bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold
                  hover:opacity-90 transition cursor-pointer"
                >
                  <Upload size={18} /> Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>

                {preview && (
                  <img
                    src={preview}
                    className="h-20 w-20 rounded-full object-cover mt-3 border border-gray-600"
                  />
                )}
              </div>
            </div>

            {/* Fixed Bottom Save Button */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={submitForm}
                disabled={submitting}
                className="w-full py-3 rounded-lg text-white 
                bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition"
              >
                {submitting ? "Saving..." : "Save Details"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
