/**
 * @jest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// This test requires actual database connection
// Skip if Supabase env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const shouldSkip = !supabaseUrl || !supabaseAnonKey;

(shouldSkip ? describe.skip : describe)('Session-Week Integration Flow', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUser1Id: string;
  let testUser2Id: string;
  let testPartnershipId: string;
  let testWeekId: string;
  let testSessionId: string;

  beforeAll(async () => {
    // Restore real fetch for Supabase client to work
    // Integration tests run in 'node' environment which has Node.js's built-in fetch
    // jest.setup.js mocks fetch, but Supabase needs the real one
    
    // First, try to get the saved fetch from jest.setup.js
    let realFetch = (global as any).__REAL_FETCH__ || (globalThis as any).__REAL_FETCH__;
    
    // If fetch wasn't saved, get it from undici (Node.js 18+ built-in module)
    if (!realFetch || typeof realFetch !== 'function') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const undici = require('undici');
        if (undici && typeof undici.fetch === 'function') {
          realFetch = undici.fetch;
        }
      } catch (e) {
        // undici not available, try node:undici
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const undici = require('node:undici');
          if (undici && typeof undici.fetch === 'function') {
            realFetch = undici.fetch;
          }
        } catch (e2) {
          // Both failed
        }
      }
    }
    
    if (!realFetch || typeof realFetch !== 'function') {
      throw new Error('Real fetch not available. Integration tests require real fetch for Supabase. Node.js 18+ is required.');
    }
    
    // Restore the real fetch
    global.fetch = realFetch;
    globalThis.fetch = realFetch;
    
    // Verify fetch is restored
    if ((global.fetch as any)?._isMockFunction || (global.fetch as any).mock) {
      throw new Error('Failed to restore real fetch for integration tests. Supabase will not work.');
    }

    if (shouldSkip) {
      console.log('⚠️ Skipping integration tests - Supabase env vars not set');
      return;
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Create test users
    const timestamp = Date.now();
    const user1Data = {
      name: `TestUser1_${timestamp}`,
      email: `testuser1_${timestamp}@test.com`,
      weeklytarget: 5,
      usualsitlength: 30,
      image: '/icons/meditation-1.svg',
      invitecode: `invite-${timestamp}-1`,
    };

    const user2Data = {
      name: `TestUser2_${timestamp}`,
      email: `testuser2_${timestamp}@test.com`,
      weeklytarget: 3,
      usualsitlength: 25,
      image: '/icons/meditation-1.svg',
      invitecode: `invite-${timestamp}-2`,
    };

    const { data: user1, error: user1Error } = await supabase
      .from('users')
      .insert(user1Data as any)
      .select()
      .single();

    if (user1Error || !user1) throw user1Error || new Error('User1 creation failed');
    testUser1Id = (user1 as any).id;

    const { data: user2, error: user2Error } = await supabase
      .from('users')
      .insert(user2Data as any)
      .select()
      .single();

    if (user2Error || !user2) throw user2Error || new Error('User2 creation failed');
    testUser2Id = (user2 as any).id;

    // Create partnership
    const partnershipData = {
      userid: testUser1Id,
      partnerid: testUser2Id,
      score: 0,
    };

    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .insert(partnershipData as any)
      .select()
      .single();

    if (partnershipError || !partnership) throw partnershipError || new Error('Partnership creation failed');
    testPartnershipId = (partnership as any).id;

    // Verify Week 1 was created (should be created when partnership is created)
    const { data: week1, error: weekError } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', testPartnershipId)
      .eq('weeknumber', 1)
      .single();

    if (weekError || !week1) throw weekError || new Error('Week 1 not found');
    testWeekId = (week1 as any).id;
  });

  afterAll(async () => {
    if (shouldSkip) return;

    // Clean up test data
    if (testSessionId) {
      await supabase.from('sessions').delete().eq('id', testSessionId);
    }
    if (testWeekId) {
      await supabase.from('weeks').delete().eq('id', testWeekId);
    }
    if (testPartnershipId) {
      await supabase.from('partnerships').delete().eq('id', testPartnershipId);
    }
    if (testUser1Id) {
      await supabase.from('users').delete().eq('id', testUser1Id);
    }
    if (testUser2Id) {
      await supabase.from('users').delete().eq('id', testUser2Id);
    }
  });

  describe('Full Flow: Partnership → Week → Session', () => {
    it('should create Week 1 when partnership is established', async () => {
      if (shouldSkip) return;

      const { data: week, error } = await supabase
        .from('weeks')
        .select('*')
        .eq('partnershipid', testPartnershipId)
        .eq('weeknumber', 1)
        .single();

      expect(error).toBeNull();
      expect(week).toBeDefined();
      if (!week) {
        throw new Error('Week not found');
      }
      const weekData = week as any;
      expect(weekData.weeknumber).toBe(1);
      expect(weekData.partnershipid).toBe(testPartnershipId);
      expect(weekData.weeklygoal).toBe(8); // 5 + 3 from both users' targets
      expect(weekData.inviteesits).toBe(0);
      expect(weekData.invitersits).toBe(0);
    });

    it('should create session when timer starts and link to week', async () => {
      if (shouldSkip) return;

      const sessionDuration = 30 * 60; // 30 minutes in seconds
      const sessionData = {
        userid: testUser1Id,
        partnershipid: testPartnershipId,
        weekid: testWeekId,
        sitlength: sessionDuration,
        iscompleted: false,
      };

      const { data: session, error } = await supabase
        .from('sessions')
        .insert(sessionData as any)
        .select()
        .single();

      expect(error).toBeNull();
      expect(session).toBeDefined();
      if (!session) {
        throw new Error('Session not found');
      }
      const sessionDataResult = session as any;
      expect(sessionDataResult.userid).toBe(testUser1Id);
      expect(sessionDataResult.partnershipid).toBe(testPartnershipId);
      expect(sessionDataResult.weekid).toBe(testWeekId);
      expect(sessionDataResult.sitlength).toBe(sessionDuration);
      expect(sessionDataResult.iscompleted).toBe(false);
      expect(sessionDataResult.completedat).toBeNull();

      testSessionId = sessionDataResult.id;
    });

    it('should update session when completed', async () => {
      if (shouldSkip) return;

      const { data: session, error } = await supabase
        .from('sessions')
        // @ts-expect-error - Supabase types are strict, but this is valid at runtime
        .update({
          iscompleted: true,
          completedat: new Date().toISOString(),
        })
        .eq('id', testSessionId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(session).toBeDefined();
      if (!session) {
        throw new Error('Session not found after update');
      }
      const sessionDataResult = session as any;
      expect(sessionDataResult.iscompleted).toBe(true);
      expect(sessionDataResult.completedat).not.toBeNull();
    });

    it('should increment week sit count when session completes', async () => {
      if (shouldSkip) return;

      // Get partnership to determine if user is user1 or user2
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('userid, partnerid')
        .eq('id', testPartnershipId)
        .single();

      if (!partnership) {
        throw new Error('Partnership not found');
      }

      const partnershipData = partnership as any;
      const isUser1 = partnershipData.userid === testUser1Id;

      // Get current week
      const { data: weekBefore } = await supabase
        .from('weeks')
        .select('inviteesits, invitersits')
        .eq('id', testWeekId)
        .single();

      // Update week sit count
      if (!weekBefore) {
        throw new Error('Week not found before update');
      }

      const weekBeforeData = weekBefore as any;
      // isUser1 means userId == partnership.userid (the invitee)
      // So if isUser1, update inviteesits, otherwise update invitersits
      const updateData = isUser1
        ? { inviteesits: (weekBeforeData.inviteesits || 0) + 1 }
        : { invitersits: (weekBeforeData.invitersits || 0) + 1 };

      const { data: weekAfter, error } = await supabase
        .from('weeks')
        // @ts-expect-error - Supabase types are strict, but this is valid at runtime
        .update(updateData)
        .eq('id', testWeekId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(weekAfter).toBeDefined();
      if (!weekAfter) {
        throw new Error('Week not found after update');
      }

      const weekAfterData = weekAfter as any;
      if (isUser1) {
        expect(weekAfterData.inviteesits).toBe((weekBeforeData.inviteesits || 0) + 1);
      } else {
        expect(weekAfterData.invitersits).toBe((weekBeforeData.invitersits || 0) + 1);
      }
    });

    it('should verify session is linked to week via weekid', async () => {
      if (shouldSkip) return;

      const { data: session } = await supabase
        .from('sessions')
        .select('*, weeks(*)')
        .eq('id', testSessionId)
        .single();

      expect(session).toBeDefined();
      if (!session) {
        throw new Error('Session not found');
      }
      const sessionDataResult = session as any;
      expect(sessionDataResult.weekid).toBe(testWeekId);
    });
  });
});

