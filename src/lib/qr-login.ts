export type QrLoginStatus =
  | "PENDING"
  | "SCANNED"
  | "APPROVED"
  | "CONSUMED"
  | "EXPIRED"
  | "CANCELLED";

export interface QrLoginSessionResponse {
  sessionId: string;
  sessionToken: string;
  qrPayload: string;
  expiresAt: string;
  status: QrLoginStatus;
}

export interface QrLoginSessionView {
  sessionId: string;
  status: QrLoginStatus;
  requesterDevice: string;
  expiresAt: string;
  approvedByUserId?: string;
}

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
export const SOCKET_BASE = process.env.NEXT_PUBLIC_API_BASE || API_BASE;

export function getQrImageUrl(qrPayload: string, size = 280) {
  const encoded = encodeURIComponent(qrPayload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

export function formatQrLoginStatus(status: QrLoginStatus) {
  switch (status) {
    case "PENDING":
      return "Waiting for scan";
    case "SCANNED":
      return "Scanned on phone";
    case "APPROVED":
      return "Approved";
    case "CONSUMED":
      return "Completed";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function getTimeRemaining(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
}
