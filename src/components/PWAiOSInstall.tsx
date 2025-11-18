'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Share2, Download } from 'lucide-react';

export function PWAiOSInstall() {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('PWAiOSInstall: Checking iOS conditions...');
    
    // Check if it's iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('PWAiOSInstall: iOS:', isIOS);
    console.log('PWAiOSInstall: Safari:', isSafari);
    console.log('PWAiOSInstall: Standalone:', isStandalone);
    
    // Show banner if it's iOS Safari and not installed
    if (isIOS && isSafari && !isStandalone) {
      console.log('PWAiOSInstall: Showing install banner');
      setShowInstallBanner(true);
    }
    
    if (isStandalone) {
      setIsInstalled(true);
    }
  }, []);

  const handleClose = () => {
    setShowInstallBanner(false);
  };

  if (isInstalled || !showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">Cài đặt Lingofy</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3">
        Để cài đặt ứng dụng, hãy nhấn nút chia sẻ 
        <Share2 className="inline h-4 w-4 mx-1" /> 
        và chọn "Thêm vào màn hình chính"
      </p>
      <div className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Share2 className="h-5 w-5 text-blue-500" />
            <span className="mx-2 text-2xl">→</span>
            <Download className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Nhấn chia sẻ → Thêm vào màn hình chính
          </p>
        </div>
      </div>
    </div>
  );
}