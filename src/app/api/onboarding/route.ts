import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      name, 
      weeklyTarget, 
      primaryWindow, 
      timezone, 
      usualSitLength, 
      whyPractice, 
      supportNeeds 
    } = body

    // For now, we'll create a user without authentication
    // In production, this would be handled by NextAuth
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        weeklyTarget,
        primaryWindow,
        timezone,
        usualSitLength,
        whyPractice,
        supportNeeds,
      },
      create: {
        email,
        name,
        weeklyTarget,
        primaryWindow,
        timezone,
        usualSitLength,
        whyPractice,
        supportNeeds,
      },
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        weeklyTarget: user.weeklyTarget,
        primaryWindow: user.primaryWindow,
        timezone: user.timezone,
        usualSitLength: user.usualSitLength,
        whyPractice: user.whyPractice,
        supportNeeds: user.supportNeeds,
      }
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}



