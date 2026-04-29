"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Loader2, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  API_BASE,
  formatQrLoginStatus,
  getQrImageUrl,
  getTimeRemaining,
  QrLoginSessionResponse,
  QrLoginSessionView,
  SOCKET_BASE,
} from "@/lib/qr-login";

interface QrLoginDesktopPanelProps {
  onAuthenticated: (accessToken: string, refreshToken: string) => void;
}

type PanelStatus = QrLoginSessionView["status"] | "CREATING";

export default function QrLoginDesktopPanel({
  onAuthenticated,
}: QrLoginDesktopPanelProps) {
  const [session, setSession] = useState<QrLoginSessionResponse | null>(null);
  const [status, setStatus] = useState<PanelStatus>("CREATING");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isExchanging, setIsExchanging] = useState(false);
  const hasExchangedRef = useRef(false);

  const qrImageUrl = useMemo(
    () => (session ? getQrImageUrl(session.qrPayload) : null),
    [session],
  );
  const badgeLabel = status === "CREATING" ? "Preparing QR" : formatQrLoginStatus(status);

  const buildRequesterDevice = useCallback(() => {
    if (typeof window === "undefined") {
      return "Browser";
    }

    const platform =
      typeof navigator !== "undefined"
        ? ((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
            ?.platform ||
          navigator.platform ||
          "Desktop")
        : "Desktop";

    return `${platform} browser`;
  }, []);

  const createSession = useCallback(async () => {
    setError(null);
    setStatus("CREATING");
    hasExchangedRef.current = false;

    try {
      const response = await fetch(`${API_BASE}/api/auth/qr-login/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterDevice: buildRequesterDevice() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create QR login session");
      }

      const data = (await response.json()) as QrLoginSessionResponse;
      setSession(data);
      setStatus(data.status);
      setSecondsLeft(getTimeRemaining(data.expiresAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create QR login session");
      setSession(null);
      setStatus("EXPIRED");
    }
  }, [buildRequesterDevice]);

  const exchangeSession = useCallback(async () => {
    if (!session || hasExchangedRef.current) {
      return;
    }

    hasExchangedRef.current = true;
    setIsExchanging(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/auth/qr-login/sessions/${session.sessionId}/exchange`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionToken: session.sessionToken }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to exchange QR login session");
      }

      const data = (await response.json()) as {
        access_token: string;
        refresh_token: string;
      };

      setStatus("CONSUMED");
      onAuthenticated(data.access_token, data.refresh_token);
    } catch (err) {
      hasExchangedRef.current = false;
      setError(err instanceof Error ? err.message : "Failed to complete QR login");
    } finally {
      setIsExchanging(false);
    }
  }, [onAuthenticated, session]);

  useEffect(() => {
    createSession();
  }, [createSession]);

  useEffect(() => {
    if (!session) {
      return;
    }

    setSecondsLeft(getTimeRemaining(session.expiresAt));

    const timer = window.setInterval(() => {
      const remaining = getTimeRemaining(session.expiresAt);
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setStatus("EXPIRED");
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const socket = io(SOCKET_BASE, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      socket.emit("subscribe-qr-login", {
        sessionId: session.sessionId,
        sessionToken: session.sessionToken,
      });
    });

    socket.on("qr-login:scanned", () => {
      setStatus("SCANNED");
    });

    socket.on("qr-login:approved", () => {
      setStatus("APPROVED");
    });

    socket.on("qr-login:expired", () => {
      setStatus("EXPIRED");
    });

    socket.on("qr-login:error", (event: { error?: string }) => {
      setError(event.error || "QR login failed");
    });

    return () => {
      socket.emit("unsubscribe-qr-login", {
        sessionId: session.sessionId,
        sessionToken: session.sessionToken,
      });
      socket.disconnect();
    };
  }, [session]);

  useEffect(() => {
    if (!session || status === "CONSUMED" || status === "EXPIRED") {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/auth/qr-login/sessions/${session.sessionId}/status?sessionToken=${encodeURIComponent(session.sessionToken)}`,
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as QrLoginSessionView;
        setStatus(data.status);
      } catch {
        // ignore polling errors and keep waiting for websocket
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [session, status]);

  useEffect(() => {
    if (status === "APPROVED") {
      exchangeSession();
    }
  }, [exchangeSession, status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={status === "EXPIRED" ? "destructive" : "secondary"}>
            {badgeLabel}
          </Badge>
          {session ? (
            <span className="text-sm text-muted-foreground">{secondsLeft}s</span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={createSession}
          disabled={status === "CREATING" || isExchanging}
          className="h-9"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>QR login unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Open Lingofy on your phone, go to <span className="font-medium text-foreground">Profile</span>, then use
            the mobile QR sign-in scanner to approve this browser.
          </p>

          <div className="rounded-md border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              Mobile flow
            </div>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Open the installed PWA on your smartphone.</li>
              <li>2. Go to Profile and open Mobile QR Sign-In.</li>
              <li>3. Scan this code and tap Confirm on the phone.</li>
            </ol>
          </div>

          {status === "APPROVED" || isExchanging ? (
            <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Finishing sign-in...
            </div>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-[220px] rounded-md border bg-white p-3">
          {status === "CREATING" ? (
            <div className="flex aspect-square items-center justify-center text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="QR code for Lingofy login"
              className="aspect-square w-full"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-slate-500">
              QR unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
