import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()
    
    if (!userId || !userName) {
      return NextResponse.json({ error: 'Missing userId or userName' }, { status: 400 })
    }

    // Check if user already has an active invite
    const { data: existingInvite, error } = await supabase
      .from('invites')
      .select('inviteCode, id')
      .eq('userId', userId)
      .eq('isActive', true)
      .single()
    
    let inviteCode
    let inviteId
    
    if (existingInvite) {
      // User already has an active invite, reuse it
      inviteCode = existingInvite.inviteCode
      inviteId = existingInvite.id
      console.log('Reusing existing invite code:', inviteCode)
    } else {
      // Create a new unique invite code
      inviteCode = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      
      // Store the invite in Supabase
      const inviteData = {
        userId,
        userName,
        inviteCode,
        isActive: true
      }
      
      const { data, error } = await supabase
        .from('invites')
        .insert([inviteData])
        .select()
        .single()

      if (error) throw error
      inviteId = data.id
      console.log('Created new invite code:', inviteCode)
    }
    
    return NextResponse.json({ 
      success: true, 
      inviteCode,
      inviteId 
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inviteCode = searchParams.get('code')
    
    if (!inviteCode) {
      return NextResponse.json({ error: 'Missing invite code' }, { status: 400 })
    }

    // Find the invite in Supabase
    const { data: inviteData, error } = await supabase
      .from('invites')
      .select('userName, userId')
      .eq('inviteCode', inviteCode)
      .eq('isActive', true)
      .single()
    
    if (error || !inviteData) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      invitation: {
        inviter: {
          name: inviteData.userName,
          id: inviteData.userId
        }
      }
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json({ error: 'Failed to fetch invite' }, { status: 500 })
  }
}
