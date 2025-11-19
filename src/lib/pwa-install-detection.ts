/**
 * Utilities for detecting PWA installation state and platform
 */

/**
 * Check if the app is running as an installed PWA/standalone
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for standalone display mode (modern PWA detection)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check for iOS standalone mode (legacy Safari)
  if ((window.navigator as any).standalone === true) {
    return true;
  }

  return false;
}

/**
 * Detect if the user is on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
}

/**
 * Detect if the user is on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

/**
 * Detect if the user is on a mobile device (iOS or Android)
 */
export function isMobileDevice(): boolean {
  return isIOS() || isAndroid();
}

/**
 * Check if the install banner has been dismissed
 */
export function isInstallBannerDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem('serenityplus_install_dismissed') === 'true';
}

/**
 * Mark the install banner as dismissed
 */
export function dismissInstallBanner(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('serenityplus_install_dismissed', 'true');
}

/**
 * Check if user has completed onboarding
 * This checks if userId exists in localStorage (basic check)
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userId = localStorage.getItem('userId');
  return !!userId;
}

