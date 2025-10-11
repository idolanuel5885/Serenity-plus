import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, completed, sessionStarted } = body;

    console.log('Session API called with:', { userId, partnershipId, sessionDuration, completed, sessionStarted });
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

    if (!userId || !partnershipId || !sessionDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (sessionStarted) {
      // Session started - create session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          userid: userId,
          partnershipid: partnershipId,
          duration: sessionDuration,
          iscompleted: false
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        console.error('Session error details:', {
          code: sessionError.code,
          message: sessionError.message,
          details: sessionError.details,
          hint: sessionError.hint
        });
        return NextResponse.json({ 
          error: 'Failed to create session',
          details: sessionError.message,
          code: sessionError.code
        }, { status: 500 });
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
          completedat: new Date().toISOString(),
          iscompleted: true
        })
        .eq('userid', userId)
        .eq('partnershipid', partnershipId)
        .eq('iscompleted', false)
        .select()
        .single();

      if (sessionError) {
        console.error('Error completing session:', sessionError);
        console.error('Session completion error details:', {
          code: sessionError.code,
          message: sessionError.message,
          details: sessionError.details,
          hint: sessionError.hint
        });
        return NextResponse.json({ 
          error: 'Failed to complete session',
          details: sessionError.message,
          code: sessionError.code
        }, { status: 500 });
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
