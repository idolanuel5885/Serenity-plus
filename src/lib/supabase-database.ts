import { supabase } from './supabase'

export interface User {
  id: string
  name: string
  email: string
  weeklytarget: number
  usualsitlength: number
  image: string
  invitecode: string
  createdat: string
}

export interface Partnership {
  id: string
  userid: string
  partnerid: string
  partnername: string
  partneremail: string
  partnerimage: string
  partnerweeklytarget: number
  usersits: number
  partnersits: number
  weeklygoal: number
  score: number
  currentweekstart: string
  createdat: string
}

export async function createUser(userData: Omit<User, 'id' | 'createdat'>): Promise<string> {
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

export async function createPartnership(partnershipData: Omit<Partnership, 'id' | 'createdat'>): Promise<string> {
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
      .eq('userid', userId)

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
      .eq('invitecode', inviteCode || '')

    if (usersError) throw usersError

    const partnerships: Partnership[] = []
    
    for (const otherUser of otherUsers || []) {
      const partnershipData = {
        userid: userId,
        partnerid: otherUser.id,
        partnername: otherUser.name,
        partneremail: otherUser.email,
        partnerimage: otherUser.image,
        partnerweeklytarget: otherUser.weeklytarget,
        usersits: 0,
        partnersits: 0,
        weeklygoal: 5,
        score: 0,
        currentweekstart: new Date().toISOString()
      }

      const partnershipId = await createPartnership(partnershipData)
      partnerships.push({
        id: partnershipId,
        ...partnershipData,
        createdat: new Date().toISOString()
      })
    }

    return partnerships
  } catch (error) {
    console.error('Error creating partnerships:', error)
    return []
  }
}
