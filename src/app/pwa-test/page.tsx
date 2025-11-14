'use client';

import { useState, useEffect } from 'react';

export default function PWATest() {
  const [pwaStatus, setPwaStatus] = useState({
    serviceWorker: false,
    manifest: false,
    standalone: false,
    installable: false,
    userAgent: '',
    platform: ''
  });

  useEffect(() => {
    const checkPWAStatus = async () => {
      const status = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: false,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        installable: false,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      };

      // Check manifest
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          const response = await fetch(manifestLink.href);
          status.manifest = response.ok;
        }
      } catch (error) {
        console.error('Manifest check failed:', error);
      }

      // Check if installable (basic check)
      status.installable = status.serviceWorker && status.manifest && !status.standalone;

      setPwaStatus(status);
    };

    checkPWAStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">PWA Test Page</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">PWA Status</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Service Worker:</span>
              <span className={`px-2 py-1 rounded text-sm md:text-base ${
                pwaStatus.serviceWorker ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {pwaStatus.serviceWorker ? '✅ Available' : '❌ Not Available'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Web App Manifest:</span>
              <span className={`px-2 py-1 rounded text-sm md:text-base ${
                pwaStatus.manifest ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {pwaStatus.manifest ? '✅ Found' : '❌ Not Found'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Display Mode:</span>
              <span className={`px-2 py-1 rounded text-sm md:text-base ${
                pwaStatus.standalone ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {pwaStatus.standalone ? '📱 Standalone' : '🌐 Browser'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Installable:</span>
              <span className={`px-2 py-1 rounded text-sm md:text-base ${
                pwaStatus.installable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {pwaStatus.installable ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Device Info</h3>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Platform:</strong> {pwaStatus.platform}</p>
              <p><strong>User Agent:</strong> {pwaStatus.userAgent}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Installation Instructions</h3>
            <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 space-y-2">
              {pwaStatus.installable ? (
                <>
                  <p>✅ Ứng dụng có thể cài đặt!</p>
                  <p>• Trên mobile: Popup cài đặt sẽ tự động xuất hiện</p>
                  <p>• Trên desktop: Vào menu trình duyệt → "Cài đặt LinguaFlash"</p>
                </>
              ) : (
                <>
                  <p>❌ Ứng dụng chưa đủ điều kiện để cài đặt</p>
                  <p>• Kiểm tra HTTPS và Service Worker</p>
                  <p>• Kiểm tra Web App Manifest</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">Debug Tips</h3>
          <ul className="text-sm md:text-base text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Mở Developer Tools (F12) để xem console logs</li>
            <li>• Kiểm tra Application tab → Service Workers</li>
            <li>• Kiểm tra Application tab → Manifest</li>
            <li>• Thử reload trang (F5) để kích hoạt service worker</li>
          </ul>
        </div>
      </div>
    </div>
  );
}