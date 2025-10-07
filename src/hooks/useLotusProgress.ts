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

  const fetchProgress = useCallback(async () => {
    if (!userId || !partnershipId) return;

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
      setProgressData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, partnershipId]);

  const updateProgress = useCallback(async () => {
    if (!userId || !partnershipId) return;

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
      setProgressData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId, partnershipId, sessionDuration, sessionElapsed]);

  // Fetch initial progress
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Update progress when meditation state changes
  useEffect(() => {
    if (isMeditationActive) {
      updateProgress();
    }
  }, [isMeditationActive, updateProgress]);

  // Update progress periodically during active meditation
  useEffect(() => {
    if (!isMeditationActive || !sessionElapsed) return;

    const interval = setInterval(() => {
      updateProgress();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isMeditationActive, sessionElapsed, updateProgress]);

  return {
    progressData,
    isLoading,
    error,
    refetch: fetchProgress
  };
}
