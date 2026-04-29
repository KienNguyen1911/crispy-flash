"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, formatQrLoginStatus, QrLoginSessionView } from "@/lib/qr-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileQrScannerCard() {
  const { isAuthenticated, login, token } = useAuth();
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<QrLoginSessionView | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const lastPayloadRef = useRef<string | null>(null);

  const statusText = useMemo(
    () => (sessionInfo ? formatQrLoginStatus(sessionInfo.status) : "Ready"),
    [sessionInfo],
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

    setIsCameraActive(false);
  }, []);

  const scanPayload = useCallback(async (qrPayload: string) => {
    setScanError(null);
    setIsProcessing(true);

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
      setSessionInfo(data);
      setQrPayload(qrPayload);
      lastPayloadRef.current = qrPayload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to scan QR code";
      setScanError(message);
      toast.error("QR code is not valid for Lingofy sign-in.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const confirmSession = useCallback(async () => {
    if (!qrPayload) {
      setScanError("No valid Lingofy QR code has been scanned yet.");
      return;
    }

    if (!token) {
      login();
      return;
    }

    setIsProcessing(true);
    setScanError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/qr-login/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrPayload }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm QR login");
      }

      const data = (await response.json()) as QrLoginSessionView;
      setSessionInfo(data);
      toast.success("Desktop sign-in approved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm QR login";
      setScanError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [login, qrPayload, token]);

  const beginCameraScan = useCallback(async () => {
    if (typeof window === "undefined" || !window.BarcodeDetector) {
      setScanError("This browser does not support camera QR scanning.");
      toast.error("This browser does not support camera QR scanning.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError("Camera access is not available in this browser.");
      toast.error("Camera access is not available in this browser.");
      return;
    }

    setScanError(null);

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
      setSessionInfo(null);
      setQrPayload(null);
      setIsCameraActive(true);

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
      setScanError(message);
      toast.error(message);
      stopCamera();
    }
  }, [scanPayload, stopCamera]);

  useEffect(() => {
    setCameraSupported(Boolean(typeof window !== "undefined" && window.BarcodeDetector));
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
          <Badge variant={sessionInfo?.status === "APPROVED" ? "default" : "secondary"}>
            {statusText}
          </Badge>
          {sessionInfo ? (
            <span className="text-sm text-muted-foreground">Target: {sessionInfo.requesterDevice}</span>
          ) : null}
        </div>

        {scanError ? (
          <Alert variant="destructive">
            <AlertTitle>Scan failed</AlertTitle>
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={beginCameraScan} disabled={isCameraActive || isProcessing}>
                <Camera className="mr-2 h-4 w-4" />
                Start camera
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                disabled={!isCameraActive}
              >
                <CameraOff className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>

            {!cameraSupported ? (
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
                disabled={!sessionInfo || !qrPayload || isProcessing || sessionInfo.status === "APPROVED"}
              >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {isAuthenticated ? "Confirm sign-in" : "Login to confirm"}
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border bg-black">
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
