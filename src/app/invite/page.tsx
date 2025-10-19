'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getInviteCode = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName') || localStorage.getItem('userNickname');

        if (!userId || !userName) {
          console.log('No user data found, redirecting to welcome.');
          router.push('/welcome');
          return;
        }

        if (userId && userName) {
          // Check if user already has an invite code
          let existingInviteCode = localStorage.getItem('userInviteCode');

          if (!existingInviteCode) {
            // First, try to get the user's existing invite code from the database
            try {
              const userResponse = await fetch(`/api/user?userId=${userId}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.user && userData.user.invitecode) {
                  existingInviteCode = userData.user.invitecode;
                  if (existingInviteCode) {
                    localStorage.setItem('userInviteCode', existingInviteCode);
                    console.log(
                      '=== INVITE PAGE: Found existing user invite code ===',
                      existingInviteCode,
                    );
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching user invite code:', error);
            }
          }

          if (!existingInviteCode) {
            // Create a new invite via API only if user doesn't have one
            console.log('=== INVITE PAGE: Creating new invite record ===');
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
              console.log('=== INVITE PAGE: Stored userInviteCode ===', data.inviteCode);
              console.log('Created new invite code via API:', data.inviteCode);
              console.log('=== INVITE PAGE: API Response ===', data);
            } else {
              throw new Error('Failed to create invite');
            }
          } else {
            console.log('Using existing invite code:', existingInviteCode);
          }

          setInviteCode(existingInviteCode || 'demo123');
        } else {
          // Fallback to demo code
          setInviteCode('demo123');
        }
      } catch (error) {
        console.error('Error getting invite code:', error);
        setInviteCode('demo123'); // Fallback in case of API error
      } finally {
        setLoading(false);
      }
    };

    getInviteCode();
  }, [router]);

  useEffect(() => {
    if (inviteCode) {
      const inviteUrl = `${window.location.origin}/welcome?invite=${inviteCode}`;
      QRCode.toDataURL(inviteUrl, { width: 256 }, (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return;
        }
        setQrCodeDataUrl(url || '');
      });
    }
  }, [inviteCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/welcome?invite=${inviteCode}`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="flex items-center justify-between p-6 border-b border-gray-200">
        <Image src="/logo.svg" alt="Serenity+" width={24} height={24} className="w-6 h-6" />
        <span className="text-sm font-medium">Serenity+</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Invite a Partner</h1>
        <p className="text-gray-600 mb-8">
          Share this link with a person you'd like to meditate with.
        </p>

        {qrCodeDataUrl ? (
          <div className="mb-8 p-4 border border-gray-300 rounded-lg">
            <Image src={qrCodeDataUrl} alt="QR Code" width={192} height={192} className="w-48 h-48 mx-auto" />
          </div>
        ) : (
          <div className="mb-8 p-4 border border-gray-300 rounded-lg w-48 h-48 flex items-center justify-center">
            <p className="text-gray-500">Loading QR Code...</p>
          </div>
        )}

        <div className="w-full max-w-md mb-8">
          <label
            htmlFor="invite-link"
            className="block text-sm font-medium text-gray-700 text-left mb-2"
          >
            Your Invite Link
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <input
              type="text"
              id="invite-link"
              readOnly
              value={shareLink}
              className="flex-1 p-3 text-sm text-gray-900 bg-gray-50 focus:outline-none"
            />
            <button
              onClick={() => navigator.clipboard.writeText(shareLink)}
              className="bg-gray-200 text-gray-700 px-4 py-3 text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        <Link href="/" className="w-full max-w-xs">
          <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Go to Homepage
          </button>
        </Link>
      </main>

      <footer className="mt-auto p-6 border-t border-gray-200 flex items-center justify-center">
        <Image src="/logo.svg" alt="Serenity+" width={24} height={24} className="w-6 h-6 mr-2" />
        <span className="text-sm text-gray-600">Serenity+</span>
      </footer>
    </div>
  );
}
