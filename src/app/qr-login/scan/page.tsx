"use client";

import ProfileQrScannerCard from "@/components/profile/ProfileQrScannerCard";

export default function QrLoginScanPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mx-auto max-w-4xl">
        <ProfileQrScannerCard />
      </div>
    </div>
  );
}
