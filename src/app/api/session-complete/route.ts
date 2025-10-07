import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, completed } = body;

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

    // Only update database if session was completed
    if (completed) {
      // Determine which user completed the session
      const isUser1 = partnership.user1id === userId;
      
      // Create session record in Supabase
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          userid: userId,
          partnershipid: partnershipId,
          duration: Math.floor(sessionDuration / 60), // Convert seconds to minutes
          iscompleted: true,
          completedat: new Date().toISOString()
        });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }

      // Update partnership sit counts
      const updateData = isUser1 
        ? { user1sits: partnership.user1sits + 1 }
        : { user2sits: partnership.user2sits + 1 };

      const { error: updateError } = await supabase
        .from('partnerships')
        .update(updateData)
        .eq('id', partnershipId);

      if (updateError) {
        console.error('Error updating partnership:', updateError);
        return NextResponse.json({ error: 'Failed to update partnership' }, { status: 500 });
      }

      // Get updated partnership data
      const { data: updatedPartnership, error: fetchError } = await supabase
        .from('partnerships')
        .select('user1sits, user2sits, weeklygoal')
        .eq('id', partnershipId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated partnership:', fetchError);
        return NextResponse.json({ error: 'Failed to fetch updated data' }, { status: 500 });
      }

      const totalSits = (updatedPartnership?.user1sits || 0) + (updatedPartnership?.user2sits || 0);
      const goalMet = totalSits >= partnership.weeklygoal;

      return NextResponse.json({
        success: true,
        data: {
          user1Sits: updatedPartnership?.user1sits || 0,
          user2Sits: updatedPartnership?.user2sits || 0,
          totalSits,
          goalMet,
          progress: Math.min((totalSits / partnership.weeklygoal) * 100, 100)
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
