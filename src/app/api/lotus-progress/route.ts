import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { calculateLotusProgress } from '../../../lib/lotusProgress';
import { ensureCurrentWeekExists } from '../../../lib/supabase-database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    // Check if we're in build mode (no environment variables)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Build mode detected - returning empty progress data');
      return NextResponse.json({
        success: true,
        data: {
          currentProgress: 0,
          totalSits: 0,
          completedSits: 0,
          weeklyGoal: 5,
          isActive: false
        }
      });
    }

    console.log('Lotus progress API called with:', { 
      userId: searchParams.get('userId'), 
      partnershipId: searchParams.get('partnershipId') 
    });

    const userId = searchParams.get('userId');
    const partnershipId = searchParams.get('partnershipId');
    // const isMeditationActive = searchParams.get('isMeditationActive') === 'true';
    const sessionDuration = searchParams.get('sessionDuration') ? parseInt(searchParams.get('sessionDuration')!) : undefined;
    const sessionElapsed = searchParams.get('sessionElapsed') ? parseInt(searchParams.get('sessionElapsed')!) : undefined;

    if (!userId || !partnershipId) {
      console.log('Missing required parameters');
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    console.log('Step 1: Querying partnership data...');
    // Get partnership data from Supabase
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .or(`userid.eq.${userId},partnerid.eq.${userId}`)
      .single();

    if (partnershipError) {
      console.log('Partnership query error:', partnershipError);
      return NextResponse.json({ 
        error: 'Partnership query failed', 
        details: partnershipError.message 
      }, { status: 500 });
    }

    if (!partnership) {
      console.log('Partnership not found');
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    console.log('Partnership data:', partnership);
    console.log('Partnership weeklygoal:', partnership.weeklygoal);
    console.log('Step 2: Partnership found, getting current week...');
    // Get current week data
    const currentWeek = await ensureCurrentWeekExists(partnershipId, partnership.weeklygoal);
    if (!currentWeek) {
      console.log('Failed to get or create current week');
      return NextResponse.json({ error: 'Failed to get current week' }, { status: 500 });
    }

    console.log('Step 3: Calculating progress...');
    // Calculate real progress
    const progressData = calculateLotusProgress(
      currentWeek,
      userId,
      sessionDuration,
      sessionElapsed
    );

    console.log('Step 4: Returning success response');
    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Error fetching lotus progress:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: searchParams.get('userId'),
      partnershipId: searchParams.get('partnershipId')
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: any = null;
  try {
    // Check if we're in build mode (no environment variables)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Build mode detected - returning empty progress data');
      return NextResponse.json({
        success: true,
        data: {
          currentProgress: 0,
          totalSits: 0,
          completedSits: 0,
          weeklyGoal: 5,
          isActive: false
        }
      });
    }

    body = await request.json();
    const { userId, partnershipId, sessionDuration, sessionElapsed } = body;

    if (!userId || !partnershipId) {
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    // Get partnership data
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .or(`userid.eq.${userId},partnerid.eq.${userId}`)
      .single();

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Ensure current week exists (should already exist)
    const currentWeek = await ensureCurrentWeekExists(partnershipId, partnership.weeklygoal);
    if (!currentWeek) {
      return NextResponse.json({ error: 'Failed to get or create current week' }, { status: 500 });
    }

    // Calculate progress with current session data using current week
    const progressData = calculateLotusProgress(
      currentWeek,
      userId,
      sessionDuration,
      sessionElapsed
    );

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Error updating lotus progress:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: body?.userId,
      partnershipId: body?.partnershipId
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
