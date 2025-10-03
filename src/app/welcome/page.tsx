'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WelcomePage() {
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [inviteData, setInviteData] = useState<{
    inviterName: string
    inviterImage?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkForInvite = async () => {
      try {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search)
        const inviteCode = urlParams.get('invite')
        
        if (inviteCode) {
          // Store the invite code for later use
          localStorage.setItem('pendingInviteCode', inviteCode)
          console.log('Welcome page: Stored pendingInviteCode from URL:', inviteCode)
          setInviteData({
            inviterName: 'Your Partner',
            inviterImage: '/icons/meditation-1.svg'
          })
        } else {
          // Check localStorage for existing invite
          const pendingInviteCode = localStorage.getItem('pendingInviteCode')
          console.log('Welcome page: Found existing pendingInviteCode:', pendingInviteCode)
          if (pendingInviteCode) {
            setInviteData({
              inviterName: 'Your Partner',
              inviterImage: '/icons/meditation-1.svg'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching invite data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Small delay to ensure client-side hydration
    setTimeout(checkForInvite, 100)
  }, [])

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Serenity+" className="w-6 h-6" />
          <span className="font-bold text-lg">Serenity+</span>
        </div>
      </div>

      <div className="px-6 py-8 flex-1">
        {inviteData ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Let&apos;s set you up to start meditating with {inviteData.inviterName}
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              You&apos;ll be accountability partners, supporting each other&apos;s meditation practice.
            </p>
            
            <div className="mt-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                {inviteData.inviterImage ? (
                  <img 
                    src={inviteData.inviterImage} 
                    alt={`${inviteData.inviterName}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {inviteData.inviterName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <div>+</div>
                <div>You</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Meditate daily with a gentle nudge.
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              Pair with one buddy. Tiny steps, big change.
            </p>
          </>
        )}

        <div className="mt-8 space-y-4">
          <Link
            href="/nickname"
            className="block w-full bg-black text-white text-center py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {inviteData ? 'Set up your profile' : 'Get started'}
          </Link>
          
          <button
            onClick={() => setShowLearnMore(!showLearnMore)}
            className="block w-full text-gray-600 text-center py-2 text-sm hover:text-gray-800 transition-colors"
          >
            Learn more
          </button>
        </div>

        {showLearnMore && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              SerenityPlus pairs you with one accountability partner. A short check-in after each sit keeps both of you consistent.
            </p>
          </div>
        )}
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
