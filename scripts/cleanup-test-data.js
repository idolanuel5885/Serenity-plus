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
 * Batch an array into smaller chunks
 */
function batchArray(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Query with batching to avoid Supabase query size limits
 */
async function queryInBatches(table, column, ids, select = '*', batchSize = 100) {
  if (ids.length === 0) return [];
  
  const batches = batchArray(ids, batchSize);
  const allResults = [];
  
  for (const batch of batches) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .in(column, batch);
    
    if (error) {
      console.error(`❌ Error querying ${table} with batch:`, error);
      throw error;
    }
    
    if (data) {
      allResults.push(...data);
    }
  }
  
  return allResults;
}

/**
 * Delete in batches to avoid Supabase query size limits
 */
async function deleteInBatches(table, column, ids, batchSize = 100) {
  if (ids.length === 0) return 0;
  
  const batches = batchArray(ids, batchSize);
  let totalDeleted = 0;
  
  for (const batch of batches) {
    const { error } = await supabase
      .from(table)
      .delete()
      .in(column, batch);
    
    if (error) {
      console.error(`❌ Error deleting from ${table} with batch:`, error);
      throw error;
    }
    
    totalDeleted += batch.length;
  }
  
  return totalDeleted;
}

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
  if (uniqueTestUsers.length > 0 && uniqueTestUsers.length <= 10) {
    console.log('Test users:', uniqueTestUsers.map(u => `${u.name} (${u.email})`).join(', '));
  } else if (uniqueTestUsers.length > 10) {
    console.log(`Sample users: ${uniqueTestUsers.slice(0, 3).map(u => `${u.name} (${u.email})`).join(', ')}... (and ${uniqueTestUsers.length - 3} more)`);
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
    
    // Find partnerships where userid is in test users (batched)
    const partnershipsByUser = await queryInBatches('partnerships', 'userid', testUserIds, 'id, userid, partnerid');
    
    // Find partnerships where partnerid is in test users (batched)
    const partnershipsByPartner = await queryInBatches('partnerships', 'partnerid', testUserIds, 'id, userid, partnerid');
    
    // Combine and deduplicate
    const allPartnerships = [...partnershipsByUser, ...partnershipsByPartner];
    const uniquePartnerships = Array.from(
      new Map(allPartnerships.map(p => [p.id, p])).values()
    );
    
    const partnershipIds = uniquePartnerships.map(p => p.id);
    console.log(`✅ Found ${partnershipIds.length} test partnership(s)`);
    
    // Step 3: Find all weeks for test partnerships
    console.log('\n🔍 Finding test weeks...');
    const testWeeks = await queryInBatches('weeks', 'partnershipid', partnershipIds, 'id');
    
    const weekIds = testWeeks.map(w => w.id);
    console.log(`✅ Found ${weekIds.length} test week(s)`);
    
    // Step 4: Find all sessions for test users, partnerships, or weeks
    console.log('\n🔍 Finding test sessions...');
    
    // Find sessions by userid (batched)
    const sessionsByUser = testUserIds.length > 0
      ? await queryInBatches('sessions', 'userid', testUserIds, 'id')
      : [];
    
    // Find sessions by partnershipid (batched)
    const sessionsByPartnership = partnershipIds.length > 0
      ? await queryInBatches('sessions', 'partnershipid', partnershipIds, 'id')
      : [];
    
    // Find sessions by weekid (batched)
    const sessionsByWeek = weekIds.length > 0
      ? await queryInBatches('sessions', 'weekid', weekIds, 'id')
      : [];
    
    // Combine and deduplicate
    const allSessions = [
      ...sessionsByUser,
      ...sessionsByPartnership,
      ...sessionsByWeek
    ];
    const uniqueSessions = Array.from(
      new Map(allSessions.map(s => [s.id, s])).values()
    );
    
    const sessionIds = uniqueSessions.map(s => s.id);
    console.log(`✅ Found ${sessionIds.length} test session(s)`);
    
    // Step 5: Delete in correct order (respecting foreign key constraints)
    console.log('\n🗑️  Deleting test data...');
    
    // Delete sessions first (batched)
    if (sessionIds.length > 0) {
      const deletedCount = await deleteInBatches('sessions', 'id', sessionIds);
      console.log(`✅ Deleted ${deletedCount} session(s)`);
    }
    
    // Delete weeks (batched)
    if (weekIds.length > 0) {
      const deletedCount = await deleteInBatches('weeks', 'id', weekIds);
      console.log(`✅ Deleted ${deletedCount} week(s)`);
    }
    
    // Delete partnerships (batched)
    if (partnershipIds.length > 0) {
      const deletedCount = await deleteInBatches('partnerships', 'id', partnershipIds);
      console.log(`✅ Deleted ${deletedCount} partnership(s)`);
    }
    
    // Delete users last (batched)
    if (testUserIds.length > 0) {
      const deletedCount = await deleteInBatches('users', 'id', testUserIds);
      console.log(`✅ Deleted ${deletedCount} user(s)`);
    }
    
    console.log('\n✅ Test data cleanup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestData();

