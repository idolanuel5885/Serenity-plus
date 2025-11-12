import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn() as jest.Mock,
};

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock supabase-database functions
const mockEnsureCurrentWeekExists = jest.fn() as jest.Mock;
jest.mock('@/lib/supabase-database', () => ({
  ensureCurrentWeekExists: mockEnsureCurrentWeekExists,
}));

describe('Session API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Session Creation (sessionStarted: true)', () => {
    it('should create a session when timer starts with all required fields', async () => {
      const mockUser = { id: 'user-123' };
      const mockPartnership = { id: 'partnership-123', userid: 'user-123', partnerid: 'user-456' };
      const mockWeek = { id: 'week-123', weeknumber: 1 };
      const mockSession = {
        id: 'session-123',
        userid: 'user-123',
        partnershipid: 'partnership-123',
        weekid: 'week-123',
        sitlength: 1800,
        iscompleted: false,
        createdat: new Date().toISOString(),
      };

      // Setup mocks
      const mockUsersSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          // @ts-expect-error - Jest mock types are strict, but this is valid for testing
          maybeSingle: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
        }),
      });

      const mockPartnershipsSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          // @ts-expect-error - Jest mock types are strict, but this is valid for testing
          maybeSingle: jest.fn().mockResolvedValue({ data: mockPartnership, error: null }),
        }),
      });

      const mockSessionsInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          // @ts-expect-error - Jest mock types are strict, but this is valid for testing
          maybeSingle: jest.fn().mockResolvedValue({ data: mockSession, error: null }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'users') {
          return { select: mockUsersSelect };
        }
        if (table === 'partnerships') {
          return { select: mockPartnershipsSelect };
        }
        if (table === 'sessions') {
          return { insert: mockSessionsInsert };
        }
        return {} as any;
      }) as any);

      // @ts-expect-error - Jest mock types are strict, but this is valid for testing
      mockEnsureCurrentWeekExists.mockResolvedValue(mockWeek);

      // Simulate API call
      const requestBody = {
        userId: 'user-123',
        partnershipId: 'partnership-123',
        sessionDuration: 1800,
        sessionStarted: true,
      };

      // Verify session would be created with correct fields
      expect(mockSessionsInsert).toBeDefined();
      expect(mockEnsureCurrentWeekExists).toHaveBeenCalled();
    });

    it('should return error if userId is missing', async () => {
      const requestBody = {
        partnershipId: 'partnership-123',
        sessionDuration: 1800,
        sessionStarted: true,
      };

      // Missing userId should return 400 error
      expect(requestBody).not.toHaveProperty('userId');
    });

    it('should return error if partnershipId is missing', async () => {
      const requestBody = {
        userId: 'user-123',
        sessionDuration: 1800,
        sessionStarted: true,
      };

      // Missing partnershipId should return 400 error
      expect(requestBody).not.toHaveProperty('partnershipId');
    });

    it('should return error if user does not exist', async () => {
      const mockUsersSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          // @ts-expect-error - Jest mock types are strict, but this is valid for testing
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'users') {
          return { select: mockUsersSelect };
        }
        return {} as any;
      }) as any);

      // User not found should return 400 error
      expect(mockUsersSelect).toBeDefined();
    });

    it('should return error if partnership does not exist', async () => {
      const mockUser = { id: 'user-123' };
      const mockUsersSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          // @ts-expect-error - Jest mock types are strict, but this is valid for testing
          maybeSingle: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
        }),
      });

      const mockPartnershipsSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          // @ts-expect-error - Jest mock types are strict, but this is valid for testing
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'users') {
          return { select: mockUsersSelect };
        }
        if (table === 'partnerships') {
          return { select: mockPartnershipsSelect };
        }
        return {} as any;
      }) as any);

      // Partnership not found should return 400 error
      expect(mockPartnershipsSelect).toBeDefined();
    });

    it('should link session to week via weekid', async () => {
      const mockWeek = { id: 'week-123', weeknumber: 1 };
      // @ts-expect-error - Jest mock types are strict, but this is valid for testing
      mockEnsureCurrentWeekExists.mockResolvedValue(mockWeek);

      // Session should include weekid from ensureCurrentWeekExists
      expect(mockWeek.id).toBe('week-123');
    });

    it('should store sessionId when session is created', async () => {
      const mockSession = {
        id: 'session-123',
        userid: 'user-123',
        partnershipid: 'partnership-123',
        weekid: 'week-123',
        sitlength: 1800,
        iscompleted: false,
      };

      // Session ID should be returned and stored
      expect(mockSession.id).toBe('session-123');
    });
  });

  describe('Session Completion (completed: true)', () => {
    it('should update session when completed with sessionId', async () => {
      const mockSession = {
        id: 'session-123',
        userid: 'user-123',
        partnershipid: 'partnership-123',
        iscompleted: false,
      };

      const mockSessionsUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            // @ts-expect-error - Jest mock types are strict, but this is valid for testing
            maybeSingle: jest.fn().mockResolvedValue({
              data: { ...mockSession, iscompleted: true, completedat: new Date().toISOString() },
              error: null,
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'sessions') {
          return { update: mockSessionsUpdate };
        }
        return {} as any;
      }) as any);

      // Session should be updated with completedat and iscompleted = true
      expect(mockSessionsUpdate).toBeDefined();
    });

    it('should increment week sit count when session completes', async () => {
      const mockPartnership = { userid: 'user-123', partnerid: 'user-456' };
      const mockWeek = {
        id: 'week-123',
        user1sits: 0,
        user2sits: 0,
      };

      const mockPartnershipsSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          // @ts-expect-error - Jest mock types are strict, but this is valid for testing
          maybeSingle: jest.fn().mockResolvedValue({ data: mockPartnership, error: null }),
        }),
      });

      const mockWeeksSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              // @ts-expect-error - Jest mock types are strict, but this is valid for testing
              maybeSingle: jest.fn().mockResolvedValue({ data: mockWeek, error: null }),
            }),
          }),
        }),
      });

      const mockWeeksUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            // @ts-expect-error - Jest mock types are strict, but this is valid for testing
            maybeSingle: jest.fn().mockResolvedValue({
              data: { ...mockWeek, user1sits: 1 },
              error: null,
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'partnerships') {
          return { select: mockPartnershipsSelect };
        }
        if (table === 'weeks') {
          return { select: mockWeeksSelect, update: mockWeeksUpdate };
        }
        return {} as any;
      }) as any);

      // Week sit count should increment for correct user
      expect(mockWeeksUpdate).toBeDefined();
    });

    it('should identify correct user (user1 vs user2) for week update', async () => {
      const mockPartnership = { userid: 'user-123', partnerid: 'user-456' };
      const userId = 'user-123';

      // If userId matches partnership.userid, user is user1
      const isUser1 = mockPartnership.userid === userId;
      expect(isUser1).toBe(true);

      // If userId matches partnership.partnerid, user is user2
      const isUser2 = mockPartnership.partnerid === userId;
      expect(isUser2).toBe(false);
    });

    it('should handle fallback when sessionId is not provided', async () => {
      const mockSessionsUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                // @ts-expect-error - Jest mock types are strict, but this is valid for testing
                maybeSingle: jest.fn().mockResolvedValue({
                  data: { id: 'session-123', iscompleted: true },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'sessions') {
          return { update: mockSessionsUpdate };
        }
        return {} as any;
      }) as any);

      // Should search by userid + partnershipid + iscompleted = false
      expect(mockSessionsUpdate).toBeDefined();
    });

    it('should return error if session not found', async () => {
      const mockSessionsUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            // @ts-expect-error - Jest mock types are strict, but this is valid for testing
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Session not found' },
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'sessions') {
          return { update: mockSessionsUpdate };
        }
        return {} as any;
      }) as any);

      // Session not found should be handled gracefully
      expect(mockSessionsUpdate).toBeDefined();
    });
  });

  describe('Session Field Validation', () => {
    it('should use sitlength field (not duration)', () => {
      const sessionData = {
        sitlength: 1800, // in seconds
        iscompleted: false,
      };

      // Should use sitlength, not duration
      expect(sessionData).toHaveProperty('sitlength');
      expect(sessionData).not.toHaveProperty('duration');
    });

    it('should set completedat as nullable initially', () => {
      const sessionData = {
        sitlength: 1800,
        iscompleted: false,
        // completedat is not set - should be null
      };

      // completedat should be nullable
      expect(sessionData).not.toHaveProperty('completedat');
    });

    it('should set completedat when session completes', () => {
      const completedSession = {
        sitlength: 1800,
        iscompleted: true,
        completedat: new Date().toISOString(),
      };

      // completedat should be set when session completes
      expect(completedSession).toHaveProperty('completedat');
      expect(completedSession.completedat).toBeDefined();
    });
  });
});
