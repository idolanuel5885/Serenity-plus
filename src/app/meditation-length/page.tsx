'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MeditationLengthPage() {
  const [selectedLength, setSelectedLength] = useState<number>(30)
  const router = useRouter()

  const meditationLengths = [
    { minutes: 5, label: '5 minutes' },
    { minutes: 10, label: '10 minutes' },
    { minutes: 15, label: '15 minutes' },
    { minutes: 20, label: '20 minutes' },
    { minutes: 30, label: '30 minutes' },
    { minutes: 45, label: '45 minutes' },
    { minutes: 60, label: '60 minutes' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Store selection in localStorage
    localStorage.setItem('usualSitLength', selectedLength.toString())
    
    // Get all stored data
    const nickname = localStorage.getItem('userNickname')
    const weeklyTarget = localStorage.getItem('weeklyTarget')
    const usualSitLength = localStorage.getItem('usualSitLength')
    const pendingInviteCode = localStorage.getItem('pendingInviteCode')
    
    if (!nickname || !weeklyTarget || !usualSitLength) {
      alert('Missing required data. Please start over.')
      return
    }

    try {
      // Create user account
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `user-${Date.now()}@example.com`, // Temporary email
          name: nickname,
          weeklyTarget: parseInt(weeklyTarget),
          primaryWindow: '06:00–09:00',
          timezone: 'GMT+0',
          usualSitLength: parseInt(usualSitLength),
          whyPractice: 'Mindfulness and stress relief',
          supportNeeds: 'Gentle reminders'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Store user ID
        localStorage.setItem('userId', result.user.id)
        
        // If there's a pending invite, create partnership
        if (pendingInviteCode) {
          const partnershipResponse = await fetch('/api/partnership', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inviteCode: pendingInviteCode,
              inviteeId: result.user.id
            })
          })
          
          const partnershipResult = await partnershipResponse.json()
          if (partnershipResult.success) {
            console.log('Partnership created successfully')
          }
          
          // Clear pending invite
          localStorage.removeItem('pendingInviteCode')
        }
        
        // Redirect to homepage
        router.push('/')
      } else {
        alert('Failed to create your account. Please try again.')
      }
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

      <div className="px-6 py-8 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          How long do you want each meditation to be?
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          This will be the time you are accountable to meditating in each sitting
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <select
              value={selectedLength}
              onChange={(e) => setSelectedLength(parseInt(e.target.value))}
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px'
              }}
            >
              {meditationLengths.map(({ minutes, label }) => (
                <option key={minutes} value={minutes}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Complete Setup
          </button>
        </form>
      </div>

      <div className="px-6 py-4 border-t mt-auto">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>
    </div>
  )
}
