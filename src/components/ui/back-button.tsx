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
      className="h-full w-full flex items-center justify-center text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-100 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}