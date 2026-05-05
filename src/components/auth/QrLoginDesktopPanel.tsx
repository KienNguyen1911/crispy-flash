"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  useEffect(() => {
    if (status !== "EXPIRED") {
      return;
    }

    // Auto refresh QR code after 1 second when expired
    const timer = window.setTimeout(() => {
      createSession();
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [status, createSession]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">Scan with Lingofy PWA</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open Lingofy on your phone and scan to approve.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {session ? <span className="text-xs text-muted-foreground">{secondsLeft}s</span> : null}
            <Badge variant={status === "EXPIRED" ? "destructive" : "secondary"}>
              {badgeLabel}
            </Badge>
          </div>
        </div>

        <div className="mt-4 mx-auto max-w-xs rounded-2xl bg-white p-3 shadow-sm">
          {status === "CREATING" ? (
            <div className="flex aspect-square items-center justify-center text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="QR code for Lingofy login"
              className="aspect-square w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-slate-500">
              QR unavailable
            </div>
          )}
        </div>


      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === "APPROVED" || isExchanging ? (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          <Loader2 className="h-3 w-3 animate-spin" />
          Finishing sign-in...
        </div>
      ) : null}
    </div>
  );
}
