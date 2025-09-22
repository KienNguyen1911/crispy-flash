'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

function TopBar({ active }: { active: boolean }) {
  return (
    <div
      className={`fixed top-0 left-0 h-[3px] bg-sky-500 z-[9999] transition-all duration-300 ease-linear ${active ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
      style={{ boxShadow: active ? '0 0 20px rgba(59,130,246,0.5)' : 'none' }}
    />
  );
}

export default function PageLoader() {
  // usePathname heuristic: show a subtle progress bar/spinner when pathname changes.
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
      // navigation occurred; if overlay was set by click/popstate, keep it until navigation completes
      if (!overlayRef.current) {
        // no prior click recorded — show topbar + spinner as fallback
        setActive(true);
        setShowSpinner(true);
      }

      // hide overlay/spinner shortly after pathname changes to allow new content to paint
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
    // capture clicks on internal links to show overlay immediately before navigation
    function onDocumentClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest && (e.target as HTMLElement).closest('a');
      if (!el) return;
      const href = (el as HTMLAnchorElement).getAttribute('href');
      const target = (el as HTMLAnchorElement).getAttribute('target');
      if (!href) return;
      // ignore external links, mailto, tel, hashes-only on same page, and downloads/new-tab
      if (href.startsWith('http') && !href.startsWith(location.origin)) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('#') || target === '_blank' || (e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey || (e as MouseEvent).shiftKey || (e as MouseEvent).altKey) return;

      // It's an internal navigation — show overlay immediately
      overlayRef.current = true;
      setActive(true);
      setShowSpinner(true);
      // if navigation doesn't happen, ensure we reset after a timeout
      const reset = setTimeout(() => {
        overlayRef.current = false;
        setShowSpinner(false);
        setActive(false);
      }, 5000);
      // clear timeout if navigation completes (handled by pathname effect)
      const clearOnNav = () => clearTimeout(reset);
      window.addEventListener('popstate', clearOnNav, { once: true });
    }

    function onPopState() {
      // user used back/forward — show overlay
      overlayRef.current = true;
      setActive(true);
      setShowSpinner(true);
      setTimeout(() => {
        // safety: clear after 5s if no navigation
        overlayRef.current = false;
        setShowSpinner(false);
        setActive(false);
      }, 5000);
    }

    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return (
    <> 
      <TopBar active={active} />
      {showSpinner && (
        <>
          {/* overlay beneath spinner to dim and block interaction */}
          <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm transition-opacity" />
          <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto bg-white/60 backdrop-blur-sm rounded-full p-4 shadow-lg">
              <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          </div>
        </>
      )}
    </>
  );
}
