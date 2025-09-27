'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DevToolsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createTestUser = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Create a test user with onboarding data
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          weeklyTarget: 3,
          primaryWindow: '06:00–09:00',
          timezone: 'GMT+2',
          usualSitLength: 30,
          whyPractice: 'To find inner peace and reduce stress',
          supportNeeds: 'Gentle reminders and encouragement'
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        localStorage.setItem('userId', result.user.id)
        setMessage(`✅ Test user created! ID: ${result.user.id}`)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestPartnership = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setMessage('❌ Please create a test user first')
        setLoading(false)
        return
      }

      // Create a test partner
      const partnerResponse = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'partner@example.com',
          name: 'Priya',
          weeklyTarget: 4,
          primaryWindow: '07:00–10:00',
          timezone: 'GMT+2',
          usualSitLength: 25,
          whyPractice: 'To improve focus and mindfulness',
          supportNeeds: 'Accountability and motivation'
        }),
      })

      const partnerResult = await partnerResponse.json()
      
      if (partnerResult.success) {
        // Create invitation
        const inviteResponse = await fetch('/api/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inviterId: userId
          }),
        })

        const inviteResult = await inviteResponse.json()
        
        if (inviteResult.success) {
          // Accept the invitation to create partnership
          const partnershipResponse = await fetch('/api/partnership', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inviteCode: inviteResult.invitation.inviteCode,
              inviteeId: partnerResult.user.id
            }),
          })

          const partnershipResult = await partnershipResponse.json()
          
          if (partnershipResult.success) {
            setMessage(`✅ Test partnership created! You now have Priya as a partner.`)
          } else {
            setMessage(`❌ Partnership error: ${partnershipResult.error}`)
          }
        } else {
          setMessage(`❌ Invite error: ${inviteResult.error}`)
        }
      } else {
        setMessage(`❌ Partner creation error: ${partnerResult.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearTestData = () => {
    localStorage.removeItem('userId')
    setMessage('✅ Test data cleared! Refresh the page to see changes.')
  }

  const goToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Development Tools</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Test User Flow</h2>
            <p className="text-sm text-gray-600 mb-4">
              Create test data to see how the app looks with partnerships
            </p>
            
            <div className="space-y-3">
              <button
                onClick={createTestUser}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : '1. Create Test User'}
              </button>
              
              <button
                onClick={createTestPartnership}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : '2. Create Test Partnership'}
              </button>
              
              <button
                onClick={clearTestData}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Clear Test Data
              </button>
            </div>
          </div>

          {message && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={goToHome}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}





