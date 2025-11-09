const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const prodUrl = 'https://jvogrzlxqmvovszfxhmk.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2b2dyemx4cW12b3ZzemZ4aG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2NjIsImV4cCI6MjA3NTA1MzY2Mn0.vxT_Im-yiXRF1Yqbs-CXnrz2Q9gSkULODKNy6HGVKvw';

const prodSupabase = createClient(prodUrl, prodKey);

async function checkRLS() {
  console.log('=== CHECKING PRODUCTION RLS STATUS ===\n');
  
  // Try to query partnerships - if RLS is blocking, we'll get an error
  const { data: partnerships, error: queryError } = await prodSupabase
    .from('partnerships')
    .select('*')
    .limit(1);
  
  if (queryError) {
    if (queryError.code === '42501') {
      console.log('❌ RLS is ENABLED and blocking queries in production');
      console.log('Error:', queryError.message);
    } else {
      console.log('⚠️  Error querying partnerships (not RLS):', queryError.message);
    }
  } else {
    console.log('✅ RLS allows queries in production (RLS might be disabled or permissive)');
  }
  
  // Try to insert (we know this will fail due to NOT NULL, but let's see the error)
  const { data: users } = await prodSupabase
    .from('users')
    .select('id')
    .limit(2);
  
  if (users && users.length >= 2) {
    const testData = {
      userid: users[0].id,
      partnerid: users[1].id,
      weeklygoal: 10,
      usersits: 0,
      partnersits: 0,
      score: 0,
      currentweekstart: new Date().toISOString(),
    };
    
    const { error: insertError } = await prodSupabase
      .from('partnerships')
      .insert([testData])
      .select()
      .single();
    
    if (insertError) {
      if (insertError.code === '42501') {
        console.log('\n❌ RLS is ENABLED and blocking inserts in production');
        console.log('Error:', insertError.message);
      } else if (insertError.code === '23502') {
        console.log('\n✅ RLS allows inserts, but NOT NULL constraint fails');
        console.log('This means RLS is either disabled or permissive');
        console.log('Error:', insertError.message);
      } else {
        console.log('\n⚠️  Insert error (not RLS):', insertError.message);
      }
    } else {
      console.log('\n✅ RLS allows inserts in production');
    }
  }
}

checkRLS().catch(console.error);


