'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const { back } = useRouter();

  const goBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    back();
  };

  return (
    <button
      onClick={goBack}
      className="h-full w-full flex items-center justify-center"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}