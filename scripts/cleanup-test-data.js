#!/usr/bin/env node

/**
 * Cleanup script to delete all test data from the database
 * Identifies test data by patterns used in E2E and integration tests:
 * - Email addresses ending with @test.com
 * - User names containing "TestUser" or patterns like "User1_", "SessionTestUser", etc.
 * - Invite codes starting with "invite-" (but only for test users)
 * 
 * This script deletes in the correct order to respect foreign key constraints:
 * 1. Sessions (references users, partnerships, weeks)
 * 2. Weeks (references partnerships)
 * 3. Partnerships (references users)
 * 4. Users
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Identify test users by email pattern
 */
async function findTestUsers() {
  console.log('🔍 Finding test users...');
  
  // Find users with test email patterns
  // Pattern: *@test.com (e.g., session1_1234567890@test.com, user1_1234567890@test.com)
  const { data: testUsers, error } = await supabase
    .from('users')
    .select('id, email, name')
    .ilike('email', '%@test.com');
  
  if (error) {
    console.error('❌ Error finding test users:', error);
    throw error;
  }
  
  // Also find users with test name patterns
  // Query each pattern separately and combine
  const namePatterns = ['%TestUser%', '%User1_%', '%User2_%', '%SessionTestUser%', '%WeekTestUser%', '%HomepageTestUser%'];
  const nameTestUsersResults = [];
  
  for (const pattern of namePatterns) {
    const { data, error: nameError } = await supabase
      .from('users')
      .select('id, email, name')
      .ilike('name', pattern);
    
    if (nameError) {
      console.error(`❌ Error finding test users by name pattern ${pattern}:`, nameError);
      // Continue with other patterns instead of throwing
    } else if (data) {
      nameTestUsersResults.push(...data);
    }
  }
  
  // Combine and deduplicate
  const allTestUsers = [...(testUsers || []), ...nameTestUsersResults];
  const uniqueTestUsers = Array.from(
    new Map(allTestUsers.map(user => [user.id, user])).values()
  );
  
  console.log(`✅ Found ${uniqueTestUsers.length} test user(s)`);
  if (uniqueTestUsers.length > 0) {
    console.log('Test users:', uniqueTestUsers.map(u => `${u.name} (${u.email})`).join(', '));
  }
  
  return uniqueTestUsers.map(u => u.id);
}

/**
 * Delete all test data in the correct order
 */
async function cleanupTestData() {
  try {
    console.log('🧹 Starting test data cleanup...\n');
    
    // Step 1: Find all test users
    const testUserIds = await findTestUsers();
    
    if (testUserIds.length === 0) {
      console.log('✅ No test data found. Database is clean!');
      return;
    }
    
    // Step 2: Find all partnerships involving test users
    console.log('\n🔍 Finding test partnerships...');
    
    // Find partnerships where userid is in test users
    const { data: partnershipsByUser, error: partnershipError1 } = await supabase
      .from('partnerships')
      .select('id, userid, partnerid')
      .in('userid', testUserIds);
    
    if (partnershipError1) {
      console.error('❌ Error finding test partnerships (by userid):', partnershipError1);
      throw partnershipError1;
    }
    
    // Find partnerships where partnerid is in test users
    const { data: partnershipsByPartner, error: partnershipError2 } = await supabase
      .from('partnerships')
      .select('id, userid, partnerid')
      .in('partnerid', testUserIds);
    
    if (partnershipError2) {
      console.error('❌ Error finding test partnerships (by partnerid):', partnershipError2);
      throw partnershipError2;
    }
    
    // Combine and deduplicate
    const allPartnerships = [...(partnershipsByUser || []), ...(partnershipsByPartner || [])];
    const uniquePartnerships = Array.from(
      new Map(allPartnerships.map(p => [p.id, p])).values()
    );
    
    const partnershipIds = uniquePartnerships.map(p => p.id);
    console.log(`✅ Found ${partnershipIds.length} test partnership(s)`);
    
    // Step 3: Find all weeks for test partnerships
    console.log('\n🔍 Finding test weeks...');
    const { data: testWeeks, error: weekError } = await supabase
      .from('weeks')
      .select('id')
      .in('partnershipid', partnershipIds);
    
    if (weekError) {
      console.error('❌ Error finding test weeks:', weekError);
      throw weekError;
    }
    
    const weekIds = (testWeeks || []).map(w => w.id);
    console.log(`✅ Found ${weekIds.length} test week(s)`);
    
    // Step 4: Find all sessions for test users, partnerships, or weeks
    console.log('\n🔍 Finding test sessions...');
    
    // Find sessions by userid
    const { data: sessionsByUser, error: sessionError1 } = testUserIds.length > 0
      ? await supabase
          .from('sessions')
          .select('id')
          .in('userid', testUserIds)
      : { data: [], error: null };
    
    if (sessionError1) {
      console.error('❌ Error finding test sessions (by userid):', sessionError1);
      throw sessionError1;
    }
    
    // Find sessions by partnershipid
    const { data: sessionsByPartnership, error: sessionError2 } = partnershipIds.length > 0
      ? await supabase
          .from('sessions')
          .select('id')
          .in('partnershipid', partnershipIds)
      : { data: [], error: null };
    
    if (sessionError2) {
      console.error('❌ Error finding test sessions (by partnershipid):', sessionError2);
      throw sessionError2;
    }
    
    // Find sessions by weekid
    const { data: sessionsByWeek, error: sessionError3 } = weekIds.length > 0
      ? await supabase
          .from('sessions')
          .select('id')
          .in('weekid', weekIds)
      : { data: [], error: null };
    
    if (sessionError3) {
      console.error('❌ Error finding test sessions (by weekid):', sessionError3);
      throw sessionError3;
    }
    
    // Combine and deduplicate
    const allSessions = [
      ...(sessionsByUser || []),
      ...(sessionsByPartnership || []),
      ...(sessionsByWeek || [])
    ];
    const uniqueSessions = Array.from(
      new Map(allSessions.map(s => [s.id, s])).values()
    );
    
    const sessionIds = uniqueSessions.map(s => s.id);
    console.log(`✅ Found ${sessionIds.length} test session(s)`);
    
    // Step 5: Delete in correct order (respecting foreign key constraints)
    console.log('\n🗑️  Deleting test data...');
    
    // Delete sessions first
    if (sessionIds.length > 0) {
      const { error: deleteSessionsError } = await supabase
        .from('sessions')
        .delete()
        .in('id', sessionIds);
      
      if (deleteSessionsError) {
        console.error('❌ Error deleting test sessions:', deleteSessionsError);
        throw deleteSessionsError;
      }
      console.log(`✅ Deleted ${sessionIds.length} session(s)`);
    }
    
    // Delete weeks
    if (weekIds.length > 0) {
      const { error: deleteWeeksError } = await supabase
        .from('weeks')
        .delete()
        .in('id', weekIds);
      
      if (deleteWeeksError) {
        console.error('❌ Error deleting test weeks:', deleteWeeksError);
        throw deleteWeeksError;
      }
      console.log(`✅ Deleted ${weekIds.length} week(s)`);
    }
    
    // Delete partnerships
    if (partnershipIds.length > 0) {
      const { error: deletePartnershipsError } = await supabase
        .from('partnerships')
        .delete()
        .in('id', partnershipIds);
      
      if (deletePartnershipsError) {
        console.error('❌ Error deleting test partnerships:', deletePartnershipsError);
        throw deletePartnershipsError;
      }
      console.log(`✅ Deleted ${partnershipIds.length} partnership(s)`);
    }
    
    // Delete users last
    if (testUserIds.length > 0) {
      const { error: deleteUsersError } = await supabase
        .from('users')
        .delete()
        .in('id', testUserIds);
      
      if (deleteUsersError) {
        console.error('❌ Error deleting test users:', deleteUsersError);
        throw deleteUsersError;
      }
      console.log(`✅ Deleted ${testUserIds.length} user(s)`);
    }
    
    console.log('\n✅ Test data cleanup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestData();

