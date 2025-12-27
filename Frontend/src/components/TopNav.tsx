"use client";

import { Search, FileImage } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";
import { useModal } from "@/components/providers/useModal";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { openModal } = useModal();

  const [query, setQuery] = useState("");
  const [role, setRole] = useState("Student");
  const [imgName, setImgName] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [detailsChecked, setDetailsChecked] = useState(false);

  // ----------------------------------------------------
  // FETCH USER PROFILE
  // ----------------------------------------------------
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetchWithRefresh(
          "http://localhost:4000/api/v1/baseUsers/getProfile",
          { method: "GET", credentials: "include" }
        );

        if (res.ok) {
          const data = await res.json();

          if (data?.success) {
            setIsLoggedIn(true);
            setUser(data.data);

            if (!detailsChecked) {
            if (
              data.data.isProfileComplete === false &&
              (data.data.role === "Student" || data.data.role === "Alumni")
            ) {
              openModal("DetailsCard", {
                user: data.data,
                role: data.data.role,
              });
            }

            setDetailsChecked(true);
          }
            return;
          }
        }

        setIsLoggedIn(false);
      } catch (err) {
        console.error("Auth check failed", err);
        setIsLoggedIn(false);
      }
    };

    verifyUser();
  }, [detailsChecked]);

  // Redirect unauthorized users
  useEffect(() => {
    if (
      isLoggedIn === false &&
      pathname !== "/login" &&
      pathname !== "/signup"
    ) {
      router.replace("/login");
    }
  }, [isLoggedIn, pathname]);

  // ----------------------------------------------------
  // SEARCH HANDLING (POST call)
  // ----------------------------------------------------
  const submitSearch = async () => {
    if (!query.trim() && !imageFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("role", role);
      if (query.trim()) formData.append("q", query.trim());
      if (imageFile) formData.append("photo", imageFile);

      const res = await fetch("http://localhost:4000/api/v1/baseUsers/searchUser", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      localStorage.setItem("imgSearchResults", JSON.stringify(data.data || []));

      const params = new URLSearchParams();
      params.append("role", role);
      if (imageFile) params.append("via", "photo");
      if (query.trim()) params.append("q", query.trim());

      router.push(`/search?${params.toString()}`);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const onFilePick = () => fileRef.current?.click();

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImgName(file.name);
    setImgPreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImgName(null);
    setImgPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  if (isLoggedIn === null) {
    return (
      <div className="h-16 flex items-center justify-center text-sm text-[--color-muted]">
        Checking session...
      </div>
    );
  }

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 h-16">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">

          {/* Role Select */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm border"
          >
            <option value="Student">Student</option>
            <option value="Alumni">Alumni</option>
          </select>

          {/* Search Input */}
          <div className="relative w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="Search users by name..."
              className="w-full rounded-xl text-sm py-2 pl-10 pr-14 border outline-none"
              style={{ background: "var(--color-blue-50)", color: "black" }}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          </div>

          {/* Upload Button */}
          <button
            onClick={onFilePick}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
          >
            <FileImage size={16} />
            {imgPreview ? "Change" : "Upload"}
          </button>

          {/* Clear Button */}
          {imageFile && (
            <button
              onClick={clearImage}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded"
            >
              Clear
            </button>
          )}

          <input type="file" ref={fileRef} className="hidden" onChange={onFileSelect} />

          {/* Search Button */}
          <button
            onClick={submitSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Small Preview */}
        {imgPreview && (
          <div className="hidden md:flex items-center gap-2 border rounded-lg px-2 py-1">
            <img src={imgPreview} className="h-6 w-6 rounded object-cover" />
            <span className="text-xs max-w-[120px] overflow-hidden text-ellipsis">{imgName}</span>
          </div>
        )}

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoggedIn ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-md"
              style={{ background: "var(--accent-1)" }}
            >
              <img src={user?.avatar || "/placeholder.jpg"} className="h-6 w-6 rounded-full" />
              <span className="hidden sm:inline text-sm font-medium">
                {user?.first_name || "Profile"}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-white shadow-md"
              style={{ background: "var(--accent-1)" }}
            >
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
