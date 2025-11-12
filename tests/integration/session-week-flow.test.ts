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
      .insert(user1Data)
      .select()
      .single();

    if (user1Error) throw user1Error;
    testUser1Id = user1.id;

    const { data: user2, error: user2Error } = await supabase
      .from('users')
      .insert(user2Data)
      .select()
      .single();

    if (user2Error) throw user2Error;
    testUser2Id = user2.id;

    // Create partnership
    const partnershipData = {
      userid: testUser1Id,
      partnerid: testUser2Id,
      score: 0,
    };

    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .insert(partnershipData)
      .select()
      .single();

    if (partnershipError) throw partnershipError;
    testPartnershipId = partnership.id;

    // Verify Week 1 was created (should be created when partnership is created)
    const { data: week1, error: weekError } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', testPartnershipId)
      .eq('weeknumber', 1)
      .single();

    if (weekError) throw weekError;
    testWeekId = week1.id;
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
      expect(week.weeknumber).toBe(1);
      expect(week.partnershipid).toBe(testPartnershipId);
      expect(week.weeklygoal).toBe(8); // 5 + 3 from both users' targets
      expect(week.user1sits).toBe(0);
      expect(week.user2sits).toBe(0);
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
        .insert(sessionData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(session).toBeDefined();
      expect(session.userid).toBe(testUser1Id);
      expect(session.partnershipid).toBe(testPartnershipId);
      expect(session.weekid).toBe(testWeekId);
      expect(session.sitlength).toBe(sessionDuration);
      expect(session.iscompleted).toBe(false);
      expect(session.completedat).toBeNull();

      testSessionId = session.id;
    });

    it('should update session when completed', async () => {
      if (shouldSkip) return;

      const { data: session, error } = await supabase
        .from('sessions')
        .update({
          iscompleted: true,
          completedat: new Date().toISOString(),
        })
        .eq('id', testSessionId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(session).toBeDefined();
      expect(session.iscompleted).toBe(true);
      expect(session.completedat).not.toBeNull();
    });

    it('should increment week sit count when session completes', async () => {
      if (shouldSkip) return;

      // Get partnership to determine if user is user1 or user2
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('userid, partnerid')
        .eq('id', testPartnershipId)
        .single();

      const isUser1 = partnership.userid === testUser1Id;

      // Get current week
      const { data: weekBefore } = await supabase
        .from('weeks')
        .select('user1sits, user2sits')
        .eq('id', testWeekId)
        .single();

      // Update week sit count
      const updateData = isUser1
        ? { user1sits: (weekBefore.user1sits || 0) + 1 }
        : { user2sits: (weekBefore.user2sits || 0) + 1 };

      const { data: weekAfter, error } = await supabase
        .from('weeks')
        .update(updateData)
        .eq('id', testWeekId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(weekAfter).toBeDefined();

      if (isUser1) {
        expect(weekAfter.user1sits).toBe(weekBefore.user1sits + 1);
      } else {
        expect(weekAfter.user2sits).toBe(weekBefore.user2sits + 1);
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
      expect(session.weekid).toBe(testWeekId);
    });
  });
});

