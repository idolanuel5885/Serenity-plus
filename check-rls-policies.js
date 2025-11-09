const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const prodUrl = 'https://jvogrzlxqmvovszfxhmk.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2b2dyemx4cW12b3ZzemZ4aG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2NjIsImV4cCI6MjA3NTA1MzY2Mn0.vxT_Im-yiXRF1Yqbs-CXnrz2Q9gSkULODKNy6HGVKvw';

const prodSupabase = createClient(prodUrl, prodKey);

async function checkRLS() {
  console.log('=== CHECKING PRODUCTION RLS POLICIES ===\n');
  
  // Try to insert a test partnership to see if RLS blocks it
  console.log('Testing if RLS blocks partnership creation in production...\n');
  
  // First, get a user to test with
  const { data: users, error: usersError } = await prodSupabase
    .from('users')
    .select('id')
    .limit(2);
  
  if (usersError || !users || users.length < 2) {
    console.log('Cannot test - need at least 2 users in production');
    console.log('Users error:', usersError);
    return;
  }
  
  const user1 = users[0].id;
  const user2 = users[1].id;
  
  console.log(`Testing with users: ${user1} and ${user2}`);
  
  // Try to create a partnership
  const testPartnership = {
    userid: user1,
    partnerid: user2,
    weeklygoal: 10,
    usersits: 0,
    partnersits: 0,
    score: 0,
    currentweekstart: new Date().toISOString(),
  };
  
  const { data: partnership, error: partnershipError } = await prodSupabase
    .from('partnerships')
    .insert([testPartnership])
    .select()
    .single();
  
  if (partnershipError) {
    console.log('❌ RLS BLOCKS partnership creation in production');
    console.log('Error:', partnershipError.message);
    console.log('Error code:', partnershipError.code);
  } else {
    console.log('✅ RLS allows partnership creation in production');
    console.log('Created partnership:', partnership.id);
    
    // Clean up - delete the test partnership
    await prodSupabase
      .from('partnerships')
      .delete()
      .eq('id', partnership.id);
    console.log('Cleaned up test partnership');
  }
  
  // Check if we can query partnerships
  console.log('\n--- Testing partnership queries ---');
  const { data: partnerships, error: queryError } = await prodSupabase
    .from('partnerships')
    .select('*')
    .limit(1);
  
  if (queryError) {
    console.log('❌ RLS blocks partnership queries');
    console.log('Error:', queryError.message);
  } else {
    console.log('✅ RLS allows partnership queries');
  }
}

checkRLS().catch(console.error);


