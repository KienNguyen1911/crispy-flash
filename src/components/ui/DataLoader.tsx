"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

function TopBar({ active }: { active: boolean }) {
  return (
    <div
      className={`fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#A47451] via-[#3B899A] to-[#000116] z-[9999] transition-all duration-300 ease-linear ${active ? "w-full opacity-100" : "w-0 opacity-0"}`}
      style={{ boxShadow: active ? "0 0 20px rgba(59,137,154,0.5)" : "none" }}
    />
  );
}

function AnimatedLogo() {
  return (
    <div className="relative w-20 h-20">
      {/* Background gradient circle */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-[#A47451] via-[#9C9881] via-[#73A09D] via-[#3B899A] via-[#095B79] via-[#002847] to-[#000116] animate-gradient-shift" />
      </div>

      {/* Top-right piece - animated */}
      <svg
        className="absolute inset-0 w-full h-full animate-logo-piece-1"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M381 80C403.091 80.0002 421 97.9087 421 120V267.333C421 289.424 403.091 307.333 381 307.333H307.333V233.667C307.333 211.576 289.424 193.667 267.333 193.667H193.667V120C193.667 97.9086 211.576 80 233.667 80H381Z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      {/* Bottom-left piece - animated */}
      <svg
        className="absolute inset-0 w-full h-full animate-logo-piece-2"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M193.667 267.333C193.667 289.424 211.576 307.333 233.667 307.333H307.333V381C307.333 403.091 289.424 421 267.333 421H120C97.9086 421 80 403.091 80 381V233.667C80 211.576 97.9086 193.667 120 193.667H193.667V267.333Z"
          fill="white"
          opacity="0.95"
        />
      </svg>

      {/* Rotating ring around logo */}
      <svg
        className="absolute inset-0 w-full h-full animate-spin-slow"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="2"
          strokeDasharray="70 200"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B899A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A47451" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function PageLoader() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const overlayRef = useRef(false);

  useEffect(() => {
    if (!prevPath.current) {
      prevPath.current = pathname;
      return;
    }
    if (pathname !== prevPath.current) {
      if (!overlayRef.current) {
        setActive(true);
        setShowSpinner(true);
      }

      const doneTimer = setTimeout(() => {
        overlayRef.current = false;
        setShowSpinner(false);
        setActive(false);
      }, 220);

      prevPath.current = pathname;
      return () => {
        clearTimeout(doneTimer);
      };
    }
  }, [pathname]);

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      const el =
        (e.target as HTMLElement).closest &&
        (e.target as HTMLElement).closest("a");
      if (!el) return;
      const href = (el as HTMLAnchorElement).getAttribute("href");
      const target = (el as HTMLAnchorElement).getAttribute("target");
      if (!href) return;
      if (href.startsWith("http") && !href.startsWith(location.origin)) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (
        href.startsWith("#") ||
        target === "_blank" ||
        (e as MouseEvent).metaKey ||
        (e as MouseEvent).ctrlKey ||
        (e as MouseEvent).shiftKey ||
        (e as MouseEvent).altKey
      )
        return;

      overlayRef.current = true;
      setActive(true);
      setShowSpinner(true);
      const reset = setTimeout(() => {
        overlayRef.current = false;
        setShowSpinner(false);
        setActive(false);
      }, 5000);
      const clearOnNav = () => clearTimeout(reset);
      window.addEventListener("popstate", clearOnNav, { once: true });
    }

    function onPopState() {
      overlayRef.current = true;
      setActive(true);
      setShowSpinner(true);
      setTimeout(() => {
        overlayRef.current = false;
        setShowSpinner(false);
        setActive(false);
      }, 5000);
    }

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <>
      <TopBar active={active} />
      {showSpinner && (
        <>
          {/* overlay beneath spinner to dim and block interaction */}
          <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in" />
          <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl animate-scale-in">
              <AnimatedLogo />
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes gradient-shift {
          0%,
          100% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(-20%);
          }
        }

        @keyframes logo-piece-1 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(3px, -3px);
          }
          50% {
            transform: translate(0, 0);
          }
          75% {
            transform: translate(-2px, 2px);
          }
        }

        @keyframes logo-piece-2 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-3px, 3px);
          }
          50% {
            transform: translate(0, 0);
          }
          75% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 3s ease-in-out infinite;
        }

        .animate-logo-piece-1 {
          animation: logo-piece-1 2s ease-in-out infinite;
        }

        .animate-logo-piece-2 {
          animation: logo-piece-2 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
