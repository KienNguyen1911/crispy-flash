"use client";

import ProfileQrScannerCard from "@/components/profile/ProfileQrScannerCard";

// Metadata is defined in layout.tsx for this route
export const metadata = {
  title: 'QR Login',
  description: 'Scan QR code to login to your account.',
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
