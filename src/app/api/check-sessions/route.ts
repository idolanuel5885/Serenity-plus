import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking sessions table...');
    
    // Try to query the sessions table to see if it exists and is accessible
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Sessions table error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sessions table is accessible',
      sampleData: data,
      rowCount: data?.length || 0
    });
    
  } catch (error) {
    console.error('Error checking sessions table:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
