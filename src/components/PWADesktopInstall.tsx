'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export function PWADesktopInstall() {
  const [showManualInstall, setShowManualInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('PWADesktopInstall: Checking desktop conditions...');
    
    // Check if it's desktop
    const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('PWADesktopInstall: isDesktop:', isDesktop);
    console.log('PWADesktopInstall: isStandalone:', isStandalone);
    
    if (isStandalone) {
      setIsInstalled(true);
    } else if (isDesktop) {
      // Show manual install option for desktop
      setShowManualInstall(true);
    }
  }, []);

  const handleManualInstall = () => {
    // For desktop, show instructions for manual installation
    alert('Để cài đặt LinguaFlash trên desktop:\n\n1. Chrome/Edge: Nhấn nút ba chấm (⋮) ở góc trên phải → "Cài đặt ứng dụng"\n2. Firefox: Không hỗ trợ cài đặt PWA\n3. Safari Mac: Không hỗ trợ cài đặt PWA\n\nHoặc tìm "Cài đặt LinguaFlash" trong menu của trình duyệt.');
  };

  if (isInstalled || !showManualInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">Cài đặt LinguaFlash</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowManualInstall(false)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </Button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Cài đặt ứng dụng để truy cập nhanh và học offline
      </p>
      <div className="space-y-2">
        <Button
          onClick={handleManualInstall}
          size="sm"
          className="w-full"
          variant="outline"
        >
          <Info className="h-4 w-4 mr-2" />
          Hướng dẫn cài đặt
        </Button>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Hoặc tìm "Cài đặt LinguaFlash" trong menu trình duyệt
        </div>
      </div>
    </div>
  );
}