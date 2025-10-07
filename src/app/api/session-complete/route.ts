import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ensureCurrentWeekExists, updateWeekSits } from '@/lib/supabase-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, completed, sessionStarted } = body;

    if (!userId || !partnershipId || !sessionDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get partnership data from Supabase
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

    // Create session record when session starts
    if (sessionStarted) {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          userid: userId,
          partnershipid: partnershipId,
          duration: Math.floor(sessionDuration / 60), // Convert seconds to minutes
          iscompleted: false,
          startedat: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          sessionId: sessionData.id,
          message: 'Session started'
        }
      });
    }

    // Only update database if session was completed
    if (completed) {
      // Determine which user completed the session
      const isUser1 = partnership.user1id === userId;
      
      // Update session record to mark as completed
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          iscompleted: true,
          completedat: new Date().toISOString()
        })
        .eq('userid', userId)
        .eq('partnershipid', partnershipId)
        .eq('iscompleted', false)
        .order('startedat', { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error('Error updating session:', sessionError);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
      }

      // Ensure current week exists (should already exist)
      const currentWeek = await ensureCurrentWeekExists(partnershipId, partnership.weeklygoal);
      if (!currentWeek) {
        return NextResponse.json({ error: 'Failed to get or create current week' }, { status: 500 });
      }

      // Update week sit counts
      const newSitCount = isUser1 ? currentWeek.user1sits + 1 : currentWeek.user2sits + 1;
      const updatedWeek = await updateWeekSits(currentWeek.id, isUser1, newSitCount);
      
      if (!updatedWeek) {
        return NextResponse.json({ error: 'Failed to update week sits' }, { status: 500 });
      }

      const totalSits = updatedWeek.user1sits + updatedWeek.user2sits;
      const goalMet = totalSits >= updatedWeek.weeklygoal;

      return NextResponse.json({
        success: true,
        data: {
          user1Sits: updatedWeek.user1sits,
          user2Sits: updatedWeek.user2sits,
          totalSits,
          goalMet,
          progress: Math.min((totalSits / updatedWeek.weeklygoal) * 100, 100)
        }
      });
    } else {
      // Session was interrupted, no database update
      return NextResponse.json({
        success: true,
        data: {
          message: 'Session interrupted, no progress saved'
        }
      });
    }

  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
