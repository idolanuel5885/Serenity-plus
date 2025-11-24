'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getUserByReturnToken } from '../../lib/supabase-database';

function ReturnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const restoreUserIdentity = async () => {
      try {
        // Get token from URL query parameter
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setErrorMessage('No return token provided. Please check your email link.');
          return;
        }

        console.log('Return link accessed with token:', token.substring(0, 10) + '...');

        // Look up user by return token
        const user = await getUserByReturnToken(token);

        if (!user) {
          setStatus('error');
          setErrorMessage('This link is not valid. Please request a new one or contact support.');
          return;
        }

        console.log('User found by return token:', user.id);

        // Restore user identity in localStorage
        // Clear any existing anonymous session data first
        const keysToPreserve = ['pendingInviteCode']; // Keep invite codes if present
        const preservedData: Record<string, string | null> = {};
        keysToPreserve.forEach(key => {
          preservedData[key] = localStorage.getItem(key);
        });

        // Clear all localStorage (except preserved keys)
        localStorage.clear();

        // Restore preserved data
        Object.entries(preservedData).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(key, value);
          }
        });

        // Set user identity
        localStorage.setItem('userId', user.id);
        localStorage.setItem('supabaseUserId', user.id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userWeeklyTarget', user.weeklytarget.toString());
        localStorage.setItem('userUsualSitLength', user.usualsitlength.toString());
        localStorage.setItem('userInviteCode', user.invitecode);
        
        // Store pairing status if needed
        if (user.pairingstatus) {
          localStorage.setItem('userPairingStatus', user.pairingstatus);
        }

        console.log('✅ User identity restored:', {
          id: user.id,
          name: user.name,
          email: user.email,
        });

        setStatus('success');

        // Redirect to home page after a brief delay
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error) {
        console.error('Error restoring user identity:', error);
        setStatus('error');
        setErrorMessage('An error occurred while restoring your account. Please try again or contact support.');
      }
    };

    restoreUserIdentity();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Restoring your lotus...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Serenity+" width={24} height={24} className="w-6 h-6" />
            <span className="font-bold text-lg">Serenity+</span>
          </div>
        </div>

        <div className="px-6 py-8 flex-1 flex flex-col items-center justify-center">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Not Valid</h1>
            <p className="text-gray-700 mb-8">{errorMessage}</p>
            <button
              onClick={() => router.push('/welcome')}
              className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Go to Welcome Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state (briefly shown before redirect)
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-gray-700">Your lotus has been restored!</p>
        <p className="text-sm text-gray-600 mt-2">Redirecting to your home...</p>
      </div>
    </div>
  );
}

export default function ReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      }
    >
      <ReturnPageContent />
    </Suspense>
  );
}
