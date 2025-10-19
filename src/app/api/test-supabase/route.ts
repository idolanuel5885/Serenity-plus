import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');

    // Test 1: Check if we can connect to Supabase
    const { error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Supabase connection error:', testError);
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: testError.message,
      });
    }

    // Test 2: Try to insert a test user
    const testUser = {
      id: `test-${Date.now()}`,
      name: 'Test User',
      email: 'test@example.com',
      weeklytarget: 5,
      usualsitlength: 30,
      image: '/icons/meditation-1.svg',
      invitecode: 'test-invite-123',
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Supabase insert failed',
        details: insertError.message,
      });
    }

    // Test 3: Try to read the test user back
    const { data: readData, error: readError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id);

    if (readError) {
      console.error('Supabase read error:', readError);
      return NextResponse.json({
        success: false,
        error: 'Supabase read failed',
        details: readError.message,
      });
    }

    // Clean up test data
    await supabase.from('users').delete().eq('id', testUser.id);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      testData: readData,
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
