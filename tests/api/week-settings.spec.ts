import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

test.describe('Week Settings API', () => {
  let testPartnershipId: string | null = null;
  let supabase: ReturnType<typeof createClient>;

  test.beforeAll(async () => {
    if (!supabaseUrl || !supabaseKey) {
      test.skip();
      return;
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    // Find or create a test partnership
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id')
      .limit(1);

    if (partnerships && partnerships.length > 0) {
      testPartnershipId = partnerships[0]?.id || null;
    } else {
      // Create test users and partnership if none exists
      const { data: user1 } = await (supabase
        .from('users')
        .insert({
          name: 'Test User 1',
          email: `test1-${Date.now()}@example.com`,
          weeklytarget: 5,
          usualsitlength: 30,
          invitecode: `TEST-${Date.now()}`,
        } as any)
        .select()
        .single());

      const { data: user2 } = await (supabase
        .from('users')
        .insert({
          name: 'Test User 2',
          email: `test2-${Date.now()}@example.com`,
          weeklytarget: 5,
          usualsitlength: 30,
          invitecode: `TEST-${Date.now()}-2`,
        } as any)
        .select()
        .single());

      if (user1 && user2) {
        const { data: partnership } = await (supabase
          .from('partnerships')
          .insert({
            userid: user1.id,
            partnerid: user2.id,
            score: 0,
          } as any)
          .select()
          .single());

        if (partnership) {
          testPartnershipId = (partnership as any).id;
        }
      }
    }
  });

  test('should get week settings for a partnership', async ({ request }) => {
    if (!testPartnershipId) {
      test.skip();
      return;
    }

    const response = await request.get(
      `${baseUrl}/api/partnerships/${testPartnershipId}/week-settings`
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveProperty('autocreateweeks');
    expect(data).toHaveProperty('weekcreationpauseduntil');
    expect(typeof data.autocreateweeks).toBe('boolean');
  });

  test('should update week settings (disable auto-creation)', async ({ request }) => {
    if (!testPartnershipId) {
      test.skip();
      return;
    }

    const response = await request.post(
      `${baseUrl}/api/partnerships/${testPartnershipId}/week-settings`,
      {
        data: {
          autocreateweeks: false,
        },
      }
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.autocreateweeks).toBe(false);

    // Clean up: re-enable
    await request.post(
      `${baseUrl}/api/partnerships/${testPartnershipId}/week-settings`,
      {
        data: {
          autocreateweeks: true,
        },
      }
    );
  });

  test('should update week settings (pause until date)', async ({ request }) => {
    if (!testPartnershipId) {
      test.skip();
      return;
    }

    const pauseUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow

    const response = await request.post(
      `${baseUrl}/api/partnerships/${testPartnershipId}/week-settings`,
      {
        data: {
          weekcreationpauseduntil: pauseUntil,
        },
      }
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.weekcreationpauseduntil).toBeTruthy();

    // Clean up: clear pause
    await request.post(
      `${baseUrl}/api/partnerships/${testPartnershipId}/week-settings`,
      {
        data: {
          weekcreationpauseduntil: null,
        },
      }
    );
  });

  test('should return 404 for non-existent partnership', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request.get(
      `${baseUrl}/api/partnerships/${fakeId}/week-settings`
    );

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toContain('not found');
  });

  test('should return 400 for invalid update data', async ({ request }) => {
    if (!testPartnershipId) {
      test.skip();
      return;
    }

    const response = await request.post(
      `${baseUrl}/api/partnerships/${testPartnershipId}/week-settings`,
      {
        data: {},
      }
    );

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('No fields to update');
  });
});

