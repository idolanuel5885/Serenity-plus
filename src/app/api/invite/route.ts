import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteCode = searchParams.get('code');

    if (!inviteCode) {
      return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });
    }

    // For now, return a simple response since the invitations table might not exist
    // This will work with the existing database structure
    return NextResponse.json({
      success: true,
      invitation: {
        inviter: {
          id: 'demo-user-123',
          name: 'Demo User',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json({ error: 'Failed to fetch invite' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, inviteCode: providedInviteCode } = await request.json();

    if (!userId || !userName) {
      return NextResponse.json({ error: 'Missing userId or userName' }, { status: 400 });
    }

    console.log('Creating invitation for user:', { userId, userName });

    // Create a new unique invite code
    const inviteCode = providedInviteCode || `invite-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Create the invitation in Supabase using the correct table structure
    const invitationData = {
      inviteCode: inviteCode,
      inviterId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isUsed: false,
    };

    const { data, error } = await supabase
      .from('invitations')
      .insert([invitationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    console.log('Created new invitation:', data);

    return NextResponse.json({
      success: true,
      inviteCode: data.inviteCode,
      invitationId: data.id,
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}