'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserPartnerships, createPartnershipsForUser } from '../lib/supabase-database'

interface Partnership {
  id: string
  partner: {
    id: string
    name: string
    email: string
    image?: string
    weeklyTarget: number
  }
  userSits: number
  partnerSits: number
  weeklyGoal: number
  score: number
  currentWeekStart: string
}

export default function Home() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  const fetchPartnerships = async (userId: string) => {
    try {
      console.log('Fetching partnerships for userId:', userId)
      
      // Try Firebase first, fallback to localStorage if Firebase not configured
      try {
        // Get existing partnerships from database
        const existingPartnerships = await getUserPartnerships(userId)
        console.log('Existing partnerships:', existingPartnerships)
        
        if (existingPartnerships.length > 0) {
          // Convert database partnerships to UI format
          const partnerships = existingPartnerships.map(partnership => ({
            id: partnership.id,
            partner: {
              id: partnership.partnerId,
              name: partnership.partnerName,
              email: partnership.partnerEmail,
              image: partnership.partnerImage || '/icons/meditation-1.svg',
              weeklyTarget: partnership.partnerWeeklyTarget
            },
            userSits: partnership.userSits,
            partnerSits: partnership.partnerSits,
            weeklyGoal: partnership.weeklyGoal,
            score: partnership.score,
            currentWeekStart: partnership.currentWeekStart.toISOString()
          }))
          
          console.log('Found existing partnerships:', partnerships)
          setPartnerships(partnerships)
        } else {
          // No existing partnerships, try to create new ones
          console.log('No existing partnerships, creating new ones...')
          const inviteCode = localStorage.getItem('pendingInviteCode')
          const newPartnerships = await createPartnershipsForUser(userId, inviteCode || undefined)
          
          if (newPartnerships.length > 0) {
            const partnerships = newPartnerships.map(partnership => ({
              id: partnership.id,
              partner: {
                id: partnership.partnerId,
                name: partnership.partnerName,
                email: partnership.partnerEmail,
                image: partnership.partnerImage || '/icons/meditation-1.svg',
                weeklyTarget: partnership.partnerWeeklyTarget
              },
              userSits: partnership.userSits,
              partnerSits: partnership.partnerSits,
              weeklyGoal: partnership.weeklyGoal,
              score: partnership.score,
              currentWeekStart: partnership.currentWeekStart.toISOString()
            }))
            
            console.log('Created new partnerships:', partnerships)
            setPartnerships(partnerships)
          } else {
            console.log('No other users found, showing empty partnerships')
            setPartnerships([])
          }
        }
      } catch (firebaseError) {
        console.log('Firebase not configured, falling back to localStorage')
        
        // Fallback to localStorage approach
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]')
        console.log('All users in localStorage:', allUsers)
        
        if (allUsers.length > 1) {
          const otherUsers = allUsers.filter((user: { id: string }) => user.id !== userId)
          console.log('Other users found:', otherUsers)
          
          if (otherUsers.length > 0) {
            const partnerships = otherUsers.map((user: { id: string; name: string; email: string; image?: string; weeklyTarget: number }) => ({
              id: `partnership-${userId}-${user.id}`,
              partner: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image || '/icons/meditation-1.svg',
                weeklyTarget: user.weeklyTarget || 5
              },
              userSits: 0,
              partnerSits: 0,
              weeklyGoal: user.weeklyTarget || 5,
              score: 0,
              currentWeekStart: new Date().toISOString()
            }))
            
            console.log('Creating partnerships with other users:', partnerships)
            setPartnerships(partnerships)
          } else {
            console.log('No other users found, showing empty partnerships')
            setPartnerships([])
          }
        } else {
          console.log('No partnerships available')
          setPartnerships([])
        }
      }
    } catch (error) {
      console.error('Error fetching partnerships:', error)
      // Set empty partnerships on error
      setPartnerships([])
    } finally {
      setLoading(false)
    }
  }

  const calculateWeekEndsIn = (weekStart: string) => {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return '0d 0h'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${days}d ${hours}h`
  }

  useEffect(() => {
    const checkForUser = () => {
      try {
        // Get user ID from localStorage (in production, use proper auth)
        const storedUserId = localStorage.getItem('userId')
        const userName = localStorage.getItem('userName')
        const userNickname = localStorage.getItem('userNickname')
        console.log('Homepage checking for userId:', storedUserId)
        console.log('Homepage checking for userName:', userName)
        console.log('Homepage checking for userNickname:', userNickname)
        console.log('All localStorage keys:', Object.keys(localStorage))
        
        // Check if we have complete onboarding data
        const hasCompleteUserData = storedUserId && (userName || userNickname)
        
        if (hasCompleteUserData) {
          console.log('User found, fetching partnerships')
          setUserId(storedUserId)
          setLoading(false)
          fetchPartnerships(storedUserId)
        } else {
          console.log('No complete user data found, redirecting to welcome')
          // Clear ALL user data to ensure clean state
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('userNickname')
          localStorage.removeItem('userWeeklyTarget')
          localStorage.removeItem('userUsualSitLength')
          localStorage.removeItem('firebaseUserId')
          localStorage.removeItem('allUsers')
          localStorage.removeItem('pendingInviteCode')
          localStorage.removeItem('partnershipInviteCode')
          // Set loading to false and redirect to welcome page for onboarding
          setLoading(false)
          router.push('/welcome')
          return // Exit early to prevent further execution
        }
      } catch (error) {
        console.error('Error in homepage useEffect:', error)
        // Fallback: redirect to welcome page
        setLoading(false)
        router.push('/welcome')
      }
    }

    // Check immediately - no delay
    checkForUser()
  }, [router])

  // Add a refresh mechanism to check for new partnerships
  useEffect(() => {
    if (userId) {
      const refreshPartnerships = () => {
        console.log('Refreshing partnerships...')
        fetchPartnerships(userId)
      }
      
      // Refresh partnerships every 2 seconds to catch new users
      const interval = setInterval(refreshPartnerships, 2000)
      
      return () => clearInterval(interval)
    }
  }, [userId])

  // If we have a userId, show the homepage
  if (userId) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
            <span className="font-bold text-lg">Serenity+</span>
          </div>
        </div>

        <div className="p-6 space-y-8">
                  {/* Main CTA - Sit Now Button */}
                  <div className="flex justify-center items-center">
                    <Link href="/timer">
                      <div className="w-32 h-32 cursor-pointer hover:opacity-90 transition-opacity">
                        <img 
                          src="/sit-now-button.jpg" 
                          alt="Sit Now" 
                          className="w-full h-full rounded-full"
                        />
                      </div>
                    </Link>
                  </div>


          {/* Partners Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold mb-4 text-black">Partners summary</h2>
            {loading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading partnerships...</p>
              </div>
            ) : partnerships.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">No partners yet</p>
                <Link 
                  href="/invite"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Invite Partners
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {partnerships.map((partnership) => (
                  <div key={partnership.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="font-medium">{partnership.partner.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>You {partnership.userSits}/{partnership.partner.weeklyTarget} * {partnership.partner.name} {partnership.partnerSits}/{partnership.partner.weeklyTarget}</div>
                      <div>Week Ends In {calculateWeekEndsIn(partnership.currentWeekStart)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show loading while checking for user data
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no userId, redirect to welcome
  return null
}