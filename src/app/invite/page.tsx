'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState('ABC123') // In real app, this would be generated
  const [copied, setCopied] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const inviteUrl = `${window.location.origin}/join/${inviteCode}`
        const qrCodeDataUrl = await QRCode.toDataURL(inviteUrl, {
          width: 192,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataUrl(qrCodeDataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQRCode()
  }, [inviteCode])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Link href="/" className="mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Invite Partners</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Invite Link Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Invite Your Meditation Partners</h2>
          <p className="text-gray-600">
            Share this link with up to 3 people you'd like to meditate with regularly.
          </p>
        </div>

        {/* Invite Code */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Your Invite Link</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}`}
              readOnly
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-500">
            This link will expire in 7 days. You can generate a new one anytime.
          </p>
        </div>

        {/* QR Code */}
        <div className="text-center space-y-4">
          <h3 className="font-semibold">Or share via QR Code</h3>
          <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
            {qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="w-44 h-44"
              />
            ) : (
              <span className="text-gray-500">Generating QR Code...</span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Scan this code with your phone's camera
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-blue-900">How it works:</h3>
          <ol className="text-sm text-blue-800 space-y-2">
            <li>1. Share the link or QR code with your meditation partners</li>
            <li>2. They'll create an account and complete their own meditation plan</li>
            <li>3. Once they accept, you'll be connected as accountability partners</li>
            <li>4. Start meditating together and supporting each other!</li>
          </ol>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}



