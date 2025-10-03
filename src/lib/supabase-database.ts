import { supabase } from './supabase'

export interface User {
  id: string
  name: string
  email: string
  weeklyTarget: number
  usualSitLength: number
  image: string
  inviteCode: string
  createdAt: string
}

export interface Partnership {
  id: string
  userId: string
  partnerId: string
  partnerName: string
  partnerEmail: string
  partnerImage: string
  partnerWeeklyTarget: number
  userSits: number
  partnerSits: number
  weeklyGoal: number
  score: number
  currentWeekStart: string
  createdAt: string
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function createPartnership(partnershipData: Omit<Partnership, 'id' | 'createdAt'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .insert([partnershipData])
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error creating partnership:', error)
    throw error
  }
}

export async function getUserPartnerships(userId: string): Promise<Partnership[]> {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('userId', userId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return []
  }
}

export async function createPartnershipsForUser(userId: string, inviteCode?: string): Promise<Partnership[]> {
  try {
    // Find other users with matching invite codes
    const { data: otherUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', userId)
      .eq('inviteCode', inviteCode || '')

    if (usersError) throw usersError

    const partnerships: Partnership[] = []
    
    for (const otherUser of otherUsers || []) {
      const partnershipData = {
        userId,
        partnerId: otherUser.id,
        partnerName: otherUser.name,
        partnerEmail: otherUser.email,
        partnerImage: otherUser.image,
        partnerWeeklyTarget: otherUser.weeklyTarget,
        userSits: 0,
        partnerSits: 0,
        weeklyGoal: 5,
        score: 0,
        currentWeekStart: new Date().toISOString()
      }

      const partnershipId = await createPartnership(partnershipData)
      partnerships.push({
        id: partnershipId,
        ...partnershipData,
        createdAt: new Date().toISOString()
      })
    }

    return partnerships
  } catch (error) {
    console.error('Error creating partnerships:', error)
    return []
  }
}
