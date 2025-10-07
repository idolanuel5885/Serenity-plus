'use client';

import { useEffect, useCallback } from 'react';
import { websocketService } from '@/lib/websocket';

interface PartnershipUpdate {
  partnershipId: string;
  user1Sits: number;
  user2Sits: number;
  currentWeekNumber: number;
  lotusProgress: number;
}

interface UsePartnershipSyncProps {
  partnershipId: string;
  userId: string;
  onPartnershipUpdate?: (update: PartnershipUpdate) => void;
  onLotusProgressUpdate?: (progress: number) => void;
}

export function usePartnershipSync({
  partnershipId,
  userId,
  onPartnershipUpdate,
  onLotusProgressUpdate
}: UsePartnershipSyncProps) {
  
  const sendLotusProgress = useCallback((progress: number) => {
    websocketService.send({
      type: 'lotus_progress',
      data: { progress },
      partnershipId,
      userId
    });
  }, [partnershipId, userId]);

  const sendMeditationStart = useCallback((duration: number) => {
    websocketService.send({
      type: 'meditation_start',
      data: { duration, startTime: Date.now() },
      partnershipId,
      userId
    });
  }, [partnershipId, userId]);

  const sendMeditationEnd = useCallback((completed: boolean, duration: number) => {
    websocketService.send({
      type: 'meditation_end',
      data: { completed, duration, endTime: Date.now() },
      partnershipId,
      userId
    });
  }, [partnershipId, userId]);

  useEffect(() => {
    if (!partnershipId || !userId) return;

    // Connect to WebSocket
    websocketService.connect(partnershipId, userId);

    // Subscribe to partnership updates
    const handlePartnershipUpdate = (data: PartnershipUpdate) => {
      onPartnershipUpdate?.(data);
    };

    const handleLotusProgressUpdate = (data: { progress: number }) => {
      onLotusProgressUpdate?.(data.progress);
    };

    websocketService.subscribe('partnership_update', handlePartnershipUpdate);
    websocketService.subscribe('lotus_progress', handleLotusProgressUpdate);

    return () => {
      websocketService.unsubscribe('partnership_update', handlePartnershipUpdate);
      websocketService.unsubscribe('lotus_progress', handleLotusProgressUpdate);
    };
  }, [partnershipId, userId, onPartnershipUpdate, onLotusProgressUpdate]);

  return {
    sendLotusProgress,
    sendMeditationStart,
    sendMeditationEnd
  };
}
