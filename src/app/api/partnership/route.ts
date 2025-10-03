import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, partnerId } = await request.json()
    
    if (!userId || !partnerId) {
      return NextResponse.json({ error: 'Missing userId or partnerId' }, { status: 400 })
    }

    // Check if partnership already exists
    const { data: existingPartnership, error: checkError } = await supabase
      .from('partnerships')
      .select('id')
      .eq('userId', userId)
      .eq('partnerId', partnerId)
      .single()
    
    if (existingPartnership) {
      return NextResponse.json({ 
        success: true, 
        message: 'Partnership already exists',
        partnershipId: existingPartnership.id
      })
    }

    // Create partnership
    const partnershipData = {
      userId,
      partnerId,
      partnerName: 'Partner', // Will be updated when we have partner info
      partnerEmail: 'partner@example.com',
      partnerImage: '/icons/meditation-1.svg',
      partnerWeeklyTarget: 5,
      userSits: 0,
      partnerSits: 0,
      weeklyGoal: 5, // Default goal
      score: 0,
      currentWeekStart: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('partnerships')
      .insert([partnershipData])
      .select()
      .single()

    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      partnershipId: data.id 
    })
  } catch (error) {
    console.error('Error creating partnership:', error)
    return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get all partnerships for this user
    const { data: partnerships, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('userId', userId)

    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      partnerships: partnerships || []
    })
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
  }
}
