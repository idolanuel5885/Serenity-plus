import { NextRequest, NextResponse } from 'next/server';
import { createPartnershipsForUser } from '../../../lib/supabase-database';

export async function POST(request: NextRequest) {
  try {
    const { userId, inviteCode } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    console.log('Creating partnerships for user:', { userId, inviteCode });

    // Use the existing function that handles invite codes properly
    const partnerships = await createPartnershipsForUser(userId, inviteCode);

    return NextResponse.json({
      success: true,
      partnerships: partnerships,
      count: partnerships.length
    });
  } catch (error) {
    console.error('Error creating partnerships:', error);
    return NextResponse.json({ 
      error: 'Failed to create partnerships',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
