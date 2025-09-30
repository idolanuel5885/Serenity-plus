import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../firebase-config'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()
    
    if (!userId || !userName) {
      return NextResponse.json({ error: 'Missing userId or userName' }, { status: 400 })
    }

    // Create a unique invite code
    const inviteCode = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    
    // Store the invite in Firebase
    const inviteData = {
      userId,
      userName,
      inviteCode,
      createdAt: new Date(),
      isActive: true
    }
    
    const docRef = await addDoc(collection(db, 'invites'), inviteData)
    
    return NextResponse.json({ 
      success: true, 
      inviteCode,
      inviteId: docRef.id 
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

    // Find the invite in Firebase
    const q = query(collection(db, 'invites'), where('inviteCode', '==', inviteCode), where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }
    
    const inviteData = querySnapshot.docs[0].data()
    
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
