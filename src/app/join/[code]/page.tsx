'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function JoinPage() {
  const params = useParams()
  const [inviteData, setInviteData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In real app, this would fetch invite data from database
    // For now, we'll simulate it
    setTimeout(() => {
      setInviteData({
        inviterName: 'Sarah',
        inviterImage: '/placeholder-avatar.jpg',
        isValid: true
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleAccept = () => {
    // TODO: Create partnership in database
    console.log('Accepting partnership invitation')
    // Redirect to onboarding if user hasn't completed it, otherwise to home
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (!inviteData?.isValid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600">Invalid Invitation</h1>
          <p className="text-gray-600">
            This invitation link is invalid or has expired.
          </p>
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🧘</span>
          </div>
          <h1 className="text-2xl font-bold">You're Invited!</h1>
          <p className="text-gray-600">
            {inviteData.inviterName} wants to be your meditation accountability partner
          </p>
        </div>

        {/* Inviter Info */}
        <div className="bg-gray-50 rounded-lg p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
          <h2 className="text-xl font-semibold">{inviteData.inviterName}</h2>
          <p className="text-gray-600">
            Wants to meditate together and support each other's practice
          </p>
        </div>

        {/* What this means */}
        <div className="space-y-4">
          <h3 className="font-semibold">What this means:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              You'll set your own meditation goals and schedule
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              You'll track your progress together each week
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              You'll support each other when motivation is low
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              You'll celebrate each other's meditation sessions
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Accept Partnership
          </button>
          <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Decline
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}



