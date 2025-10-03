'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '../../lib/supabase-database' // Import createUser from Supabase

export default function MeditationLengthPage() {
  const [selectedLength, setSelectedLength] = useState<number>(30)
  const router = useRouter()

  useEffect(() => {
    console.log('MeditationLengthPage: User reached this page')
    console.log('MeditationLengthPage: pendingInviteCode:', localStorage.getItem('pendingInviteCode'))
    console.log('MeditationLengthPage: userInviteCode:', localStorage.getItem('userInviteCode'))
  }, [])

  const meditationLengths = [
    { minutes: 5, label: '5 minutes' },
    { minutes: 10, label: '10 minutes' },
    { minutes: 15, label: '15 minutes' },
    { minutes: 20, label: '20 minutes' },
    { minutes: 30, label: '30 minutes' },
    { minutes: 45, label: '45 minutes' },
    { minutes: 60, label: '60 minutes' }
  ]

  const handleSubmit = async () => {
    console.log('=== COMPLETE SETUP BUTTON CLICKED ===')
    console.log('Complete Setup button clicked!')
    
    // Store selection in localStorage
    localStorage.setItem('usualSitLength', selectedLength.toString())
    console.log('Stored meditation length:', selectedLength)
    
    // Get all stored data
    const nickname = localStorage.getItem('userNickname')
    const weeklyTarget = localStorage.getItem('userWeeklyTarget')
    const usualSitLength = localStorage.getItem('usualSitLength')
    const pendingInviteCode = localStorage.getItem('pendingInviteCode')
    
    console.log('Retrieved data:', { nickname, weeklyTarget, usualSitLength, pendingInviteCode })
    
    if (!nickname || !weeklyTarget || !usualSitLength) {
      console.error('Missing required data:', { nickname, weeklyTarget, usualSitLength })
      alert('Missing required data. Please start over.')
      return
    }

    try {
      // For static export, create a mock user ID and store in localStorage
      const userId = `user-${Date.now()}`
      console.log('Creating user with ID:', userId)
      
      // Store all user data in localStorage for demo purposes
      localStorage.setItem('userId', userId)
      localStorage.setItem('userEmail', `user-${Date.now()}@example.com`)
      localStorage.setItem('userName', nickname)
      localStorage.setItem('userWeeklyTarget', weeklyTarget)
      localStorage.setItem('userUsualSitLength', usualSitLength)
      localStorage.setItem('userPrimaryWindow', '06:00–09:00')
      localStorage.setItem('userTimezone', 'GMT+0')
      localStorage.setItem('userWhyPractice', 'Mindfulness and stress relief')
      localStorage.setItem('userSupportNeeds', 'Gentle reminders')
      
      // If there's a pending invite, store partnership info
      if (pendingInviteCode) {
        localStorage.setItem('partnershipInviteCode', pendingInviteCode)
        localStorage.setItem('partnershipStatus', 'pending')
        console.log('Partnership invite stored for demo')
        
        // Clear pending invite
        localStorage.removeItem('pendingInviteCode')
      }
      
      console.log('User account created successfully (demo mode)')
      console.log('All localStorage keys after creation:', Object.keys(localStorage))
      
      // Ensure localStorage is written synchronously
      localStorage.setItem('userId', userId)
      console.log('UserId confirmed in localStorage:', localStorage.getItem('userId'))
      
      // Create user in Supabase database
      let supabaseUserId = null
      try {
        // Get the user's invite code - use pendingInviteCode if available, otherwise create new one
        const pendingInviteCode = localStorage.getItem('pendingInviteCode')
        const userInviteCode = localStorage.getItem('userInviteCode')
        const finalInviteCode = pendingInviteCode || userInviteCode || `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        console.log('=== USER CREATION: Invite code debugging ===', {
          pendingInviteCode,
          userInviteCode: localStorage.getItem('userInviteCode'),
          finalInviteCode: finalInviteCode,
          allLocalStorage: Object.keys(localStorage)
        })
        
        const userData = {
          name: nickname,
          email: `user-${Date.now()}@example.com`,
          weeklytarget: parseInt(weeklyTarget),
          usualsitlength: selectedLength,
          image: '/icons/meditation-1.svg',
          invitecode: finalInviteCode
        }
        
        console.log('Creating user with data:', userData)
        console.log('About to call createUser with invite code:', userData.invitecode)
        supabaseUserId = await createUser(userData)
        console.log('User created in Supabase with ID:', supabaseUserId)
        console.log('User created with invite code:', userData.invitecode)
        
        // Store Supabase user ID in localStorage for session management
        localStorage.setItem('supabaseUserId', supabaseUserId)
        localStorage.setItem('userId', supabaseUserId) // Keep for compatibility
      } catch (supabaseError) {
        console.log('Supabase error, using localStorage fallback:', supabaseError)
        console.error('Supabase error details:', supabaseError)
        // Create a fallback user ID
        supabaseUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('userId', supabaseUserId)
      }
      
      // Always store in localStorage for compatibility
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]')
      const finalUserInviteCode = pendingInviteCode || localStorage.getItem('userInviteCode') || `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newUser = {
        id: supabaseUserId,
        name: nickname,
        email: `user-${Date.now()}@example.com`,
        weeklytarget: parseInt(weeklyTarget),
        image: '/icons/meditation-1.svg',
        invitecode: finalUserInviteCode
      }
      allUsers.push(newUser)
      localStorage.setItem('allUsers', JSON.stringify(allUsers))
      console.log('User added to localStorage:', newUser)
      
      // Redirect immediately - no setTimeout needed
      console.log('Redirecting to homepage...')
      router.push('/')
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('Failed to create your account. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>

      <div className="px-6 py-8 flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            How long do you want each meditation to be?
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            This will be the time you are accountable to meditating in each sitting
          </p>

          <div className="flex-1">
            <select
              value={selectedLength}
              onChange={(e) => setSelectedLength(parseInt(e.target.value))}
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg text-lg text-black focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px'
              }}
            >
              {meditationLengths.map(({ minutes, label }) => (
                <option key={minutes} value={minutes} className="text-black">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  )
}
