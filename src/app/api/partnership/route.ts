import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAndTransitionWeek } from '@/lib/weekUtils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inviteCode, inviteeId } = body

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { inviteCode },
      include: { inviter: true }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation code' },
        { status: 404 }
      )
    }

    if (invitation.isUsed) {
      return NextResponse.json(
        { success: false, error: 'Invitation already used' },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Invitation expired' },
        { status: 400 }
      )
    }

    // Get the invitee user
    const invitee = await prisma.user.findUnique({
      where: { id: inviteeId }
    })

    if (!invitee) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate combined weekly goal
    const weeklyGoal = invitation.inviter.weeklyTarget + invitee.weeklyTarget

    // Create the partnership with proper week tracking
    const partnership = await prisma.partnership.create({
      data: {
        user1Id: invitation.inviterId,
        user2Id: inviteeId,
        weeklyGoal,
        currentWeekStart: new Date(), // Start of current week
        currentWeekNumber: 1, // First week
        currentStreak: 0,
        longestStreak: 0,
        totalWeeks: 0
      }
    })

    // Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
        inviteeId,
      }
    })

    return NextResponse.json({ 
      success: true, 
      partnership: {
        id: partnership.id,
        user1Id: partnership.user1Id,
        user2Id: partnership.user2Id,
        weeklyGoal: partnership.weeklyGoal,
        currentWeekNumber: partnership.currentWeekNumber,
      }
    })
  } catch (error) {
    console.error('Partnership creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create partnership' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Find all partnerships for this user
    const partnerships = await prisma.partnership.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        isActive: true
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            weeklyTarget: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            weeklyTarget: true,
          }
        }
      }
    })

    // Check and transition weeks for each partnership
    for (const partnership of partnerships) {
    await checkAndTransitionWeek(partnership.id)
    }

    // Refetch partnerships after potential transitions
    const updatedPartnerships = await prisma.partnership.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        isActive: true
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            weeklyTarget: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            weeklyTarget: true,
          }
        }
      }
    })

    // Format partnerships to show partner info with week data
    const formattedPartnerships = updatedPartnerships.map(partnership => {
      const partner = partnership.user1Id === userId ? partnership.user2 : partnership.user1
      const userSits = partnership.user1Id === userId ? partnership.user1Sits : partnership.user2Sits
      const partnerSits = partnership.user1Id === userId ? partnership.user2Sits : partnership.user1Sits
      
      return {
        id: partnership.id,
        partner: {
          id: partner.id,
          name: partner.name,
          email: partner.email,
          image: partner.image,
          weeklyTarget: partner.weeklyTarget,
        },
        userSits,
        partnerSits,
        weeklyGoal: partnership.weeklyGoal,
        score: partnership.score,
        currentWeekStart: partnership.currentWeekStart,
        currentWeekNumber: partnership.currentWeekNumber,
        currentStreak: partnership.currentStreak,
        longestStreak: partnership.longestStreak,
        totalWeeks: partnership.totalWeeks,
      }
    })

    return NextResponse.json({ 
      success: true, 
      partnerships: formattedPartnerships
    })
  } catch (error) {
    console.error('Partnership fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partnerships' },
      { status: 500 }
    )
  }
}