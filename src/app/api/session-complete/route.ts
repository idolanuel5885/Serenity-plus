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
      try {
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
          
          // If it's a table doesn't exist error or RLS error, return success anyway
          if (sessionError.code === 'PGRST116' || sessionError.code === '42P01' || sessionError.message.includes('relation "sessions" does not exist')) {
            console.log('Sessions table not accessible, continuing without session tracking');
            return NextResponse.json({
              success: true,
              data: {
                message: 'Session started (tracking unavailable)'
              }
            });
          }
          
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
      } catch (error) {
        console.error('Unexpected error creating session:', error);
        // Return success anyway to not break the meditation flow
        return NextResponse.json({
          success: true,
          data: {
            message: 'Session started (tracking unavailable)'
          }
        });
      }
    }

    if (completed) {
      // Session completed - update session record
      try {
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
          
          // If it's a table doesn't exist error or RLS error, return success anyway
          if (sessionError.code === 'PGRST116' || sessionError.code === '42P01' || sessionError.message.includes('relation "sessions" does not exist')) {
            console.log('Sessions table not accessible, continuing without session tracking');
            return NextResponse.json({
              success: true,
              data: {
                message: 'Session completed (tracking unavailable)',
                sessionDuration,
                completed: true
              }
            });
          }
          
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
      } catch (error) {
        console.error('Unexpected error completing session:', error);
        // Return success anyway to not break the meditation flow
        return NextResponse.json({
          success: true,
          data: {
            message: 'Session completed (tracking unavailable)',
            sessionDuration,
            completed: true
          }
        });
      }
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
