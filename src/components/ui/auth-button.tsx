'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from './button';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthButton() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm md:text-base text-muted-foreground">
          {user.name || user.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => login()}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogIn className="h-4 w-4 mr-2" />
    </Button>
  );
}

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