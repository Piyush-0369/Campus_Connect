"use client";

import DetailsCard from "@/components/modals/DetailsCard";
import { useState } from "react";

export default function AfterSignupPage() {
  const [needsDetails, setNeedsDetails] = useState(true);

  // Later you will fetch this from backend after signup
  const role = "Student"; 

  // TEMP DESIGN ONLY — does NOT send to backend
  const saveDetails = async (data: any) => {
    console.log("📝 Details received from modal:", data);

    // Mimic a short delay (like a server request)
    await new Promise((res) => setTimeout(res, 500));

    // Close modal
    setNeedsDetails(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Optional placeholder content */}
      <div className="text-center opacity-60">
        <h1 className="text-2xl font-semibold mb-2">After Signup Page</h1>
        <p className="text-sm">User will be redirected here to complete profile.</p>
      </div>

      <DetailsCard
        open={needsDetails}
        role={role}
        onClose={() => {}}
        onSubmit={saveDetails}
      />
    </div>
  );
}
