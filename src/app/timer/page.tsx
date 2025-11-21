'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import LotusAnimation from '@/components/LotusAnimation';
import { useLotusProgress } from '@/hooks/useLotusProgress';
import { getUserPartnerships, getPartnerDetails } from '@/lib/supabase-database';
import { preloadLotusAnimation } from '@/lib/lotus-animation-cache';

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
  // Check sessionStorage cache SYNCHRONOUSLY during component initialization
  // This prevents the spinner from appearing if cache exists
  const getInitialPartnershipsFromCache = (): { partnerships: Partnership[]; isLoading: boolean } => {
    if (typeof window === 'undefined') {
      return { partnerships: [], isLoading: true };
    }

    try {
      const cachedDataStr = sessionStorage.getItem('cachedPartnerships');
      if (cachedDataStr) {
        const cachedData = JSON.parse(cachedDataStr);
        const cacheAge = Date.now() - (cachedData.timestamp || 0);
        const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

        if (cacheAge < MAX_CACHE_AGE && Array.isArray(cachedData.partnerships)) {
          // Cache exists and is fresh - use it immediately
          const partnerships = cachedData.partnerships.map((p: any) => ({
            id: p.id,
            partner: {
              id: p.partnerid,
              name: p.partnerName || 'Unknown Partner',
              email: p.partnerEmail || '',
              image: p.partnerImage || '/icons/meditation-1.svg',
              weeklyTarget: p.partnerWeeklyTarget || 0,
            },
            userSits: p.userSits || 0,
            partnerSits: p.partnerSits || 0,
            weeklyGoal: p.weeklyGoal || (cachedData.userWeeklyTarget || 5) + (p.partnerWeeklyTarget || 0),
            score: p.score || 0,
            currentWeekStart: p.currentWeekStart || new Date().toISOString(),
          }));

          console.log('✅ Timer: Initialized partnerships from cache during component init (no spinner)');
          return { partnerships, isLoading: false };
        }
      }
    } catch (error) {
      console.warn('Timer: Error reading cache during init:', error);
    }

    // No cache or cache invalid - will need to fetch
    return { partnerships: [], isLoading: true };
  };

  const initialCacheData = getInitialPartnershipsFromCache();

  const [user, setUser] = useState<User | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>(initialCacheData.partnerships);
  const [partnershipsLoading, setPartnershipsLoading] = useState(initialCacheData.isLoading);
  // Track if cache was used during initialization - prevents spinner flash
  const cacheUsedRef = useRef(!initialCacheData.isLoading);
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
        // Preload lotus animation if not already cached (safety measure)
        // Usually cached from homepage, but ensures immediate loading for direct navigation
        preloadLotusAnimation().catch(err => {
          console.warn('Failed to preload lotus animation:', err);
          // Non-blocking - component will fetch if needed
        });

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

        // If we already initialized from cache during component init (partnershipsLoading is false),
        // just refresh in background. Otherwise, fetch from database.
        if (!partnershipsLoading) {
          // Cache was used during initialization - just refresh in background
          console.log('Timer: Cache was used during init, refreshing in background');
          fetchFreshPartnerships(userData.id).catch(err => {
            console.warn('Background partnership refresh failed:', err);
          });
          return; // Exit early, UI already showing cached data
        }

        // No cache or cache expired - fetch from database
        console.log('Timer: No valid cache found, fetching from database');
        await fetchFreshPartnerships(userData.id);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to default
        setUser({ id: 'unknown', name: 'You', usualSitLength: 15 });
        setTimeLeft(15 * 60);
        setLoading(false);
        setPartnershipsLoading(false);
      }
    };

    const fetchFreshPartnerships = async (userId: string) => {
      try {
        console.log('Timer: Fetching fresh partnerships for userId:', userId);
        const existingPartnerships = await getUserPartnerships(userId);
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

            console.log('Timer: Found existing partnerships:', partnerships);
            setPartnerships(partnerships);
            setPartnershipsLoading(false);
            
            // Update cache with fresh data
            try {
              const cachedData = {
                partnerships: partnerships.map(p => ({
                  id: p.id,
                  partnerid: p.partner.id,
                  partnerName: p.partner.name,
                  partnerEmail: p.partner.email,
                  partnerImage: p.partner.image,
                  partnerWeeklyTarget: p.partner.weeklyTarget,
                  userSits: p.userSits,
                  partnerSits: p.partnerSits,
                  weeklyGoal: p.weeklyGoal,
                  currentWeekStart: p.currentWeekStart,
                  score: p.score,
                })),
                userWeeklyTarget: 5, // Will be updated if we have user data
                timestamp: Date.now(),
              };
              sessionStorage.setItem('cachedPartnerships', JSON.stringify(cachedData));
              console.log('✅ Timer: Updated cache with fresh partnership data');
            } catch (cacheError) {
              console.warn('Timer: Failed to update cache:', cacheError);
            }
          } else {
            console.log('Timer: No partnerships found in database');
            setPartnerships([]);
            setPartnershipsLoading(false);
          }
        } catch (error) {
          console.log('Timer: Error fetching partnerships from database:', error);
          // Fallback to localStorage if database fails
          const partnershipsData = localStorage.getItem('partnerships');
          if (partnershipsData) {
            const partnerships = JSON.parse(partnershipsData);
            console.log('Timer: Loaded partnerships from localStorage fallback:', partnerships);
            setPartnerships(partnerships);
            setPartnershipsLoading(false);
          } else {
            console.log('Timer: No partnerships found in localStorage either');
            setPartnerships([]);
            setPartnershipsLoading(false);
          }
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
    hasProcessedCompletionRef.current = false; // Reset completion processing flag
  };

  // Get partnership data for lotus progress
  const partnership = partnerships[0];
  const partnershipId = partnership?.id || '';
  
  // Detect if we're in solo mode (no partnership)
  const isSoloMode = !partnershipsLoading && partnerships.length === 0;
  
  // Debug logging for lotus progress
  console.log('Timer: Partnerships loaded:', partnerships);
  console.log('Timer: First partnership:', partnership);
  console.log('Timer: Partnership ID:', partnershipId);
  console.log('Timer: Solo mode:', isSoloMode);
  
  // Memoize the lotus progress hook parameters to prevent infinite re-renders
  // Always create params (hook must be called unconditionally per React rules)
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
      partnershipId: partnershipId || '', // Empty string if no partnership (hook will skip internally)
      isMeditationActive: isRunning,
      sessionDuration,
      sessionElapsed
    };
  }, [user?.id, partnershipId, isRunning, user?.usualSitLength, timeLeft]);

  // Always call the hook (React rules requirement)
  // Hook internally checks for partnershipId and skips if empty
  const { progressData } = useLotusProgress(lotusProgressParams);

  // Calculate solo mode lotus progress (0% to 100% based on meditation duration only)
  const getSoloLotusProgress = () => {
    if (!user?.usualSitLength) return 0;
    
    const totalDuration = user.usualSitLength * 60; // Convert minutes to seconds
    const elapsed = totalDuration - timeLeft;
    
    // Calculate progress as percentage: (elapsed / totalDuration) * 100
    // Clamp between 0 and 100
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    
    return progress;
  };

  // Calculate progress for lotus animation
  // Handles both solo mode (time-based) and partnership mode (partnership-based)
  const getLotusProgress = () => {
    // Solo mode: simple time-based progress (0% to 100% over meditation duration)
    if (isSoloMode) {
      return getSoloLotusProgress();
    }
    
    // Partnership mode: existing partnership-based progress calculation (unchanged)
    if (!partnership) return 0;
    
    // If we have API data (from useLotusProgress hook), use it for real-time updates
    if (progressData) {
      return progressData.currentProgress;
    }
    
    // Use partnership data from cache/homepage for initial display
    // This matches calculateLotusProgress logic but uses cached week data
    const totalSits = partnership.userSits + partnership.partnerSits;
    const weeklyGoal = partnership.weeklyGoal || 10; // Fallback to 10 if not set
    const baseProgress = Math.min((totalSits / weeklyGoal) * 100, 100);
    
    // Add current session progress if running or just completed
    if ((isRunning || isCompleted) && user?.usualSitLength) {
      const sessionDuration = user.usualSitLength * 60;
      const sessionElapsed = sessionDuration - timeLeft;
      const sessionContribution = (1 / weeklyGoal) * 100; // Each sit contributes this percentage
      const sessionCompletionPercentage = sessionElapsed / sessionDuration;
      const sessionProgress = sessionCompletionPercentage * sessionContribution;
      return Math.min(baseProgress + sessionProgress, 100);
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

  // Track if we've already processed this completion to prevent duplicate calls
  const hasProcessedCompletionRef = useRef(false);

  // Handle meditation completion
  useEffect(() => {
    console.log('🔄 Timer: useEffect triggered', { isCompleted, hasCompleteSession: !!completeSession, hasProcessed: hasProcessedCompletionRef.current });
    
    if (isCompleted && !hasProcessedCompletionRef.current) {
      console.log('🔄 Timer: useEffect - isCompleted is true, calling completeSession(true)');
      hasProcessedCompletionRef.current = true; // Mark as processed BEFORE calling
      completeSession(true);
    } else if (isCompleted && hasProcessedCompletionRef.current) {
      console.log('⚠️ Timer: useEffect - isCompleted is true but already processed, skipping');
    } else {
      console.log('Timer: useEffect - isCompleted is false, not calling completeSession');
      // Reset the flag when timer is not completed (e.g., after reset)
      hasProcessedCompletionRef.current = false;
    }
  }, [isCompleted, completeSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your meditation preferences...</p>
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
            <p className="text-sm text-gray-700">
              Your preferred session: {user.usualSitLength} minutes
            </p>
          )}

          {/* Only show spinner if we're actually loading AND have no partnerships yet */}
          {/* If cache was used, partnershipsLoading is false from init, so no spinner */}
          {partnershipsLoading && partnerships.length === 0 && !user ? (
            <div className="w-64 h-64 mx-auto flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : (partnership || isSoloMode) ? (
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
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors cursor-pointer"
                >
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">Session Complete! 🎉</div>
              <p className="text-gray-700">Great job! You've completed your meditation session.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetTimer}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
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
