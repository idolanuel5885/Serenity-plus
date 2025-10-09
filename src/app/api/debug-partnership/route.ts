import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnershipId = searchParams.get('partnershipId');

    if (!userId || !partnershipId) {
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    // Test partnership query
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .or(`userid.eq.${userId},partnerid.eq.${userId}`)
      .single();

    if (partnershipError) {
      return NextResponse.json({ 
        error: 'Partnership query failed',
        details: partnershipError,
        userId,
        partnershipId
      }, { status: 400 });
    }

    if (!partnership) {
      return NextResponse.json({ 
        error: 'Partnership not found',
        userId,
        partnershipId
      }, { status: 404 });
    }

    // Test weeks query
    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId);

    if (weeksError) {
      return NextResponse.json({ 
        error: 'Weeks query failed',
        details: weeksError,
        partnershipId
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      partnership,
      weeks: weeks || [],
      userId,
      partnershipId
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      userId: searchParams.get('userId'),
      partnershipId: searchParams.get('partnershipId')
    }, { status: 500 });
  }
}
