'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.back();
  };

  return (
    <button
      onClick={handleClick}
      className="h-full w-full flex items-center justify-center"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}