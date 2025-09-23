'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    weeklyTarget: 3,
    primaryWindow: '06:00–09:00',
    timezone: 'GMT+2',
    usualSitLength: 30,
    whyPractice: '',
    supportNeeds: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com', // TODO: Get from auth
          name: 'User', // TODO: Get from auth
          ...formData
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Store user ID in localStorage for now (in production, use proper auth)
        localStorage.setItem('userId', result.user.id)
        router.push('/')
      } else {
        console.error('Failed to save onboarding data:', result.error)
        alert('Failed to save your meditation plan. Please try again.')
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error)
      alert('Failed to save your meditation plan. Please try again.')
    }
  }

  const weeklyTargetOptions = [1, 2, 3, 4, 5, 6, 7]
  const timeWindowOptions = [
    '05:00–08:00',
    '06:00–09:00', 
    '07:00–10:00',
    '18:00–21:00',
    '19:00–22:00',
    '20:00–23:00'
  ]
  const timezoneOptions = [
    'GMT-12', 'GMT-11', 'GMT-10', 'GMT-9', 'GMT-8', 'GMT-7', 'GMT-6', 'GMT-5',
    'GMT-4', 'GMT-3', 'GMT-2', 'GMT-1', 'GMT+0', 'GMT+1', 'GMT+2', 'GMT+3',
    'GMT+4', 'GMT+5', 'GMT+6', 'GMT+7', 'GMT+8', 'GMT+9', 'GMT+10', 'GMT+11', 'GMT+12'
  ]
  const sitLengthOptions = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120]

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Your Plan</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weekly Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Target
            </label>
            <select
              value={formData.weeklyTarget}
              onChange={(e) => setFormData({...formData, weeklyTarget: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {weeklyTargetOptions.map(num => (
                <option key={num} value={num}>{num} times</option>
              ))}
            </select>
          </div>

          {/* Primary Practice Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Practice Window
            </label>
            <select
              value={formData.primaryWindow}
              onChange={(e) => setFormData({...formData, primaryWindow: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeWindowOptions.map(window => (
                <option key={window} value={window}>{window}</option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timezoneOptions.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Usual Sit Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usual Sit Length
            </label>
            <select
              value={formData.usualSitLength}
              onChange={(e) => setFormData({...formData, usualSitLength: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sitLengthOptions.map(length => (
                <option key={length} value={length}>{length} minutes</option>
              ))}
            </select>
          </div>

          {/* Why I practice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why I practice
            </label>
            <textarea
              value={formData.whyPractice}
              onChange={(e) => setFormData({...formData, whyPractice: e.target.value})}
              placeholder="Enter your reason"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
            />
          </div>

          {/* How to best support me */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How to best support me
            </label>
            <textarea
              value={formData.supportNeeds}
              onChange={(e) => setFormData({...formData, supportNeeds: e.target.value})}
              placeholder="Enter your support needs"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Find my matches
          </button>
        </form>
      </div>
    </div>
  )
}
