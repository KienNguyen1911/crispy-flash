"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QrLoginDesktopPanel from "@/components/auth/QrLoginDesktopPanel";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoogleLogin: () => void;
  onQrAuthenticated: (accessToken: string, refreshToken: string) => void;
}

export default function AuthDialog({
  open,
  onOpenChange,
  onGoogleLogin,
  onQrAuthenticated,
}: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Sign in to Lingofy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <QrLoginDesktopPanel
            onAuthenticated={(accessToken, refreshToken) => {
              onQrAuthenticated(accessToken, refreshToken);
              onOpenChange(false);
            }}
          />

          <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                <LogIn className="h-5 w-5" />
                <span>Google login</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Use Google if you want immediate access instead.
              </p>
              <Button onClick={onGoogleLogin} className="h-11 w-full sm:w-auto">
                <LogIn className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
