const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const prodUrl = 'https://jvogrzlxqmvovszfxhmk.supabase.co';
const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2b2dyemx4cW12b3ZzemZ4aG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2NjIsImV4cCI6MjA3NTA1MzY2Mn0.vxT_Im-yiXRF1Yqbs-CXnrz2Q9gSkULODKNy6HGVKvw';

const prodSupabase = createClient(prodUrl, prodKey);

async function checkPartnerships() {
  console.log('=== CHECKING PRODUCTION PARTNERSHIPS ===\n');
  
  // Get existing partnerships to see their structure
  const { data: partnerships, error } = await prodSupabase
    .from('partnerships')
    .select('*')
    .limit(3);
  
  if (error) {
    console.log('Error querying partnerships:', error.message);
    return;
  }
  
  if (!partnerships || partnerships.length === 0) {
    console.log('No partnerships found in production');
    return;
  }
  
  console.log(`Found ${partnerships.length} partnership(s) in production:\n`);
  
  partnerships.forEach((p, i) => {
    console.log(`--- Partnership ${i + 1} ---`);
    console.log('ID:', p.id);
    console.log('UserID:', p.userid);
    console.log('PartnerID:', p.partnerid);
    console.log('PartnerName:', p.partnername);
    console.log('PartnerEmail:', p.partneremail);
    console.log('PartnerImage:', p.partnerimage);
    console.log('PartnerWeeklyTarget:', p.partnerweeklytarget);
    console.log('WeeklyGoal:', p.weeklygoal);
    console.log('CreatedAt:', p.createdat);
    console.log('');
  });
  
  // Check if partnername is required (NOT NULL)
  console.log('--- Checking if partnername is required ---');
  const sample = partnerships[0];
  if (sample.partnername === null || sample.partnername === undefined) {
    console.log('⚠️  partnername can be NULL in existing partnerships');
  } else {
    console.log('✅ partnername has values in existing partnerships');
  }
}

checkPartnerships().catch(console.error);


