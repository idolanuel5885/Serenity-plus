import { ensureCurrentWeekExists, createNewWeek, getCurrentWeek } from '@/lib/supabase-database';
import { supabase } from '@/lib/supabase';

// Mock the supabase module
jest.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn(),
  };
  return {
    supabase: mockSupabase,
  };
});

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Week Creation Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureCurrentWeekExists', () => {
    it('should return existing week if one exists', async () => {
      const mockWeek = {
        id: 'week-123',
        partnershipid: 'partnership-123',
        weeknumber: 1,
        weekstart: new Date().toISOString(),
        weekend: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weeklygoal: 10,
        inviteesits: 0,
        invitersits: 0,
        goalmet: false,
        createdat: new Date().toISOString(),
      };

      // Mock RPC call to return existing week
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockWeek],
        error: null,
      });

      const result = await ensureCurrentWeekExists('partnership-123', 10);

      expect(result).toBeDefined();
      expect(result?.id).toBe('week-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_current_week_for_partnership', {
        p_partnership_id: 'partnership-123',
      });
    });

    it('should create new week if none exists and auto-creation is enabled', async () => {
      const mockWeek = {
        id: 'week-456',
        partnershipid: 'partnership-123',
        weeknumber: 1,
        weekstart: new Date().toISOString(),
        weekend: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weeklygoal: 10,
        inviteesits: 0,
        invitersits: 0,
        goalmet: false,
        createdat: new Date().toISOString(),
      };

      // Mock RPC call to return no week (empty array) - this is called by getCurrentWeek
      (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Mock partnership query to check auto-creation settings
      const mockPartnershipSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'partnership-123', autocreateweeks: true, weekcreationpauseduntil: null },
            error: null,
          }),
        }),
      });

      // Mock weeks query to get last week number (called by createNewWeek)
      const mockWeeksSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: null, // No previous week
                error: { code: 'PGRST116' }, // Not found error
              }),
            }),
          }),
        }),
      });

      // Mock weeks insert
      const mockWeeksInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockWeek, error: null }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'partnerships') {
          return { select: mockPartnershipSelect };
        }
        if (table === 'weeks') {
          return { 
            select: mockWeeksSelect,
            insert: mockWeeksInsert,
          };
        }
        return {} as any;
      }) as any);

      const result = await ensureCurrentWeekExists('partnership-123', 10);

      expect(result).toBeDefined();
      expect(result?.id).toBe('week-456');
      expect(mockWeeksInsert).toHaveBeenCalled();
    });

    it('should create week on-demand even if auto-creation is disabled (backward compatible)', async () => {
      // Note: The actual implementation creates weeks on-demand even if auto-creation is disabled
      // This is for backward compatibility
      const mockWeek = {
        id: 'week-999',
        partnershipid: 'partnership-123',
        weeknumber: 1,
        weekstart: new Date().toISOString(),
        weekend: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weeklygoal: 10,
        inviteesits: 0,
        invitersits: 0,
        goalmet: false,
        createdat: new Date().toISOString(),
      };

      // Mock RPC call to return no week
      (mockSupabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Mock partnership with auto-creation disabled
      const mockPartnershipSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'partnership-123', autocreateweeks: false, weekcreationpauseduntil: null },
            error: null,
          }),
        }),
      });

      // Mock weeks query to get last week number
      const mockWeeksSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      });

      // Mock weeks insert
      const mockWeeksInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockWeek, error: null }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'partnerships') {
          return { select: mockPartnershipSelect };
        }
        if (table === 'weeks') {
          return { 
            select: mockWeeksSelect,
            insert: mockWeeksInsert,
          };
        }
        return {} as any;
      }) as any);

      const result = await ensureCurrentWeekExists('partnership-123', 10);

      // Even with auto-creation disabled, week is created on-demand for backward compatibility
      expect(result).toBeDefined();
      expect(result?.id).toBe('week-999');
      expect(mockWeeksInsert).toHaveBeenCalled();
    });
  });

  describe('createNewWeek', () => {
    it('should create a new week with correct structure', async () => {
      const mockWeek = {
        id: 'week-789',
        partnershipid: 'partnership-123',
        weeknumber: 2,
        weekstart: new Date().toISOString(),
        weekend: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weeklygoal: 10,
        inviteesits: 0,
        invitersits: 0,
        goalmet: false,
        createdat: new Date().toISOString(),
      };

      // Mock weeks query to get last week number (createNewWeek queries for existing weeks first)
      const mockWeeksSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { weeknumber: 1 }, // Previous week exists
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock weeks insert
      const mockWeeksInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockWeek, error: null }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockImplementation(((table: string) => {
        if (table === 'weeks') {
          return { 
            select: mockWeeksSelect,
            insert: mockWeeksInsert,
          };
        }
        return {} as any;
      }) as any);

      const result = await createNewWeek('partnership-123', 10);

      expect(result).toBeDefined();
      expect(result?.id).toBe('week-789');
      expect(result?.weeklygoal).toBe(10);
      expect(mockWeeksInsert).toHaveBeenCalled();
    });
  });

  describe('getCurrentWeek', () => {
    it('should return current week via RPC function', async () => {
      const mockWeek = {
        id: 'week-123',
        partnershipid: 'partnership-123',
        weeknumber: 1,
        weekstart: new Date().toISOString(),
        weekend: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weeklygoal: 10,
        inviteesits: 0,
        invitersits: 0,
        goalmet: false,
        createdat: new Date().toISOString(),
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockWeek],
        error: null,
      });

      const result = await getCurrentWeek('partnership-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('week-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_current_week_for_partnership', {
        p_partnership_id: 'partnership-123',
      });
    });

    it('should return null if no week exists', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getCurrentWeek('partnership-123');

      expect(result).toBeNull();
    });
  });
});

