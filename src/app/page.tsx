'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NotificationDemo from '../components/NotificationDemo'

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

  useEffect(() => {
    // Add a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      try {
        // Get user ID from localStorage (in production, use proper auth)
        const storedUserId = localStorage.getItem('userId')
        console.log('Homepage checking for userId:', storedUserId)
        setUserId(storedUserId)
        
        if (storedUserId) {
          console.log('User found, fetching partnerships')
          fetchPartnerships(storedUserId)
        } else {
          console.log('No user found, redirecting to welcome')
          // No user found, redirect to welcome page for onboarding
          router.push('/welcome')
        }
      } catch (error) {
        console.error('Error in homepage useEffect:', error)
        // Fallback: redirect to welcome page
        router.push('/welcome')
      }
    }, 200) // Increased delay to ensure meditation-length page has finished

    return () => clearTimeout(timer)
  }, [router])

  // Show loading while checking for user
  if (loading && !userId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const fetchPartnerships = async (userId: string) => {
    try {
      // For static export, get partnerships from localStorage
      const partnershipsData = localStorage.getItem('partnerships')
      if (partnershipsData) {
        const partnerships = JSON.parse(partnershipsData)
        setPartnerships(partnerships)
      } else {
        // Check if there's a partnership invite code
        const inviteCode = localStorage.getItem('partnershipInviteCode')
        if (inviteCode) {
          // Create a mock partnership for demo
          const mockPartnership = {
            id: `partnership-${Date.now()}`,
            partner: {
              id: `partner-${Date.now()}`,
              name: 'Your Partner',
              email: 'partner@example.com',
              image: '/icons/meditation-1.svg',
              weeklyTarget: parseInt(localStorage.getItem('userWeeklyTarget') || '5')
            },
            userSits: 0,
            partnerSits: 0,
            weeklyGoal: parseInt(localStorage.getItem('userWeeklyTarget') || '5'),
            score: 0,
            currentWeekStart: new Date().toISOString()
          }
          setPartnerships([mockPartnership])
          localStorage.setItem('partnerships', JSON.stringify([mockPartnership]))
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">Home</button>
          <button className="px-3 py-1 text-sm">Partners</button>
          <Link href="/dev-tools" className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">Dev</Link>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Main CTA - Sit Now Button */}
        <div className="text-center space-y-4">
          <Link href="/timer">
            <div className="w-32 h-32 mx-auto cursor-pointer hover:opacity-90 transition-opacity">
              <img 
                src="/sit-now-button.jpg" 
                alt="Sit Now" 
                className="w-full h-full rounded-full"
              />
            </div>
          </Link>
        </div>

        {/* Notification Demo */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <NotificationDemo />
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