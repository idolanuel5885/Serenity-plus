import { NextRequest, NextResponse } from 'next/server'

interface User {
  id: string
  name: string
  email: string
  weeklyTarget: number
  usualSitLength: number
  image: string
  inviteCode: string
  createdAt: string
}

// Simple in-memory storage for now (replace with real database later)
const users: User[] = []

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Create a simple user object
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    
    console.log('User created:', newUser)
    console.log('All users:', users)
    
    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      const user = users.find(u => u.id === userId)
      return NextResponse.json({ success: true, user })
    }
    
    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
