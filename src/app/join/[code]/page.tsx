'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const [code, setCode] = useState<string>('');
  const [inviterName, setInviterName] = useState('Your Partner');
  // const [loading] = useState(true) // Unused for now

  useEffect(() => {
    // Resolve the params promise
    params.then(({ code: resolvedCode }) => {
      setCode(resolvedCode);
    });
  }, [params]);

  useEffect(() => {
    if (!code) return;
    const getInviterInfo = async () => {
      try {
        // Store the invite code for later use
        localStorage.setItem('pendingInviteCode', code);

        if (code.includes('invite-')) {
          // Note: Invite API calls removed as they are not used by the app
          // Set inviter name to default since we can't fetch from broken API
          setInviterName('Your Partner');
        } else {
          // Handle demo codes
          const demoNames: Record<string, string> = {
            demo123: 'Ido',
            test456: 'Alex',
            sample789: 'Jordan',
          };
          setInviterName(demoNames[code] || 'Your Partner');
        }
      } catch (error) {
        console.error('Error getting inviter info:', error);
        setInviterName('Your Partner');
      } finally {
        // Loading state removed
      }
    };

    getInviterInfo();
  }, [code]);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Join Meditation Partnership</h1>
          <p className="text-lg text-gray-600">
            You&apos;re joining {inviterName}&apos;s meditation partnership.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">{inviterName}</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
              <img
                src="/icons/meditation-1.svg"
                alt="Partner's meditation icon"
                className="w-8 h-8"
              />
            </div>
            <div>
              <p className="font-medium">Meditation Partner</p>
              <p className="text-sm text-gray-600">Ready to start your journey together</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <p className="text-gray-600">Set up your meditation preferences</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <p className="text-gray-600">Start your meditation journey together</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <p className="text-gray-600">Support each other&apos;s practice</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <form action={`/welcome?invite=${code}`} method="get">
            <input type="hidden" name="invite" value={code} />
            <button
              type="submit"
              onClick={() => {
                // Store the invite code for partnership linking
                if (typeof window !== 'undefined') {
                  localStorage.setItem('pendingInviteCode', code);
                  console.log('Stored invite code for partnership:', code);
                }
              }}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-center block hover:bg-blue-700 transition-colors"
            >
              Accept Partnership
            </button>
          </form>
          <Link
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold text-center block hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
