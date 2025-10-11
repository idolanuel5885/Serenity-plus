'use client';

import { useState, useEffect, useCallback } from 'react';
import { LotusProgressData } from '@/lib/lotusProgress';

interface UseLotusProgressProps {
  userId: string;
  partnershipId: string;
  isMeditationActive: boolean;
  sessionDuration: number | undefined;
  sessionElapsed: number | undefined;
}

export function useLotusProgress({
  userId,
  partnershipId,
  isMeditationActive,
  sessionDuration,
  sessionElapsed
}: UseLotusProgressProps) {
  const [progressData, setProgressData] = useState<LotusProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Debug logging
  console.log('useLotusProgress called with:', { userId, partnershipId, isMeditationActive });

  const fetchProgress = useCallback(async () => {
    if (!userId || !partnershipId) {
      console.log('fetchProgress: Missing userId or partnershipId:', { userId, partnershipId });
      return;
    }

    console.log('fetchProgress called with:', { userId, partnershipId });
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/lotus-progress?userId=${userId}&partnershipId=${partnershipId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch lotus progress');
      }

      const result = await response.json();
      console.log('fetchProgress result:', result);
      setProgressData(result.data);
    } catch (err) {
      console.error('fetchProgress error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, partnershipId]);

  const updateProgress = useCallback(async () => {
    if (!userId || !partnershipId) {
      console.log('updateProgress: Missing userId or partnershipId:', { userId, partnershipId });
      return;
    }
    
    // Stop retrying after 3 failed attempts
    if (retryCount >= 3) {
      console.log('Stopping lotus progress updates after 3 failed attempts');
      return;
    }

    console.log('updateProgress called with:', { userId, partnershipId, sessionDuration, sessionElapsed });

    try {
      const response = await fetch('/api/lotus-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          partnershipId,
          sessionDuration,
          sessionElapsed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lotus progress');
      }

      const result = await response.json();
      console.log('updateProgress result:', result);
      setProgressData(result.data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('updateProgress error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRetryCount(prev => prev + 1);
    }
  }, [userId, partnershipId, sessionDuration, sessionElapsed, retryCount]);

  // Fetch initial progress
  useEffect(() => {
    fetchProgress();
  }, [userId, partnershipId]);

  // Update progress when meditation state changes
  useEffect(() => {
    if (isMeditationActive) {
      updateProgress();
    }
  }, [isMeditationActive]);

  // Update progress periodically during active meditation
  useEffect(() => {
    if (!isMeditationActive) return;
    
    // Only update every 5 seconds to prevent spam
    const interval = setInterval(() => {
      updateProgress();
    }, 5000); // Update every 5 seconds instead of every second

    return () => clearInterval(interval);
  }, [isMeditationActive]);

  return {
    progressData,
    isLoading,
    error,
    refetch: fetchProgress
  };
}
