import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../firebase-config'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId, partnerId, inviteCode } = await request.json()
    
    if (!userId || !partnerId) {
      return NextResponse.json({ error: 'Missing userId or partnerId' }, { status: 400 })
    }

    // Check if partnership already exists
    const existingQuery = query(
      collection(db, 'partnerships'), 
      where('userId', '==', userId), 
      where('partnerId', '==', partnerId)
    )
    const existingSnapshot = await getDocs(existingQuery)
    
    if (!existingSnapshot.empty) {
      return NextResponse.json({ 
        success: true, 
        message: 'Partnership already exists',
        partnershipId: existingSnapshot.docs[0].id
      })
    }

    // Create partnership
    const partnershipData = {
      userId,
      partnerId,
      createdAt: new Date(),
      userSits: 0,
      partnerSits: 0,
      weeklyGoal: 5, // Default goal
      score: 0,
      currentWeekStart: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'partnerships'), partnershipData)
    
    return NextResponse.json({ 
      success: true, 
      partnershipId: docRef.id 
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
    const q = query(collection(db, 'partnerships'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    const partnerships = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ 
      success: true, 
      partnerships 
    })
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
  }
}
