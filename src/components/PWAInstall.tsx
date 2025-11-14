'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('PWAInstall: Initializing...');
    
    const handler = (e: Event) => {
      console.log('PWAInstall: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWAInstall: App is already in standalone mode');
      setIsInstalled(true);
    } else {
      console.log('PWAInstall: App is not in standalone mode');
    }

    // Additional check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    console.log('PWAInstall: iOS detected:', isIOS);
    console.log('PWAInstall: Safari detected:', isSafari);
    console.log('PWAInstall: User agent:', navigator.userAgent);

    // Check if PWA criteria is met (for debugging)
    const checkPWACriteria = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('PWAInstall: Service Worker ready:', registration);
      }
      
      // Check manifest
      const manifestLink = document.querySelector('link[rel="manifest"]');
      console.log('PWAInstall: Manifest link found:', manifestLink);
      
      if (manifestLink) {
        try {
          const response = await fetch(manifestLink.href);
          const manifest = await response.json();
          console.log('PWAInstall: Manifest loaded:', manifest);
        } catch (error) {
          console.error('PWAInstall: Manifest loading failed:', error);
        }
      }
    };
    
    checkPWACriteria();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallButton(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowInstallButton(false);
  };

  if (isInstalled || !showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">Cài đặt LinguaFlash</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3">
        Cài đặt ứng dụng để truy cập nhanh và học offline
      </p>
      <Button
        onClick={handleInstallClick}
        size="sm"
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Cài đặt
      </Button>
    </div>
  );
}