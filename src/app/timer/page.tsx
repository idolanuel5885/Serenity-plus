'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import LotusAnimation from '@/components/LotusAnimation';
import { useLotusProgress } from '@/hooks/useLotusProgress';
import { getUserPartnerships } from '@/lib/supabase-database';

interface User {
  id: string;
  name: string;
  usualSitLength: number;
}

interface Partnership {
  id: string;
  partner: {
    id: string;
    name: string;
    email: string;
    image?: string;
    weeklyTarget: number;
  };
  userSits: number;
  partnerSits: number;
  weeklyGoal: number;
  score: number;
  currentWeekStart: string;
}

export default function TimerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // Default 15 minutes, will be updated when user data loads
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user data and partnerships on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setLoading(false);
          return;
        }

        // Get user data from localStorage (for static export)
        const userName = localStorage.getItem('userName') || 'You';
        const usualSitLength = parseInt(localStorage.getItem('userUsualSitLength') || '15');

        const userData = {
          id: userId,
          name: userName,
          usualSitLength: usualSitLength,
        };

        setUser(userData);
        setTimeLeft(usualSitLength * 60); // Convert minutes to seconds
        console.log('Timer set to:', usualSitLength, 'minutes');

        // Get partnerships from database (same method as homepage)
        try {
          const existingPartnerships = await getUserPartnerships(userData.id);
          console.log('Existing partnerships from database:', existingPartnerships);

          if (existingPartnerships.length > 0) {
            // Convert database partnerships to UI format (same as homepage)
            const partnerships = existingPartnerships.map((partnership) => ({
              id: partnership.id,
              partner: {
                id: partnership.partnerid,
                name: partnership.partnername,
                email: partnership.partneremail,
                image: partnership.partnerimage || '/icons/meditation-1.svg',
                weeklyTarget: partnership.partnerweeklytarget,
              },
              userSits: partnership.usersits,
              partnerSits: partnership.partnersits,
              weeklyGoal: partnership.weeklygoal,
              score: partnership.score,
              currentWeekStart: partnership.currentweekstart,
            }));

            console.log('Found existing partnerships:', partnerships);
            setPartnerships(partnerships);
          } else {
            console.log('No partnerships found in database');
            setPartnerships([]);
          }
        } catch (error) {
          console.log('Error fetching partnerships from database:', error);
          // Fallback to localStorage if database fails
        const partnershipsData = localStorage.getItem('partnerships');
        if (partnershipsData) {
          const partnerships = JSON.parse(partnershipsData);
            console.log('Loaded partnerships from localStorage fallback:', partnerships);
          setPartnerships(partnerships);
          } else {
            console.log('No partnerships found in localStorage either');
            setPartnerships([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to default
        setUser({ id: 'unknown', name: 'You', usualSitLength: 15 });
        setTimeLeft(15 * 60);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(user?.usualSitLength ? user.usualSitLength * 60 : 15 * 60);
    setIsCompleted(false);
  };

  // Get partnership data for lotus progress
    const partnership = partnerships[0];
  const partnershipId = partnership?.id || '';
  
  console.log('Partnerships array:', partnerships);
  console.log('First partnership:', partnership);
  console.log('Partnership ID:', partnershipId);

  // Use lotus progress hook (only if we have a real partnership ID)
  const { progressData } = useLotusProgress({
    userId: user?.id || '',
    partnershipId,
    isMeditationActive: isRunning,
    sessionDuration: user?.usualSitLength ? user.usualSitLength * 60 : undefined,
    sessionElapsed: user?.usualSitLength ? (user.usualSitLength * 60) - timeLeft : undefined
  });


  // Calculate progress for lotus animation (individual per user)
  const getLotusProgress = () => {
    if (!partnership) return 0;
    
    // If we have API data, use it
    if (progressData) {
      return progressData.currentProgress;
    }
    
    // Fallback calculation for static export (localStorage-based)
    const totalSits = partnership.weeklyGoal;
    const completedSits = partnership.userSits + partnership.partnerSits;
    const baseProgress = (completedSits / totalSits) * 100;
    
    // Add current session progress if running
    if (isRunning && user?.usualSitLength) {
      const sessionProgress = ((user.usualSitLength * 60 - timeLeft) / (user.usualSitLength * 60)) * 100;
      const sessionContribution = (1 / totalSits) * 100;
      return Math.min(baseProgress + (sessionProgress / 100) * sessionContribution, 100);
    }
    
    return baseProgress;
  };

  // Handle meditation completion - update database
  const completeSession = useCallback(async (completed: boolean) => {
    if (!partnershipId || !user?.id) return;

    try {
      const response = await fetch('/api/session-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          partnershipId,
          sessionDuration: user.usualSitLength * 60,
          completed
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Session completed:', result.data);
        
        // Refresh partnership data if needed
        if (completed) {
          // You could trigger a refetch of partnership data here
          console.log('Progress updated in database');
        }
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }, [partnershipId, user?.id, user?.usualSitLength]);

  // Handle meditation completion
  useEffect(() => {
    if (isCompleted) {
      completeSession(true);
    }
  }, [isCompleted, completeSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your meditation preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-lg font-bold">Sitting in Progress</h1>
        <div></div>
      </div>

      <div className="p-6 space-y-8">
        {/* Timer */}
        <div className="text-center space-y-6">
          <div className="text-6xl font-mono font-bold">{formatTime(timeLeft)}</div>

          {user && (
            <p className="text-sm text-gray-600">
              Your preferred session: {user.usualSitLength} minutes
            </p>
          )}

          {partnership ? (
            <LotusAnimation
              progress={getLotusProgress()}
              isActive={isRunning}
              duration={user?.usualSitLength ? user.usualSitLength * 60 : 0}
              elapsed={user?.usualSitLength ? (user.usualSitLength * 60) - timeLeft : 0}
            />
          ) : (
            <div className="w-64 h-64 mx-auto flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🧘</div>
                <p className="text-sm">No partnerships yet</p>
                <p className="text-xs mt-1">Find a partner to see the lotus bloom</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {!isCompleted ? (
            <div className="flex gap-4 justify-center">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">Session Complete! 🎉</div>
              <p className="text-gray-600">Great job! You've completed your meditation session.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetTimer}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Another
                </button>
                <Link
                  href="/"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
