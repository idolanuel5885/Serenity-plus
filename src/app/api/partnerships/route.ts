import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for partnerships
let partnerships: any[] = []

export async function POST(request: NextRequest) {
  try {
    const partnershipData = await request.json()
    
    // Create a simple partnership object
    const newPartnership = {
      id: `partnership-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...partnershipData,
      createdAt: new Date().toISOString()
    }
    
    partnerships.push(newPartnership)
    
    console.log('Partnership created:', newPartnership)
    console.log('All partnerships:', partnerships)
    
    return NextResponse.json({ success: true, partnership: newPartnership })
  } catch (error) {
    console.error('Error creating partnership:', error)
    return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      const userPartnerships = partnerships.filter(p => p.userId === userId || p.partnerId === userId)
      return NextResponse.json({ success: true, partnerships: userPartnerships })
    }
    
    return NextResponse.json({ success: true, partnerships })
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
  }
}
