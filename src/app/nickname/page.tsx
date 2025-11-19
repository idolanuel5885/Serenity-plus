'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NicknamePage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Debug: Check if pendingInviteCode exists when user reaches nickname page
    const pendingInviteCode = localStorage.getItem('pendingInviteCode');
    console.log('Nickname page: pendingInviteCode exists:', pendingInviteCode);
    console.log('Nickname page: All localStorage keys:', Object.keys(localStorage));
  }, []);

  const validateNickname = (name: string) => {
    if (name.length < 2) return 'Nickname must be at least 2 characters';
    if (name.length > 20) return 'Nickname must be 20 characters or less';
    if (!/^[a-zA-Z0-9\s]+$/.test(name))
      return 'Nickname can only contain letters, numbers, and spaces';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateNickname(nickname);

    if (validationError) {
      setError(validationError);
      return;
    }

    // Store nickname in localStorage
    localStorage.setItem('userNickname', nickname);

    // Redirect to next step
    router.push('/meditations-per-week');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Serenity+" width={24} height={24} className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">What should we call you?</h1>
          <p className="text-sm text-gray-700 mb-8">You can change this later.</p>

          <div className="flex-1">
            <input
              type="text"
              placeholder="e.g., Ido"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg text-black focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="mt-6"
          style={{ 
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)',
            marginBottom: '1rem'
          }}
        >
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
