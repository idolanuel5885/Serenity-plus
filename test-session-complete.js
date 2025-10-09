const { createClient } = require('@supabase/supabase-js');

// Test the session-complete endpoint with the provided IDs
const testSessionComplete = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const userId = '152db010-90ba-46cd-ae1f-34951de7045e';
  const partnershipId = 'fb699dbe-2b11-4bcf-9fba-27fdc237d660';

  console.log('Testing with userId:', userId);
  console.log('Testing with partnershipId:', partnershipId);

  try {
    // First, check if the partnership exists
    console.log('\n1. Checking partnership...');
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .single();

    if (partnershipError) {
      console.error('Partnership error:', partnershipError);
    } else {
      console.log('Partnership found:', partnership);
    }

    // Check if the user exists
    console.log('\n2. Checking user...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User error:', userError);
    } else {
      console.log('User found:', user);
    }

    // Check sessions table structure
    console.log('\n3. Checking sessions table structure...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('Sessions table error:', sessionsError);
    } else {
      console.log('Sessions table accessible, sample:', sessions);
    }

    // Try to create a test session
    console.log('\n4. Testing session creation...');
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        userid: userId,
        partnershipid: partnershipId,
        duration: 10,
        iscompleted: false
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
    } else {
      console.log('Session created successfully:', sessionData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

testSessionComplete();
