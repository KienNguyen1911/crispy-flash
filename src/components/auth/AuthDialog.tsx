"use client";

import { LogIn, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sign in to Lingofy</DialogTitle>
          <DialogDescription>
            Continue with Google or approve sign-in from the Lingofy PWA on your phone.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="qr">QR Login</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="mt-4">
            <div className="rounded-md border p-5">
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Use your Google account</h3>
                <p className="text-sm text-muted-foreground">
                  This keeps the current account system unchanged. Once your phone has an active session,
                  you can use QR login the next time.
                </p>
              </div>
              <Button onClick={onGoogleLogin} className="mt-5 h-11">
                <LogIn className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <div className="rounded-md border p-5">
              <div className="mb-4 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Approve sign-in from phone</h3>
              </div>
              <QrLoginDesktopPanel
                onAuthenticated={(accessToken, refreshToken) => {
                  onQrAuthenticated(accessToken, refreshToken);
                  onOpenChange(false);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
