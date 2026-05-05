'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from './button';
import { LogIn, LogOut, User } from 'lucide-react';

// Simplified icon component for use in floating dock
export function AuthIcon() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      logout();
    } else {
      login();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-neutral-500 dark:text-neutral-300">
        <User className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="h-10 w-10 flex items-center justify-center"
    >
      {isAuthenticated ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
    </Button>
  );
}