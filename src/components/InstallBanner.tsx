'use client';

import { useState, useEffect } from 'react';
import {
  isPWAInstalled,
  isIOS,
  isAndroid,
  isMobileDevice,
  isInstallBannerDismissed,
  dismissInstallBanner,
} from '../lib/pwa-install-detection';

interface InstallBannerProps {
  onInstall?: () => void;
}

export default function InstallBanner({ onInstall }: InstallBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Check if banner should be shown
    const shouldShow = () => {
      // Don't show if already installed
      if (isPWAInstalled()) {
        return false;
      }

      // Don't show if dismissed
      if (isInstallBannerDismissed()) {
        return false;
      }

      // Only show on mobile
      if (!isMobileDevice()) {
        return false;
      }

      return true;
    };

    // Detect platform
    const ios = isIOS();
    const android = isAndroid();
    setIsIOSDevice(ios);
    setIsAndroidDevice(android);

    // Handle Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt(e);
      
      // Show banner if other conditions are met
      if (shouldShow()) {
        setShowBanner(true);
      }
    };

    // Listen for beforeinstallprompt (Android)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show banner immediately if conditions are met
    // (iOS doesn't fire beforeinstallprompt, so we show instructional banner)
    if (ios && shouldShow()) {
      setShowBanner(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    dismissInstallBanner();
    setShowBanner(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the native install prompt
      deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferred prompt
      setDeferredPrompt(null);

      // Dismiss banner regardless of outcome
      dismissInstallBanner();
      setShowBanner(false);

      if (onInstall) {
        onInstall();
      }
    }
  };

  // Don't render if banner shouldn't be shown
  if (!showBanner) {
    return null;
  }

  // iOS banner
  if (isIOSDevice) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Install SerenityPlus</h3>
              <p className="text-xs text-gray-700 mb-2">
                Add it to your home screen for a smoother experience.
              </p>
              <p className="text-xs text-gray-600">
                ① Tap the Share icon · ② Tap &quot;Add to Home Screen&quot;
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // Android banner
  if (isAndroidDevice && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Install SerenityPlus</h3>
              <p className="text-xs text-gray-700">
                Get faster access and a full-screen experience.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Install app
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

