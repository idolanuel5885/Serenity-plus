import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnershipId, sessionDuration, completed } = body;

    if (!userId || !partnershipId || !sessionDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Only update database if session was completed
    if (completed) {
      // Determine which user completed the session
      const isUser1 = partnership.user1Id === userId;
      
      // Create session record
      await prisma.session.create({
        data: {
          userId,
          partnershipId,
          duration: Math.floor(sessionDuration / 60), // Convert seconds to minutes
          isCompleted: true,
          completedAt: new Date()
        }
      });

      // Update partnership sit counts
      const updateData = isUser1 
        ? { user1Sits: partnership.user1Sits + 1 }
        : { user2Sits: partnership.user2Sits + 1 };

      await prisma.partnership.update({
        where: { id: partnershipId },
        data: updateData
      });

      // Check if weekly goal is met
      const updatedPartnership = await prisma.partnership.findUnique({
        where: { id: partnershipId }
      });

      const totalSits = (updatedPartnership?.user1Sits || 0) + (updatedPartnership?.user2Sits || 0);
      const goalMet = totalSits >= partnership.weeklyGoal;

      return NextResponse.json({
        success: true,
        data: {
          user1Sits: updatedPartnership?.user1Sits || 0,
          user2Sits: updatedPartnership?.user2Sits || 0,
          totalSits,
          goalMet,
          progress: Math.min((totalSits / partnership.weeklyGoal) * 100, 100)
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
