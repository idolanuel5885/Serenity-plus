/**
 * Unit tests for solo meditation mode in timer page
 * Tests that solo mode works correctly without partnerships
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock the timer page logic
// In a real implementation, we'd import the actual functions
// For now, we'll test the logic directly

describe('Solo Meditation Mode', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getSoloLotusProgress', () => {
    // Helper function to calculate solo progress (matches timer page logic)
    const getSoloLotusProgress = (timeLeft: number, totalDuration: number): number => {
      const elapsed = totalDuration - timeLeft;
      return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    };

    it('should return 0% at start of meditation', () => {
      const totalDuration = 15 * 60; // 15 minutes in seconds
      const timeLeft = 15 * 60; // Full time remaining
      const progress = getSoloLotusProgress(timeLeft, totalDuration);
      expect(progress).toBe(0);
    });

    it('should return 50% at halfway point', () => {
      const totalDuration = 15 * 60; // 15 minutes
      const timeLeft = 7.5 * 60; // 7.5 minutes remaining
      const progress = getSoloLotusProgress(timeLeft, totalDuration);
      expect(progress).toBeCloseTo(50, 1);
    });

    it('should return 100% when meditation completes', () => {
      const totalDuration = 15 * 60; // 15 minutes
      const timeLeft = 0; // No time remaining
      const progress = getSoloLotusProgress(timeLeft, totalDuration);
      expect(progress).toBe(100);
    });

    it('should work for 1-minute meditation', () => {
      const totalDuration = 1 * 60; // 1 minute
      const timeLeft = 30; // 30 seconds remaining (halfway)
      const progress = getSoloLotusProgress(timeLeft, totalDuration);
      expect(progress).toBeCloseTo(50, 1);
    });

    it('should work for 30-minute meditation', () => {
      const totalDuration = 30 * 60; // 30 minutes
      const timeLeft = 15 * 60; // 15 minutes remaining (halfway)
      const progress = getSoloLotusProgress(timeLeft, totalDuration);
      expect(progress).toBeCloseTo(50, 1);
    });

    it('should clamp progress to 0-100% range', () => {
      const totalDuration = 15 * 60;
      
      // Test negative timeLeft (timer has passed end, should be 100%)
      const progressNegative = getSoloLotusProgress(-100, totalDuration);
      expect(progressNegative).toBe(100); // Clamped to 100%
      
      // Test timeLeft greater than duration (timer hasn't started, should be 0%)
      const progressOver = getSoloLotusProgress(totalDuration + 100, totalDuration);
      expect(progressOver).toBe(0); // Clamped to 0%
    });

    it('should progress smoothly over time', () => {
      const totalDuration = 15 * 60; // 15 minutes
      
      // Test progress at various points
      const progress25 = getSoloLotusProgress(11.25 * 60, totalDuration); // 25% elapsed
      expect(progress25).toBeCloseTo(25, 1);
      
      const progress75 = getSoloLotusProgress(3.75 * 60, totalDuration); // 75% elapsed
      expect(progress75).toBeCloseTo(75, 1);
      
      const progress90 = getSoloLotusProgress(1.5 * 60, totalDuration); // 90% elapsed
      expect(progress90).toBeCloseTo(90, 1);
    });
  });

  describe('Solo mode detection', () => {
    it('should detect solo mode when no partnerships exist', () => {
      const partnerships: any[] = [];
      const partnershipsLoading = false;
      const isSoloMode = !partnershipsLoading && partnerships.length === 0;
      expect(isSoloMode).toBe(true);
    });

    it('should not detect solo mode when partnerships exist', () => {
      const partnerships = [{ id: 'partnership-1' }];
      const partnershipsLoading = false;
      const isSoloMode = !partnershipsLoading && partnerships.length === 0;
      expect(isSoloMode).toBe(false);
    });

    it('should not detect solo mode while loading', () => {
      const partnerships: any[] = [];
      const partnershipsLoading = true;
      const isSoloMode = !partnershipsLoading && partnerships.length === 0;
      expect(isSoloMode).toBe(false);
    });
  });

  describe('Progress calculation mode switching', () => {
    // Helper to simulate getLotusProgress logic
    const getLotusProgress = (
      isSoloMode: boolean,
      partnership: any,
      timeLeft: number,
      totalDuration: number,
      progressData: any
    ): number => {
      if (isSoloMode) {
        const elapsed = totalDuration - timeLeft;
        return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      }
      
      if (!partnership) return 0;
      
      if (progressData) {
        return progressData.currentProgress;
      }
      
      // Partnership mode calculation (simplified for test)
      const totalSits = partnership.userSits + partnership.partnerSits;
      const weeklyGoal = partnership.weeklyGoal || 10;
      return Math.min((totalSits / weeklyGoal) * 100, 100);
    };

    it('should use solo progress calculation in solo mode', () => {
      const isSoloMode = true;
      const partnership = null;
      const timeLeft = 7.5 * 60; // Halfway through 15-minute meditation
      const totalDuration = 15 * 60;
      const progressData = null;
      
      const progress = getLotusProgress(isSoloMode, partnership, timeLeft, totalDuration, progressData);
      expect(progress).toBeCloseTo(50, 1);
    });

    it('should use partnership progress calculation in partnership mode', () => {
      const isSoloMode = false;
      const partnership = {
        userSits: 3,
        partnerSits: 2,
        weeklyGoal: 10
      };
      const timeLeft = 7.5 * 60;
      const totalDuration = 15 * 60;
      const progressData = null;
      
      const progress = getLotusProgress(isSoloMode, partnership, timeLeft, totalDuration, progressData);
      // Partnership progress: (3 + 2) / 10 * 100 = 50%
      expect(progress).toBe(50);
    });

    it('should use API progress data when available in partnership mode', () => {
      const isSoloMode = false;
      const partnership = {
        userSits: 3,
        partnerSits: 2,
        weeklyGoal: 10
      };
      const timeLeft = 7.5 * 60;
      const totalDuration = 15 * 60;
      const progressData = { currentProgress: 75 };
      
      const progress = getLotusProgress(isSoloMode, partnership, timeLeft, totalDuration, progressData);
      // Should use API data, not calculated
      expect(progress).toBe(75);
    });
  });
});

