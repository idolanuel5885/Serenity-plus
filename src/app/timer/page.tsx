'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  usualSitLength: number
}

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

export default function TimerPage() {
  const [user, setUser] = useState<User | null>(null)
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [timeLeft, setTimeLeft] = useState(15 * 60) // Default 15 minutes, will be updated when user data loads
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch user data and partnerships on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          setLoading(false)
          return
        }

        // Fetch user data
        const userResponse = await fetch(`/api/user?userId=${userId}`)
        const userResult = await userResponse.json()
        
        if (userResult.success) {
          const userData = {
            id: userResult.user.id,
            name: userResult.user.name || 'You',
            usualSitLength: userResult.user.usualSitLength
          }
          
          setUser(userData)
          setTimeLeft(userData.usualSitLength * 60) // Convert minutes to seconds
        } else {
          // Fallback to default if user not found
          setUser({ id: userId, name: 'You', usualSitLength: 15 })
          setTimeLeft(15 * 60)
        }

        // Fetch partnerships data
        const partnershipsResponse = await fetch(`/api/partnership?userId=${userId}`)
        const partnershipsResult = await partnershipsResponse.json()
        
        if (partnershipsResult.success) {
          setPartnerships(partnershipsResult.partnerships)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to default
        setUser({ id: 'unknown', name: 'You', usualSitLength: 15 })
        setTimeLeft(15 * 60)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setIsRunning(true)
    setIsCompleted(false)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(user?.usualSitLength ? user.usualSitLength * 60 : 15 * 60)
    setIsCompleted(false)
  }

  // SVG Lotus Flower Component
  const LotusFlower = () => {
    // Get the first partnership for lotus flower data
    const partnership = partnerships[0]
    if (!partnership) {
      return (
        <div className="w-48 h-48 mx-auto flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🧘</div>
            <p className="text-sm">No partnerships yet</p>
          </div>
        </div>
      )
    }

    const totalSits = partnership.weeklyGoal // Total weekly goal for the partnership
    const completedSits = partnership.userSits + partnership.partnerSits // Already completed sits
    const currentSitProgress = isRunning ? (user?.usualSitLength ? user.usualSitLength * 60 - timeLeft : 0) : 0
    const currentSitPercentage = user?.usualSitLength ? currentSitProgress / (user.usualSitLength * 60) : 0

    // Create SVG paths for lotus petals
    const createLotusPetals = () => {
      const petals = []
      const centerX = 120
      const centerY = 120
      const petalLength = 60
      const petalWidth = 20

      for (let i = 0; i < totalSits; i++) {
        const angle = (i * 360) / totalSits
        const radians = (angle * Math.PI) / 180
        
        // Calculate petal points for a proper lotus petal shape
        const tipX = centerX + Math.cos(radians) * petalLength
        const tipY = centerY + Math.sin(radians) * petalLength
        
        // Create petal base points (wider at base)
        const baseAngle1 = radians - 0.3
        const baseAngle2 = radians + 0.3
        const baseRadius = 15
        
        const baseX1 = centerX + Math.cos(baseAngle1) * baseRadius
        const baseY1 = centerY + Math.sin(baseAngle1) * baseRadius
        const baseX2 = centerX + Math.cos(baseAngle2) * baseRadius
        const baseY2 = centerY + Math.sin(baseAngle2) * baseRadius
        
        // Create control points for curved petal shape
        const controlX1 = centerX + Math.cos(radians - 0.15) * (petalLength * 0.6)
        const controlY1 = centerY + Math.sin(radians - 0.15) * (petalLength * 0.6)
        const controlX2 = centerX + Math.cos(radians + 0.15) * (petalLength * 0.6)
        const controlY2 = centerY + Math.sin(radians + 0.15) * (petalLength * 0.6)
        
        // Create proper lotus petal path
        const petalPath = `M ${baseX1} ${baseY1} 
          Q ${controlX1} ${controlY1} ${tipX} ${tipY}
          Q ${controlX2} ${controlY2} ${baseX2} ${baseY2}
          Q ${centerX} ${centerY} ${baseX1} ${baseY1} Z`

        let fillColor = '#f3f4f6' // Default gray for uncompleted
        let strokeColor = '#d1d5db'
        
        if (i < completedSits) {
          // Completed sits - fully colored
          fillColor = '#10b981' // Green
          strokeColor = '#059669'
        } else if (i === completedSits && isRunning) {
          // Current sit - filling as timer progresses
          const fillOpacity = Math.min(currentSitPercentage, 1)
          fillColor = `rgba(16, 185, 129, ${fillOpacity})` // Green with opacity
          strokeColor = '#059669'
        }

        petals.push(
          <path
            key={i}
            d={petalPath}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
        )
      }
      
      return petals
    }

    return (
      <div className="w-48 h-48 mx-auto">
        <svg width="240" height="240" viewBox="0 0 240 240" className="w-full h-full">
          {/* Lotus petals */}
          {createLotusPetals()}
          
          {/* Center circle */}
          <circle
            cx="120"
            cy="120"
            r="20"
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          
          {/* Meditation emoji in center */}
          <text
            x="120"
            y="130"
            textAnchor="middle"
            fontSize="16"
            fill="#92400e"
          >
            🧘
          </text>
        </svg>
        
        {/* Progress text */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {completedSits}/{totalSits} sits completed this week
          </p>
          {partnerships.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              with {partnership.partner.name}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your meditation preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold">Sitting in Progress</h1>
        <div></div>
      </div>

      <div className="p-6 space-y-8">
        {/* Timer */}
        <div className="text-center space-y-6">
          <div className="text-6xl font-mono font-bold">
            {formatTime(timeLeft)}
          </div>
          
          {user && (
            <p className="text-sm text-gray-600">
              Your preferred session: {user.usualSitLength} minutes
            </p>
          )}
          
          <LotusFlower />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {!isCompleted ? (
            <div className="flex gap-4 justify-center">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">Session Complete! 🎉</div>
              <p className="text-gray-600">
                Great job! You've completed your meditation session.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetTimer}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Another
                </button>
                <Link
                  href="/"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}