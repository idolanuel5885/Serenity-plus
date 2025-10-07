import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, completed, sessionStarted } = body;

    console.log('Session API called with:', { userId, partnershipId, sessionDuration, completed, sessionStarted });

    if (!userId || !partnershipId || !sessionDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Demo mode: Handle session completion without database
    if (sessionStarted) {
      // Session started - return session ID
      const sessionId = `demo-session-${Date.now()}`;
      
      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          message: 'Session started (demo mode)'
        },
        demo: true
      });
    }

    // Session completed - return success
    if (completed) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Session completed successfully (demo mode)',
          sessionDuration,
          completed: true
        },
        demo: true
      });
    }

    // Default response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Session updated (demo mode)'
      },
      demo: true
    });

  } catch (error) {
    console.error('Error in session-complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
