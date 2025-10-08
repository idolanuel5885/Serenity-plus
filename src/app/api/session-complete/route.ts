import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, completed, sessionStarted } = body;

    console.log('Session API called with:', { userId, partnershipId, sessionDuration, completed, sessionStarted });

    if (!userId || !partnershipId || !sessionDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (sessionStarted) {
      // Session started - create session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          userId,
          partnershipId,
          duration: sessionDuration,
          isCompleted: false
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

    if (completed) {
      // Session completed - update session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .update({
          completedAt: new Date().toISOString(),
          isCompleted: true
        })
        .eq('userId', userId)
        .eq('partnershipId', partnershipId)
        .eq('isCompleted', false)
        .select()
        .single();

      if (sessionError) {
        console.error('Error completing session:', sessionError);
        return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          message: 'Session completed successfully',
          sessionDuration,
          completed: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Session updated'
      }
    });

  } catch (error) {
    console.error('Error in session-complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
