'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MeditationsPerWeekPage() {
  const [selectedCount, setSelectedCount] = useState<number>(5);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const router = useRouter();

  const meditationCounts = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    // Check if user came through an invite
    const pendingInviteCode = localStorage.getItem('pendingInviteCode');
    if (pendingInviteCode) {
      // Note: Invite API calls removed as they are not used by the app
      // Set partner name to default since we can't fetch from broken API
      setPartnerName('Your Partner');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store selection in localStorage
    localStorage.setItem('userWeeklyTarget', selectedCount.toString());
    console.log('Stored weekly target:', selectedCount);

    // Redirect to next step
    router.push('/meditation-length');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            How many times a week do you want to meditate?
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            This will be your weekly commitment to yourself and to{' '}
            {partnerName ? partnerName : 'your future meditation partner'}
          </p>

          <div className="flex-1">
            <select
              value={selectedCount}
              onChange={(e) => setSelectedCount(parseInt(e.target.value))}
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg text-lg text-black focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px',
              }}
            >
              {meditationCounts.map((count) => (
                <option key={count} value={count} className="text-black">
                  {count} {count === 1 ? 'time' : 'times'} per week
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
