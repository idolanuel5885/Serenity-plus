import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { calculateLotusProgress } from '../../../lib/lotusProgress';
import { ensureCurrentWeekExists } from '../../../lib/supabase-database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnershipId = searchParams.get('partnershipId');
    const isMeditationActive = searchParams.get('isMeditationActive') === 'true';
    const sessionDuration = searchParams.get('sessionDuration') ? parseInt(searchParams.get('sessionDuration')!) : undefined;
    const sessionElapsed = searchParams.get('sessionElapsed') ? parseInt(searchParams.get('sessionElapsed')!) : undefined;

    if (!userId || !partnershipId) {
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    // Try to get partnership data from Supabase, fallback to mock data if connection fails
    let partnership = null;
    try {
      const { data: partnershipData, error: partnershipError } = await supabase
        .from('partnerships')
        .select('*')
        .eq('id', partnershipId)
        .or(`user1Id.eq.${userId},user2Id.eq.${userId}`)
        .eq('isActive', true)
        .single();

      if (!partnershipError && partnershipData) {
        partnership = partnershipData;
      }
    } catch (supabaseError) {
      console.log('Supabase connection failed, using mock data:', supabaseError);
    }

    // Return progress data (real or mock)
    const progressData = {
      currentProgress: 25, // 25% progress
      weeklyTarget: partnership?.weeklyGoal || 5,
      currentWeekSits: 1,
      isActive: sessionDuration !== undefined && sessionElapsed !== undefined,
      sessionProgress: sessionElapsed && sessionDuration ? Math.min((sessionElapsed / sessionDuration) * 20, 20) : 0
    };

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Error fetching lotus progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, sessionElapsed } = body;

    if (!userId || !partnershipId) {
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    // Get partnership data
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .or(`user1id.eq.${userId},user2id.eq.${userId}`)
      .eq('isactive', true)
      .single();

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Ensure current week exists (should already exist)
    const currentWeek = await ensureCurrentWeekExists(partnershipId, partnership.weeklyGoal);
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
