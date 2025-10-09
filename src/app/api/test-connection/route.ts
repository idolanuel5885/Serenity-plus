import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('Supabase connection error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase connection failed',
        details: error.message 
      }, { status: 500 });
    }

    console.log('Supabase connection successful');
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      data: data 
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
