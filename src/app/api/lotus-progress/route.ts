import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateLotusProgress } from '@/lib/lotusProgress';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const partnershipId = searchParams.get('partnershipId');

    if (!userId || !partnershipId) {
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    // Get partnership data
    const partnership = await prisma.partnership.findFirst({
      where: {
        id: partnershipId,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        isActive: true
      }
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Calculate current progress
    const progressData = calculateLotusProgress(partnership, userId);

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Error fetching lotus progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, sessionElapsed } = body;

    if (!userId || !partnershipId) {
      return NextResponse.json({ error: 'Missing userId or partnershipId' }, { status: 400 });
    }

    // Get partnership data
    const partnership = await prisma.partnership.findFirst({
      where: {
        id: partnershipId,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        isActive: true
      }
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Calculate progress with current session data
    const progressData = calculateLotusProgress(
      partnership,
      userId,
      sessionDuration,
      sessionElapsed
    );

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Error updating lotus progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
