"use client";

import { useCallback, useEffect, useMemo, useRef, useReducer } from "react";
import { Camera, CameraOff, CheckCircle2, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, formatQrLoginStatus, QrLoginSessionView } from "@/lib/qr-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScannerState {
  qrPayload: string | null;
  isCameraActive: boolean;
  isProcessing: boolean;
  scanError: string | null;
  cameraSupported: boolean;
  sessionInfo: QrLoginSessionView | null;
}

type ScannerAction =
  | { type: 'SET_QR_PAYLOAD'; payload: string | null }
  | { type: 'SET_CAMERA_ACTIVE'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SCAN_ERROR'; payload: string | null }
  | { type: 'SET_CAMERA_SUPPORTED'; payload: boolean }
  | { type: 'SET_SESSION_INFO'; payload: QrLoginSessionView | null };

const scannerReducer = (state: ScannerState, action: ScannerAction): ScannerState => {
  switch (action.type) {
    case 'SET_QR_PAYLOAD':
      return { ...state, qrPayload: action.payload };
    case 'SET_CAMERA_ACTIVE':
      return { ...state, isCameraActive: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_SCAN_ERROR':
      return { ...state, scanError: action.payload };
    case 'SET_CAMERA_SUPPORTED':
      return { ...state, cameraSupported: action.payload };
    case 'SET_SESSION_INFO':
      return { ...state, sessionInfo: action.payload };
    default:
      return state;
  }
};

export default function ProfileQrScannerCard() {
  const { isAuthenticated, login, token } = useAuth();
  const [state, dispatch] = useReducer(scannerReducer, {
    qrPayload: null,
    isCameraActive: false,
    isProcessing: false,
    scanError: null,
    cameraSupported: false,
    sessionInfo: null,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const lastPayloadRef = useRef<string | null>(null);

  const statusText = useMemo(
    () => (state.sessionInfo ? formatQrLoginStatus(state.sessionInfo.status) : "Ready"),
    [state.sessionInfo],
  );

  const stopCamera = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    dispatch({ type: 'SET_CAMERA_ACTIVE', payload: false });
  }, []);

  const scanPayload = useCallback(async (qrPayload: string) => {
    dispatch({ type: 'SET_SCAN_ERROR', payload: null });
    dispatch({ type: 'SET_PROCESSING', payload: true });

    try {
      const response = await fetch(`${API_BASE}/api/auth/qr-login/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrPayload }),
      });

      if (!response.ok) {
        throw new Error("QR code is invalid or already expired");
      }

      const data = (await response.json()) as QrLoginSessionView;
      dispatch({ type: 'SET_SESSION_INFO', payload: data });
      dispatch({ type: 'SET_QR_PAYLOAD', payload: qrPayload });
      lastPayloadRef.current = qrPayload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to scan QR code";
      dispatch({ type: 'SET_SCAN_ERROR', payload: message });
      toast.error("QR code is not valid for Lingofy sign-in.");
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, []);

  const confirmSession = useCallback(async () => {
    if (!state.qrPayload) {
      dispatch({ type: 'SET_SCAN_ERROR', payload: "No valid Lingofy QR code has been scanned yet." });
      return;
    }

    if (!token) {
      login();
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_SCAN_ERROR', payload: null });

    try {
      const response = await fetch(`${API_BASE}/api/auth/qr-login/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrPayload: state.qrPayload }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm QR login");
      }

      const data = (await response.json()) as QrLoginSessionView;
      dispatch({ type: 'SET_SESSION_INFO', payload: data });
      toast.success("Desktop sign-in approved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm QR login";
      dispatch({ type: 'SET_SCAN_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [login, state.qrPayload, token]);

  const beginCameraScan = useCallback(async () => {
    if (typeof window === "undefined" || !window.BarcodeDetector) {
      dispatch({ type: 'SET_SCAN_ERROR', payload: "This browser does not support camera QR scanning." });
      toast.error("This browser does not support camera QR scanning.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      dispatch({ type: 'SET_SCAN_ERROR', payload: "Camera access is not available in this browser." });
      toast.error("Camera access is not available in this browser.");
      return;
    }

    dispatch({ type: 'SET_SCAN_ERROR', payload: null });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
      });

      if (!videoRef.current) {
        throw new Error("Camera preview is not ready");
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
      dispatch({ type: 'SET_SESSION_INFO', payload: null });
      dispatch({ type: 'SET_QR_PAYLOAD', payload: null });
      dispatch({ type: 'SET_CAMERA_ACTIVE', payload: true });

      const detectFrame = async () => {
        if (!videoRef.current || !detectorRef.current) {
          return;
        }

        try {
          const results = await detectorRef.current.detect(videoRef.current);
          const qrValue = results[0]?.rawValue;

          if (qrValue && qrValue !== lastPayloadRef.current) {
            stopCamera();
            await scanPayload(qrValue);
            return;
          }
        } catch {
          // ignore transient detection errors while camera is active
        }

        frameRef.current = requestAnimationFrame(detectFrame);
      };

      frameRef.current = requestAnimationFrame(detectFrame);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to access camera";
      dispatch({ type: 'SET_SCAN_ERROR', payload: message });
      toast.error(message);
      stopCamera();
    }
  }, [scanPayload, stopCamera]);

  useEffect(() => {
    dispatch({ type: 'SET_CAMERA_SUPPORTED', payload: Boolean(typeof window !== "undefined" && window.BarcodeDetector) });
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Mobile QR Sign-In
        </CardTitle>
        <CardDescription>
          Scan the QR shown on desktop login, then confirm this account to sign that browser in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={state.sessionInfo?.status === "APPROVED" ? "default" : "secondary"}>
            {statusText}
          </Badge>
          {state.sessionInfo ? (
            <span className="text-sm text-muted-foreground">Target: {state.sessionInfo.requesterDevice}</span>
          ) : null}
        </div>

        {state.scanError ? (
          <Alert variant="destructive">
            <AlertTitle>Scan failed</AlertTitle>
            <AlertDescription>{state.scanError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={beginCameraScan} disabled={state.isCameraActive || state.isProcessing}>
                <Camera className="mr-2 h-4 w-4" />
                Start camera
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                disabled={!state.isCameraActive}
              >
                <CameraOff className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>

            {!state.cameraSupported ? (
              <Alert>
                <AlertTitle>Camera unsupported</AlertTitle>
                <AlertDescription>
                  This browser does not expose the QR scanner API needed for in-app scanning.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={confirmSession}
                disabled={!state.sessionInfo || !state.qrPayload || state.isProcessing || state.sessionInfo.status === "APPROVED"}
              >
                {state.isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {isAuthenticated ? "Confirm sign-in" : "Login to confirm"}
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border bg-gray-950">
            <video
              ref={videoRef}
              className="aspect-[3/4] w-full object-cover"
              muted
              playsInline
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
