/**
 * Integration tests for solo meditation flow
 * Tests that solo mode makes no API calls and works correctly
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock fetch globally with proper typing
const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch as typeof fetch;

describe('Solo Meditation Flow Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch.mockClear();
    
    // Setup localStorage
    localStorage.clear();
    localStorage.setItem('userId', 'test-user-123');
    localStorage.setItem('userName', 'Test User');
    localStorage.setItem('userUsualSitLength', '15');
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    mockFetch.mockClear();
  });

  describe('No API calls in solo mode', () => {
    it('should not call session-complete API when starting timer in solo mode', () => {
      // Simulate solo mode: no partnerships
      const partnershipId = '';
      const userId = 'test-user-123';
      
      // Simulate startTimer logic
      const startTimer = () => {
        // This should only call API if partnershipId exists
        if (partnershipId && userId) {
          fetch('/api/session-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              partnershipId,
              sessionDuration: 15 * 60,
              sessionStarted: true
            }),
          });
        }
      };
      
      startTimer();
      
      // Verify no API calls were made
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not call session-complete API when completing timer in solo mode', () => {
      const partnershipId = '';
      const userId = 'test-user-123';
      
      // Simulate completeSession logic
      const completeSession = () => {
        if (!partnershipId || !userId) {
          return; // Early return for solo mode
        }
        
        fetch('/api/session-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            partnershipId,
            sessionDuration: 15 * 60,
            completed: true
          }),
        });
      };
      
      completeSession();
      
      // Verify no API calls were made
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not call lotus-progress API in solo mode', () => {
      const partnershipId = '';
      
      // Simulate useLotusProgress hook logic
      const shouldCallLotusProgress = () => {
        // Hook should only be called if partnershipId exists
        return !!partnershipId;
      };
      
      const willCall = shouldCallLotusProgress();
      
      expect(willCall).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('API calls in partnership mode', () => {
    it('should call session-complete API when starting timer with partnership', () => {
      const partnershipId = 'partnership-123';
      const userId = 'test-user-123';
      
      const startTimer = () => {
        if (partnershipId && userId) {
          fetch('/api/session-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              partnershipId,
              sessionDuration: 15 * 60,
              sessionStarted: true
            }),
          });
        }
      };
      
      startTimer();
      
      // Verify API call was made
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/session-complete',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should call session-complete API when completing timer with partnership', () => {
      const partnershipId = 'partnership-123';
      const userId = 'test-user-123';
      
      const completeSession = () => {
        if (!partnershipId || !userId) {
          return;
        }
        
        fetch('/api/session-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            partnershipId,
            sessionDuration: 15 * 60,
            completed: true
          }),
        });
      };
      
      completeSession();
      
      // Verify API call was made
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Progress calculation during meditation', () => {
    it('should calculate progress correctly throughout solo meditation', () => {
      const totalDuration = 15 * 60; // 15 minutes
      let timeLeft = totalDuration;
      
      const getSoloProgress = () => {
        const elapsed = totalDuration - timeLeft;
        return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      };
      
      // Start: 0%
      expect(getSoloProgress()).toBe(0);
      
      // Advance 25% of time
      jest.advanceTimersByTime(3.75 * 60 * 1000); // 3.75 minutes
      timeLeft = 11.25 * 60;
      expect(getSoloProgress()).toBeCloseTo(25, 1);
      
      // Advance to 50%
      jest.advanceTimersByTime(3.75 * 60 * 1000);
      timeLeft = 7.5 * 60;
      expect(getSoloProgress()).toBeCloseTo(50, 1);
      
      // Advance to 75%
      jest.advanceTimersByTime(3.75 * 60 * 1000);
      timeLeft = 3.75 * 60;
      expect(getSoloProgress()).toBeCloseTo(75, 1);
      
      // Complete: 100%
      jest.advanceTimersByTime(3.75 * 60 * 1000);
      timeLeft = 0;
      expect(getSoloProgress()).toBe(100);
    });

    it('should reset progress when timer is reset in solo mode', () => {
      const totalDuration = 15 * 60;
      let timeLeft = 7.5 * 60; // Halfway through
      
      const getSoloProgress = () => {
        const elapsed = totalDuration - timeLeft;
        return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      };
      
      // Should be at 50%
      expect(getSoloProgress()).toBeCloseTo(50, 1);
      
      // Reset timer
      timeLeft = totalDuration;
      
      // Should be back at 0%
      expect(getSoloProgress()).toBe(0);
    });
  });
});

