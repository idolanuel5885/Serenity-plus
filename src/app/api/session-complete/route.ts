import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  console.log('SESSION-COMPLETE API ENTRY');
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, completed, sessionStarted } = body;

    console.log('SESSION-COMPLETE API CALLED WITH:', { userId, partnershipId, sessionDuration, completed, sessionStarted });
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    // Debug: Check what users and partnerships exist in the database
    console.log('=== DEBUGGING DATABASE STATE ===');
    const { data: allUsers } = await supabase.from('users').select('id, name, email').limit(5);
    console.log('All users in database:', allUsers);
    
    const { data: allPartnerships } = await supabase.from('partnerships').select('id, userid, partnerid').limit(5);
    console.log('All partnerships in database:', allPartnerships);
    console.log('=== END DEBUGGING ===');

    if (!userId || !partnershipId || !sessionDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (sessionStarted) {
      // First, verify that user and partnership exist
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (userError || !userData) {
        console.error('User not found:', userId, userError);
        return NextResponse.json({ 
          error: 'User not found',
          details: `User ${userId} does not exist in database`
        }, { status: 400 });
      }

      const { data: partnershipData, error: partnershipError } = await supabase
        .from('partnerships')
        .select('id')
        .eq('id', partnershipId)
        .maybeSingle();

      if (partnershipError || !partnershipData) {
        console.error('Partnership not found:', partnershipId, partnershipError);
        return NextResponse.json({ 
          error: 'Partnership not found',
          details: `Partnership ${partnershipId} does not exist in database`
        }, { status: 400 });
      }

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
        .maybeSingle();

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
        console.log('PROCESSING SESSION COMPLETION');
        console.log('Processing completed session for userId:', userId, 'partnershipId:', partnershipId);
        
        // Session completed - update session record
        // Try to update with iscompleted column first, fallback to just completedat if column doesn't exist
        let sessionError = null;
        let sessionUpdateAttempted = false;
        
        // First attempt: try with iscompleted column
        const { error: sessionErrorWithIsCompleted } = await supabase
          .from('sessions')
          .update({
            completedat: new Date().toISOString(),
            iscompleted: true
          })
          .eq('userid', userId)
          .eq('partnershipid', partnershipId)
          .eq('iscompleted', false)
          .select()
          .maybeSingle();

        if (sessionErrorWithIsCompleted) {
          console.warn('Session update with iscompleted failed, trying without iscompleted filter:', sessionErrorWithIsCompleted);
          
          // Second attempt: try without iscompleted filter (in case column doesn't exist)
          const { error: sessionErrorWithoutIsCompleted } = await supabase
            .from('sessions')
            .update({
              completedat: new Date().toISOString()
            })
            .eq('userid', userId)
            .eq('partnershipid', partnershipId)
            .is('completedat', null)
            .select()
            .maybeSingle();

          if (sessionErrorWithoutIsCompleted) {
            console.error('Session update failed even without iscompleted:', sessionErrorWithoutIsCompleted);
            sessionError = sessionErrorWithoutIsCompleted;
          } else {
            console.log('Session updated successfully without iscompleted column');
            sessionUpdateAttempted = true;
          }
        } else {
          console.log('Session updated successfully with iscompleted column');
          sessionUpdateAttempted = true;
        }

        // Log error but don't block weeks update - we still want to update the weeks table
        if (sessionError && !sessionUpdateAttempted) {
          console.error('Error completing session (non-blocking):', sessionError);
          console.error('Session completion error details:', {
            code: sessionError.code,
            message: sessionError.message,
            details: sessionError.details,
            hint: sessionError.hint
          });
          // Continue anyway - we'll still update the weeks table
        }

      // Update the weeks table to increment sit count
      console.log('Updating weeks table for completed session...');
      
      // First, get the partnership to determine if user is user1 or user2
      const { data: partnershipData, error: partnershipError } = await supabase
        .from('partnerships')
        .select('userid, partnerid')
        .eq('id', partnershipId)
        .maybeSingle();

      if (partnershipError) {
        console.error('Error fetching partnership data:', partnershipError);
        return NextResponse.json({ 
          error: 'Failed to fetch partnership data',
          details: partnershipError.message
        }, { status: 500 });
      }

      if (!partnershipData) {
        console.error('Partnership not found:', partnershipId);
        return NextResponse.json({ 
          error: 'Partnership not found',
          details: 'Partnership does not exist'
        }, { status: 404 });
      }

            // Determine if the user is user1 or user2 in the partnership
            const isUser1 = partnershipData.userid === userId;
            const isUser2 = partnershipData.partnerid === userId;

            console.log('USER1/USER2 IDENTIFICATION:');
            console.log('Partnership data:', partnershipData);
            console.log('Current userId:', userId);
            console.log('Is user1:', isUser1);
            console.log('Is user2:', isUser2);

      if (!isUser1 && !isUser2) {
        console.error('User is not part of this partnership');
        return NextResponse.json({ 
          error: 'User is not part of this partnership'
        }, { status: 400 });
      }

      // Get current week for this partnership
      console.log('Fetching current week for partnership:', partnershipId);
      const { data: currentWeek, error: weekError } = await supabase
        .from('weeks')
        .select('*')
        .eq('partnershipid', partnershipId)
        .order('weeknumber', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (weekError) {
        console.error('Error fetching current week:', weekError);
        console.error('Week error details:', {
          code: weekError.code,
          message: weekError.message,
          details: weekError.details
        });
        
        // If no week exists, we need to create one
        if (weekError.code === 'PGRST116') {
          console.log('No week exists, creating new week...');
          
          // Get partnership data to get weekly goal
          const { data: partnershipForWeek, error: partnershipWeekError } = await supabase
            .from('partnerships')
            .select('weeklygoal')
            .eq('id', partnershipId)
            .maybeSingle();

          if (partnershipWeekError) {
            console.error('Error fetching partnership for week creation:', partnershipWeekError);
            return NextResponse.json({ 
              error: 'Failed to fetch partnership for week creation',
              details: partnershipWeekError.message
            }, { status: 500 });
          }

          if (!partnershipForWeek) {
            console.error('Partnership not found for week creation:', partnershipId);
            return NextResponse.json({ 
              error: 'Partnership not found for week creation',
              details: 'Partnership does not exist'
            }, { status: 404 });
          }

          // Create new week
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7); // End of current week
          endOfWeek.setHours(23, 59, 59, 999);

          const { data: newWeek, error: createWeekError } = await supabase
            .from('weeks')
            .insert({
              partnershipid: partnershipId,
              weeknumber: 1,
              weekstart: startOfWeek.toISOString(),
              weekend: endOfWeek.toISOString(),
              weeklygoal: partnershipForWeek.weeklygoal,
              user1sits: 0,
              user2sits: 0
            })
            .select()
            .maybeSingle();

          if (createWeekError) {
            console.error('Error creating new week:', createWeekError);
            return NextResponse.json({ 
              error: 'Failed to create new week',
              details: createWeekError.message
            }, { status: 500 });
          }

          console.log('Created new week:', newWeek);
          
          // Now update the sit count
          const newWeekUpdateData = isUser1 
            ? { user1sits: 1 }
            : { user2sits: 1 };

          const { data: updatedWeek, error: updateWeekError } = await supabase
            .from('weeks')
            .update(newWeekUpdateData)
            .eq('id', newWeek.id)
            .select()
            .maybeSingle();

          if (updateWeekError) {
            console.error('Error updating new week sits:', updateWeekError);
            return NextResponse.json({ 
              error: 'Failed to update new week sits',
              details: updateWeekError.message
            }, { status: 500 });
          }

          console.log('Successfully updated new week sits:', updatedWeek);

          return NextResponse.json({
            success: true,
            data: {
              message: 'Session completed successfully',
              sessionDuration,
              completed: true,
              weekCreated: true,
              weekUpdated: true
            }
          });
        }
        
        return NextResponse.json({ 
          error: 'Failed to fetch current week',
          details: weekError.message
        }, { status: 500 });
      }

      console.log('Found current week:', currentWeek);

      // Update the appropriate sit count in the weeks table
      const updateData = isUser1 
        ? { user1sits: (currentWeek.user1sits || 0) + 1 }
        : { user2sits: (currentWeek.user2sits || 0) + 1 };

      const { data: updatedWeek, error: updateWeekError } = await supabase
        .from('weeks')
        .update(updateData)
        .eq('id', currentWeek.id)
        .select()
        .maybeSingle();

      if (updateWeekError) {
        console.error('Error updating week sits:', updateWeekError);
        return NextResponse.json({ 
          error: 'Failed to update week sits',
          details: updateWeekError.message
        }, { status: 500 });
      }

        console.log('Successfully updated week sits:', updatedWeek);
        console.log('=== SESSION COMPLETION SUCCESS ===');

        return NextResponse.json({
          success: true,
          data: {
            message: 'Session completed successfully',
            sessionDuration,
            completed: true,
            sessionUpdated: sessionUpdateAttempted,
            weekUpdated: true,
            sessionUpdateError: sessionError ? {
              code: sessionError.code,
              message: sessionError.message
            } : null
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
