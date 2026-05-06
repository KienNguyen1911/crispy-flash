"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useReducer } from "react";
import Image from "next/image";
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

interface PanelState {
  session: QrLoginSessionResponse | null;
  status: PanelStatus;
  error: string | null;
  secondsLeft: number;
  isExchanging: boolean;
}

type PanelAction =
  | { type: 'SET_SESSION'; payload: QrLoginSessionResponse }
  | { type: 'SET_STATUS'; payload: PanelStatus }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SECONDS_LEFT'; payload: number }
  | { type: 'SET_EXCHANGING'; payload: boolean }
  | { type: 'RESET_SESSION' };

const panelReducer = (state: PanelState, action: PanelAction): PanelState => {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload, status: action.payload.status, error: null };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SECONDS_LEFT':
      return { ...state, secondsLeft: action.payload };
    case 'SET_EXCHANGING':
      return { ...state, isExchanging: action.payload };
    case 'RESET_SESSION':
      return { ...state, session: null, status: 'CREATING', error: null, secondsLeft: 0, isExchanging: false };
    default:
      return state;
  }
};

export default function QrLoginDesktopPanel({
  onAuthenticated,
}: QrLoginDesktopPanelProps) {
  const [state, dispatch] = useReducer(panelReducer, {
    session: null,
    status: 'CREATING',
    error: null,
    secondsLeft: 0,
    isExchanging: false,
  });
  const hasExchangedRef = useRef(false);

  const qrImageUrl = useMemo(
    () => (state.session ? getQrImageUrl(state.session.qrPayload) : null),
    [state.session],
  );
  const badgeLabel = state.status === "CREATING" ? "Preparing QR" : formatQrLoginStatus(state.status);

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
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_STATUS', payload: 'CREATING' });
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
      dispatch({ type: 'SET_SESSION', payload: data });
      dispatch({ type: 'SET_SECONDS_LEFT', payload: getTimeRemaining(data.expiresAt) });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : "Failed to create QR login session" });
      dispatch({ type: 'SET_STATUS', payload: 'EXPIRED' });
    }
  }, [buildRequesterDevice]);

  const pollSessionStatus = useCallback(async (session: QrLoginSessionResponse) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/auth/qr-login/sessions/${session.sessionId}/status?sessionToken=${encodeURIComponent(session.sessionToken)}`,
      );

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as QrLoginSessionView;
      dispatch({ type: 'SET_STATUS', payload: data.status });
    } catch {
      // ignore polling errors and keep waiting for websocket
    }
  }, []);

  const exchangeSession = useCallback(async () => {
    if (!state.session || hasExchangedRef.current) {
      return;
    }

    hasExchangedRef.current = true;
    dispatch({ type: 'SET_EXCHANGING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(
        `${API_BASE}/api/auth/qr-login/sessions/${state.session.sessionId}/exchange`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionToken: state.session.sessionToken }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to exchange QR login session");
      }

      const data = (await response.json()) as {
        access_token: string;
        refresh_token: string;
      };

      dispatch({ type: 'SET_STATUS', payload: 'CONSUMED' });
      onAuthenticated(data.access_token, data.refresh_token);
    } catch (err) {
      hasExchangedRef.current = false;
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : "Failed to complete QR login" });
    } finally {
      dispatch({ type: 'SET_EXCHANGING', payload: false });
    }
  }, [onAuthenticated, state.session]);

  useEffect(() => {
    createSession();
  }, [createSession]);

  useEffect(() => {
    if (!state.session) {
      return;
    }

    dispatch({ type: 'SET_SECONDS_LEFT', payload: getTimeRemaining(state.session.expiresAt) });

    const timer = window.setInterval(() => {
      const remaining = getTimeRemaining(state.session!.expiresAt);
      dispatch({ type: 'SET_SECONDS_LEFT', payload: remaining });

      if (remaining <= 0) {
        dispatch({ type: 'SET_STATUS', payload: 'EXPIRED' });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.session]);

  useEffect(() => {
    if (!state.session) {
      return;
    }

    const socket = io(SOCKET_BASE, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      socket.emit("subscribe-qr-login", {
        sessionId: state.session!.sessionId,
        sessionToken: state.session!.sessionToken,
      });
    });

    socket.on("qr-login:scanned", () => {
      dispatch({ type: 'SET_STATUS', payload: 'SCANNED' });
    });

    socket.on("qr-login:approved", () => {
      dispatch({ type: 'SET_STATUS', payload: 'APPROVED' });
    });

    socket.on("qr-login:expired", () => {
      dispatch({ type: 'SET_STATUS', payload: 'EXPIRED' });
    });

    socket.on("qr-login:error", (event: { error?: string }) => {
      dispatch({ type: 'SET_ERROR', payload: event.error || "QR login failed" });
    });

    return () => {
      socket.emit("unsubscribe-qr-login", {
        sessionId: state.session!.sessionId,
        sessionToken: state.session!.sessionToken,
      });
      socket.disconnect();
    };
  }, [state.session]);

  useEffect(() => {
    if (!state.session || state.status === "CONSUMED" || state.status === "EXPIRED") {
      return;
    }

    const timer = window.setInterval(() => {
      pollSessionStatus(state.session!);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [state.session, state.status, pollSessionStatus]);

  useEffect(() => {
    if (state.status === "APPROVED") {
      exchangeSession();
    }
  }, [exchangeSession, state.status]);

  useEffect(() => {
    if (state.status !== "EXPIRED") {
      return;
    }

    // Auto refresh QR code after 1 second when expired
    const timer = window.setTimeout(() => {
      createSession();
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [state.status, createSession]);

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
            {state.session ? <span className="text-xs text-muted-foreground">{state.secondsLeft}s</span> : null}
            <Badge variant={state.status === "EXPIRED" ? "destructive" : "secondary"}>
              {badgeLabel}
            </Badge>
          </div>
        </div>

        <div className="mt-4 mx-auto max-w-xs rounded-2xl bg-white p-3 shadow-sm">
          {state.status === "CREATING" ? (
            <div className="flex aspect-square items-center justify-center text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : qrImageUrl ? (
            <Image
              src={qrImageUrl}
              alt="QR code for Lingofy login"
              width={400}
              height={400}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-slate-500">
              QR unavailable
            </div>
          )}
        </div>


      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state.status === "APPROVED" || state.isExchanging ? (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          <Loader2 className="h-3 w-3 animate-spin" />
          Finishing sign-in...
        </div>
      ) : null}
    </div>
  );
}
