'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EmailPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateEmail(email);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email in localStorage
      localStorage.setItem('userEmail', email.trim().toLowerCase());

      // Redirect to next step
      router.push('/meditations-per-week');
    } catch (error) {
      console.error('Error storing email:', error);
      setError('Failed to save email. Please try again.');
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Save your lotus</h1>
          <p className="text-sm text-gray-700 mb-8">
            Enter your email so you can come back to your lotus and partner from any device. No passwords, no spam — just one link.
          </p>

          <div className="flex-1">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={isSubmitting}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg text-black focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="email"
              autoFocus
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
            disabled={!email.trim() || isSubmitting}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer relative"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving...</span>
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

