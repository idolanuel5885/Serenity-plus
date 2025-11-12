'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import LotusAnimation from '@/components/LotusAnimation';
import { useLotusProgress } from '@/hooks/useLotusProgress';
import { getUserPartnerships, getPartnerDetails } from '@/lib/supabase-database';

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
  const [partnershipsLoading, setPartnershipsLoading] = useState(true);
  // Initialize timeLeft - will be updated immediately in useEffect on client
  const [timeLeft, setTimeLeft] = useState(15 * 60); // Default 15 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user data and partnerships on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data from localStorage FIRST (synchronously, before any async operations)
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName') || 'You';
        const usualSitLength = parseInt(localStorage.getItem('userUsualSitLength') || '15');

        const userData = {
          id: userId || 'unknown',
          name: userName,
          usualSitLength: usualSitLength,
        };

        // Update state synchronously - this happens immediately
        setUser(userData);
        setTimeLeft(usualSitLength * 60); // Convert minutes to seconds
        console.log('Timer set to:', usualSitLength, 'minutes');
        
        // Set loading to false immediately - timer doesn't need database data to display
        setLoading(false);

        // If no userId, skip database calls
        if (!userId) {
          console.log('No userId found, skipping database calls');
          setPartnershipsLoading(false);
          return;
        }

        // Get partnerships from database (same method as homepage) - do this in background
        try {
          console.log('Timer: Fetching partnerships for userId:', userData.id);
          const existingPartnerships = await getUserPartnerships(userData.id);
          console.log('Timer: Existing partnerships from database:', existingPartnerships);

          if (existingPartnerships.length > 0) {
            // Convert database partnerships to UI format (same as homepage)
            const partnerships = await Promise.all(existingPartnerships.map(async (partnership) => {
              const partnerDetails = await getPartnerDetails(partnership.partnerid);
              return {
                id: partnership.id,
                partner: {
                  id: partnership.partnerid,
                  name: partnerDetails?.name || 'Unknown Partner',
                  email: partnerDetails?.email || '',
                  image: partnerDetails?.image || '/icons/meditation-1.svg',
                  weeklyTarget: partnerDetails?.weeklytarget || 0,
                },
                userSits: partnership.usersits,
                partnerSits: partnership.partnersits,
                weeklyGoal: (partnerDetails?.weeklytarget || 0) + 5, // Calculate from both users' targets (hardcoded for now)
                score: partnership.score,
                currentWeekStart: partnership.currentweekstart,
              };
            }));

            console.log('Found existing partnerships:', partnerships);
            setPartnerships(partnerships);
            setPartnershipsLoading(false);
          } else {
            console.log('Timer: No partnerships found in database, retrying in 2 seconds...');
            // Retry after a short delay in case partnerships are still being created
            setTimeout(async () => {
              try {
                console.log('Timer: Retrying partnership fetch...');
                const retryPartnerships = await getUserPartnerships(userData.id);
                console.log('Timer: Retry partnerships result:', retryPartnerships);
                
                if (retryPartnerships.length > 0) {
                  const partnerships = await Promise.all(retryPartnerships.map(async (partnership) => {
                    const partnerDetails = await getPartnerDetails(partnership.partnerid);
                    return {
                      id: partnership.id,
                      partner: {
                        id: partnership.partnerid,
                        name: partnerDetails?.name || 'Unknown Partner',
                        email: partnerDetails?.email || '',
                        image: partnerDetails?.image || '/icons/meditation-1.svg',
                        weeklyTarget: partnerDetails?.weeklytarget || 0,
                      },
                      userSits: partnership.usersits,
                      partnerSits: partnership.partnersits,
                      weeklyGoal: (partnerDetails?.weeklytarget || 0) + 5,
                      score: partnership.score,
                      currentWeekStart: partnership.currentweekstart,
                    };
                  }));
                  console.log('Timer: Found partnerships on retry:', partnerships);
                  setPartnerships(partnerships);
                  setPartnershipsLoading(false);
                } else {
                  console.log('Timer: Still no partnerships found after retry');
                  setPartnerships([]);
                  setPartnershipsLoading(false);
                }
              } catch (retryError) {
                console.log('Timer: Retry failed:', retryError);
                setPartnerships([]);
                setPartnershipsLoading(false);
              }
            }, 2000);
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
          setPartnershipsLoading(false);
          } else {
            console.log('No partnerships found in localStorage either');
            setPartnerships([]);
            setPartnershipsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to default
        setUser({ id: 'unknown', name: 'You', usualSitLength: 15 });
        setTimeLeft(15 * 60);
        setLoading(false);
        setPartnershipsLoading(false);
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
  }, [isRunning]); // Removed timeLeft from dependencies

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    setIsRunning(true);
    setIsCompleted(false);
    
    // Create session record when starting
    if (partnershipId && user?.id) {
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
            sessionStarted: true
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Session started:', result.data);
          // Store the session ID for later use when completing the session
          if (result.data?.sessionId) {
            setCurrentSessionId(result.data.sessionId);
            console.log('Stored session ID:', result.data.sessionId);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to create session:', errorData);
        }
      } catch (error) {
        console.error('Error starting session:', error);
      }
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(user?.usualSitLength ? user.usualSitLength * 60 : 15 * 60);
    setIsCompleted(false);
    setCurrentSessionId(null); // Clear session ID on reset
  };

  // Get partnership data for lotus progress
    const partnership = partnerships[0];
  const partnershipId = partnership?.id || '';
  
  // Debug logging for lotus progress
  console.log('Timer: Partnerships loaded:', partnerships);
  console.log('Timer: First partnership:', partnership);
  console.log('Timer: Partnership ID:', partnershipId);
  
  // Memoize the lotus progress hook parameters to prevent infinite re-renders
  // Update when meditation state changes OR when timeLeft changes significantly (every 5 seconds)
  const lotusProgressParams = useMemo(() => {
    const sessionElapsed = user?.usualSitLength ? (user.usualSitLength * 60) - timeLeft : undefined;
    const sessionDuration = user?.usualSitLength ? user.usualSitLength * 60 : undefined;
    
    console.log('Timer: About to call useLotusProgress with:', {
      userId: user?.id,
      partnershipId,
      isMeditationActive: isRunning,
      sessionDuration,
      sessionElapsed
    });
    
    return {
      userId: user?.id || '',
      partnershipId,
      isMeditationActive: isRunning,
      sessionDuration,
      sessionElapsed
    };
  }, [user?.id, partnershipId, isRunning, user?.usualSitLength, timeLeft]); // Update every second for smooth animation

  // Use lotus progress hook (only if we have a real partnership ID)
  const { progressData } = useLotusProgress(lotusProgressParams);


  // Calculate progress for lotus animation (individual per user)
  const getLotusProgress = () => {
    if (!partnership) return 0;
    
    // If we have API data, use it
    if (progressData) {
      return progressData.currentProgress;
    }
    
    // Fallback calculation for static export (localStorage-based)
    const totalSits = 5 + partnership.partner.weeklyTarget; // Hardcoded for now
    const completedSits = partnership.userSits + partnership.partnerSits;
    const baseProgress = (completedSits / totalSits) * 100;
    
    // Add current session progress if running or just completed
    if ((isRunning || isCompleted) && user?.usualSitLength) {
      const sessionProgress = ((user.usualSitLength * 60 - timeLeft) / (user.usualSitLength * 60)) * 100;
      const sessionContribution = (1 / totalSits) * 100;
      return Math.min(baseProgress + (sessionProgress / 100) * sessionContribution, 100);
    }
    
    return baseProgress;
  };

  // Track if session completion is in progress to prevent duplicate calls
  const isCompletingRef = useRef(false);
  const completionCallIdRef = useRef<string | null>(null);

  // Handle meditation completion - update database
  const completeSession = useCallback(async (completed: boolean) => {
    if (!partnershipId || !user?.id) {
      console.log('⏭️ Timer: completeSession skipped - missing partnershipId or userId');
      return;
    }
    
    // Generate a unique call ID for this completion attempt
    const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prevent duplicate calls
    if (isCompletingRef.current) {
      console.log('⚠️ Timer: completeSession already in progress, skipping duplicate call');
      console.log('Previous call ID:', completionCallIdRef.current);
      console.log('Current call ID:', callId);
      return;
    }

    isCompletingRef.current = true;
    completionCallIdRef.current = callId;
    
    console.log('=== TIMER: Calling session-complete API ===');
    console.log('Call ID:', callId);
    console.log('Timer: completeSession called with:', { 
      completed, 
      userId: user.id, 
      partnershipId, 
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

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
          completed,
          sessionId: currentSessionId // Include the stored session ID
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Timer: Session completion API response:', result.data);
        console.log('Call ID:', callId);
        
        if (result.data?.duplicate) {
          console.log('⚠️ Timer: API detected duplicate - session was already completed');
        }
        
        if (result.data?.weekUpdated === false) {
          console.log('⚠️ Timer: Week was NOT updated (likely duplicate)');
        } else if (result.data?.weekUpdated === true) {
          console.log('✅ Timer: Week was successfully updated');
        }
        
        // Refresh partnership data if needed
        if (completed) {
          // You could trigger a refetch of partnership data here
          console.log('Progress updated in database');
        }
      } else {
        console.error('❌ Timer: Session completion failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        console.log('Call ID:', callId);
      }
    } catch (error) {
      console.error('❌ Timer: Error completing session:', error);
      console.log('Call ID:', callId);
    } finally {
      // Clear session ID after completion attempt
      setCurrentSessionId(null);
      // Reset the completion flag
      isCompletingRef.current = false;
      completionCallIdRef.current = null;
      console.log('🔄 Timer: Reset completion flag, call ID cleared');
    }
  }, [partnershipId, user?.id, user?.usualSitLength, currentSessionId]);

  // Handle meditation completion
  useEffect(() => {
    console.log('🔄 Timer: useEffect triggered', { isCompleted, hasCompleteSession: !!completeSession });
    if (isCompleted) {
      console.log('🔄 Timer: useEffect - isCompleted is true, calling completeSession(true)');
      completeSession(true);
    } else {
      console.log('Timer: useEffect - isCompleted is false, not calling completeSession');
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

          {partnershipsLoading ? (
            <div className="w-64 h-64 mx-auto flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : partnership ? (
            <LotusAnimation
              progress={getLotusProgress()}
              isActive={isRunning}
              duration={user?.usualSitLength ? user.usualSitLength * 60 : 0}
              elapsed={user?.usualSitLength ? (user.usualSitLength * 60) - timeLeft : 0}
            />
          ) : null}
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
