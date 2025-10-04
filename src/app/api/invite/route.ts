import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, inviteCode: providedInviteCode } = await request.json()
    
    if (!userId || !userName) {
      return NextResponse.json({ error: 'Missing userId or userName' }, { status: 400 })
    }

    console.log('Creating invite for user:', { userId, userName })

    // Check if user already has an active invite
    const { data: existingInvite, error } = await supabase
      .from('invites')
      .select('invitecode, id')
      .eq('userid', userId)
      .eq('isactive', true)
      .single()
    
    console.log('Existing invite check result:', { existingInvite, error })
    
    let inviteCode
    let inviteId
    
    if (existingInvite) {
      // User already has an active invite, reuse it
      inviteCode = existingInvite.invitecode
      inviteId = existingInvite.id
      console.log('Reusing existing invite code:', inviteCode)
    } else {
      // Create a new unique invite code
      inviteCode = providedInviteCode || `invite-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      
      // Store the invite in Supabase
      const inviteData = {
        userid: userId,
        username: userName,
        invitecode: inviteCode,
        isactive: true
      }
      
      const { data, error } = await supabase
        .from('invites')
        .insert([inviteData])
        .select()
        .single()

      console.log('Insert invite result:', { data, error })
      if (error) {
        console.error('Error inserting invite:', error)
        throw error
      }
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
      .select('username, userid')
      .eq('invitecode', inviteCode)
      .eq('isactive', true)
      .single()
    
    if (error || !inviteData) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      invitation: {
        inviter: {
          name: inviteData.username,
          id: inviteData.userid
        }
      }
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json({ error: 'Failed to fetch invite' }, { status: 500 })
  }
}
