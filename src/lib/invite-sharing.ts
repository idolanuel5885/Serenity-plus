/**
 * Utility functions for sharing invite links using native Web Share API
 * with fallback to copy link and app-specific sharing options
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Get or create an invite code for the current user
 * In production, invite codes are stored in the users table's invitecode field
 * Reuses logic from the invite page to ensure consistency
 */
export async function getOrCreateInviteCode(): Promise<string> {
  try {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || localStorage.getItem('userNickname');

    if (!userId || !userName) {
      throw new Error('User not authenticated');
    }

    // Check localStorage first
    let existingInviteCode = localStorage.getItem('userInviteCode');

    if (!existingInviteCode) {
      // Try to get from database (users table - production schema)
      try {
        const userResponse = await fetch(`/api/user?userId=${userId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user && userData.user.invitecode) {
            existingInviteCode = userData.user.invitecode;
            if (existingInviteCode) {
              localStorage.setItem('userInviteCode', existingInviteCode);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user invite code:', error);
      }
    }

    // If still no invite code, try to create one via API
    // Note: This may fail in production if invitations table doesn't exist
    // In that case, we'll generate a client-side fallback
    if (!existingInviteCode) {
      try {
        const response = await fetch('/api/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            userName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          existingInviteCode = data.inviteCode;
          localStorage.setItem('userInviteCode', data.inviteCode);
        } else {
          // API failed (likely because invitations table doesn't exist in production)
          // Generate a client-side invite code as fallback
          console.warn('API invite creation failed, using client-side fallback');
          existingInviteCode = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('userInviteCode', existingInviteCode);
        }
      } catch (error) {
        // Network error or other issue - use client-side fallback
        console.warn('Error creating invite via API, using client-side fallback:', error);
        existingInviteCode = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userInviteCode', existingInviteCode);
      }
    }

    return existingInviteCode || '';
  } catch (error) {
    console.error('Error getting or creating invite code:', error);
    throw error;
  }
}

/**
 * Construct the invite link URL
 */
export function constructInviteLink(inviteCode: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return `${window.location.origin}/welcome?invite=${inviteCode}`;
}

/**
 * Prepare share data with default message
 * Note: For Web Share API, we put the link only in the URL field to avoid duplication
 * For app-specific URLs (email, WhatsApp, SMS), we'll include the link in the text
 */
export function prepareShareData(inviteLink: string): ShareData {
  return {
    title: 'Meditate with me on Serenity+',
    text: 'Hey I started using this app accountability-partnership app to meditate and I want you to be my partner!',
    url: inviteLink,
  };
}

/**
 * Attempt to share using native Web Share API
 * Returns true if share was successful, false if not available or cancelled
 */
export async function shareWithWebAPI(shareData: ShareData): Promise<boolean> {
  // Check if Web Share API is available
  if (!navigator.share) {
    return false;
  }

  // Check if we can share the URL (some browsers require URL to be shareable)
  if (!navigator.canShare || !navigator.canShare(shareData)) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true; // Share was successful
  } catch (error: any) {
    // User cancelled or share failed
    // Don't treat cancellation as an error
    if (error.name === 'AbortError') {
      return false; // User cancelled, not an error
    }
    console.error('Error sharing:', error);
    return false; // Share failed
  }
}

/**
 * Copy invite link to clipboard
 */
export async function copyInviteLink(inviteLink: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(inviteLink);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Detect if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for touch screen
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUserAgent = mobileRegex.test(userAgent);
  
  // Check screen width (mobile typically < 768px)
  const isSmallScreen = window.innerWidth < 768;
  
  // Consider it mobile if it has touch screen AND (mobile user agent OR small screen)
  return hasTouchScreen && (isMobileUserAgent || isSmallScreen);
}

/**
 * Generate share URLs for specific apps
 * Includes the link in the message for app-specific sharing
 */
export function getAppShareUrls(shareData: ShareData): {
  email: string;
  whatsapp: string;
  facebookMessenger: string;
} {
  const { text, url } = shareData;
  // Include link in message for app-specific sharing
  const fullMessage = `${text}\n\n${url}`;

  return {
    email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(fullMessage)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
    facebookMessenger: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fullMessage)}`,
  };
}

/**
 * Main function to handle invite sharing
 * Returns the invite link and whether native share was used
 * On desktop browsers, always uses fallback modal (skips Web Share API)
 * On mobile devices, tries Web Share API first, falls back to modal if unavailable
 */
export async function shareInvite(): Promise<{
  success: boolean;
  inviteLink: string;
  usedNativeShare: boolean;
  error?: string;
}> {
  try {
    // Get or create invite code
    const inviteCode = await getOrCreateInviteCode();
    if (!inviteCode) {
      return {
        success: false,
        inviteLink: '',
        usedNativeShare: false,
        error: 'Unable to create invite code',
      };
    }

    // Construct invite link
    const inviteLink = constructInviteLink(inviteCode);

    // Prepare share data
    const shareData = prepareShareData(inviteLink);

    // On desktop, skip Web Share API and always use fallback modal
    // This gives us full control over what options appear
    if (!isMobileDevice()) {
      console.log('Desktop browser detected - using fallback modal');
      return {
        success: true,
        inviteLink,
        usedNativeShare: false,
      };
    }

    // On mobile, try native share first
    const nativeShareSuccess = await shareWithWebAPI(shareData);

    if (nativeShareSuccess) {
      return {
        success: true,
        inviteLink,
        usedNativeShare: true,
      };
    }

    // Native share not available or was cancelled
    // Return link for fallback UI
    return {
      success: true,
      inviteLink,
      usedNativeShare: false,
    };
  } catch (error: any) {
    console.error('Error in shareInvite:', error);
    return {
      success: false,
      inviteLink: '',
      usedNativeShare: false,
      error: error.message || 'Failed to share invite',
    };
  }
}

