"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";

const BASE_URL = "http://localhost:4000/api/v1";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<"Student" | "Alumni">("Student");

  // Primary Fields
  const [first_name, setFirst] = useState("");
  const [middle_name, setMiddle] = useState("");
  const [last_name, setLast] = useState("");
  const [college_roll, setRoll] = useState("");
  const [email, setEmail] = useState("");

  // Password (AFTER OTP only)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP Handling
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  // File Upload (Alumni Only)
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [degreePreview, setPreview] = useState<string | null>(null);

  // Send OTP
  const sendOtp = async () => {
    if (!email) return alert("Enter email first");

    try {
      const res = await fetchWithRefresh(`${BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      setOtpSent(true);
      alert("OTP sent!");
    } catch {
      alert("Error sending OTP");
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      const res = await fetchWithRefresh(`${BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) return alert("Invalid OTP");

      setVerified(true);
      alert("Email Verified");
    } catch {
      alert("Error verifying OTP");
    }
  };

  // On Degree Upload
  const onFileSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDegreeFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Submit Main Signup
  const submit = async (e: any) => {
    e.preventDefault();

    if (!verified) return alert("Please verify your email");

    if (!password || password.length < 6)
      return alert("Password must be at least 6 characters");

    if (password !== confirmPassword)
      return alert("Passwords do not match");

    const form = new FormData();
    form.append("first_name", first_name);
    form.append("middle_name", middle_name);
    form.append("last_name", last_name);
    form.append("email", email);
    form.append("password_hash", password); // IMPORTANT FIX

    if (role === "Student") {
      form.append("college_roll", college_roll);
    } else {
      if (!degreeFile) return alert("Upload degree certificate");
      form.append("degree", degreeFile); // IMPORTANT FIX
    }

    const url =
      role === "Student"
        ? `${BASE_URL}/students/registerStudent`
        : `${BASE_URL}/alumni/registerAlumni`;

    try {
      const res = await fetchWithRefresh(url, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      alert("Signup successful!");
      router.push("/login");

    } catch {
      alert("Signup error");
    }
  };

  return (
    <div className="grid place-items-center min-h-[calc(100vh-6rem)] px-4">
      <form
        onSubmit={submit}
        className="card p-6 w-full max-w-xl bg-white dark:bg-[--color-navy] rounded-xl shadow space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Create your account</h1>

        {/* Role Selector */}
        <div className="flex justify-center gap-3">
          {["Student", "Alumni"].map((r: any) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-lg font-medium transition
              ${role === r ? 
                "bg-green-600 text-white" : 
                "text-white bg-gradient-to-tr from-purple-500 to-blue-400 hover:from-teal-600 hover:to-blue-400 hover:opacity-90"}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-3 gap-3">
          <input
            placeholder="First Name"
            value={first_name}
            required
            onChange={(e) => setFirst(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            placeholder="Middle Name"
            value={middle_name}
            onChange={(e) => setMiddle(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
          <input
            placeholder="Last Name"
            value={last_name}
            required
            onChange={(e) => setLast(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        {/* College Roll (Student Only) */}
        {role === "Student" && (
          <input
            placeholder="College Roll"
            value={college_roll}
            required
            onChange={(e) => setRoll(e.target.value)}
            className="border w-full px-3 py-2 rounded-lg"
          />
        )}

        {/* Email + OTP */}
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            disabled={verified}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border flex-1 px-3 py-2 rounded-lg"
          />
          {!verified && (
            <button
              type="button"
              onClick={sendOtp}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {otpSent ? "Resend" : "Send OTP"}
            </button>
          )}
        </div>

        {/* OTP Box */}
        {otpSent && !verified && (
          <div className="flex gap-2">
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border flex-1 px-3 py-2 rounded-lg"
            />
            <button
              type="button"
              onClick={verifyOtp}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Verify
            </button>
          </div>
        )}

        {/* Password (only after verify) */}
        {verified && (
          <>
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="border w-full px-3 py-2 rounded-lg"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border w-full px-3 py-2 rounded-lg"
            />
          </>
        )}

        {/* Degree Upload (Alumni Only) */}
        {role === "Alumni" && (
          <div className="space-y-2">
            <label className="block font-medium mb-1">Upload Degree Certificate</label>

            <label className="cursor-pointer px-4 py-2 rounded-lg inline-block text-white 
              bg-gradient-to-r from-purple-500 to-blue-400 
              hover:from-teal-600 hover:to-blue-400 hover:opacity-90
              transition duration-300">
              Select File
              <input
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
              />
            </label>

            {degreePreview && (
              <img
                src={degreePreview}
                className="h-28 w-28 object-cover border rounded"
              />
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!verified}
          className={`w-full py-3 rounded-lg font-semibold 
            ${verified
              ? "bg-amber-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Sign Up
        </button>

        {/* Login Redirect */}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-2.5 rounded-lg font-semibold 
          bg-gradient-to-r from-purple-500 to-blue-400 text-white
          hover:from-teal-600 hover:to-blue-400 hover:opacity-90 
          transition-all duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
}
