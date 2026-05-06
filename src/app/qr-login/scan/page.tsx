"use client";

import ProfileQrScannerCard from "@/components/profile/ProfileQrScannerCard";

export const metadata = {
  title: "QR Login",
  description: "Scan QR code to sign in on another device"
};

export default function QrLoginScanPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mx-auto max-w-4xl">
        <ProfileQrScannerCard />
      </div>
    </div>
  );
}
