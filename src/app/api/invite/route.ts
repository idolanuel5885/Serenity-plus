import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inviterId } = body

    // Generate a unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.invitation.create({
      data: {
        inviterId,
        inviteCode,
        expiresAt,
      },
    })

    return NextResponse.json({ 
      success: true, 
      invitation: {
        id: invitation.id,
        inviteCode: invitation.inviteCode,
        expiresAt: invitation.expiresAt,
      }
    })
  } catch (error) {
    console.error('Invite creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inviteCode = searchParams.get('code')

    if (!inviteCode) {
      return NextResponse.json(
        { success: false, error: 'Invite code required' },
        { status: 400 }
      )
    }

    const invitation = await prisma.invitation.findUnique({
      where: { inviteCode },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
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

    return NextResponse.json({ 
      success: true, 
      invitation: {
        id: invitation.id,
        inviteCode: invitation.inviteCode,
        inviter: invitation.inviter,
        expiresAt: invitation.expiresAt,
      }
    })
  } catch (error) {
    console.error('Invite lookup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to lookup invitation' },
      { status: 500 }
    )
  }
}



