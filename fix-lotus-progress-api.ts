// Fixed version of the lotus progress API
// This removes the dependency on partnership.weeklygoal

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateLotusProgress } from '@/lib/lotusProgress';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnershipId = searchParams.get('partnershipId');
    // const isMeditationActive = searchParams.get('isMeditationActive') === 'true';
    const sessionDuration = searchParams.get('sessionDuration') ? parseInt(searchParams.get('sessionDuration')!) : undefined;
    const sessionElapsed = searchParams.get('sessionElapsed') ? parseInt(searchParams.get('sessionElapsed')!) : undefined;

    if (!userId || !partnershipId) {
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    // Get current week data directly from weeks table
    const { data: currentWeek, error: weekError } = await supabase
      .from('weeks')
      .select('*')
      .eq('partnershipid', partnershipId)
      .gte('weekstart', new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString())
      .lte('weekstart', new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)).toISOString())
      .single();

    if (weekError || !currentWeek) {
      return NextResponse.json({ error: 'Current week not found' }, { status: 404 });
    }

    // Calculate current progress using current week data
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
    console.error('Error calculating lotus progress:', error);
    return NextResponse.json({ error: 'Failed to calculate progress' }, { status: 500 });
  }
}

