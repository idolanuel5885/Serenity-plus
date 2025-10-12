'use client';

import { useEffect, useRef, useState } from 'react';

interface LotusAnimationProps {
  progress: number; // 0-100, represents the current progress of the lotus opening
  isActive: boolean; // whether the meditation is currently active
  duration: number; // total duration of the current meditation in seconds
  elapsed: number; // elapsed time in the current meditation in seconds
}

export default function LotusAnimation({ 
  progress, 
  isActive, 
  duration, 
  elapsed 
}: LotusAnimationProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Calculate total progress including current session
  const calculateTotalProgress = () => {
    if (isActive && duration > 0) {
      // During active meditation, add current session progress
      const sessionProgress = (elapsed / duration) * 100; // 0-100% of current session
      const sessionContribution = 10; // Each session contributes 10% (assuming 10 sessions per week)
      const currentSessionProgress = (sessionProgress / 100) * sessionContribution;
      return Math.min(progress + currentSessionProgress, 100);
    }
    return progress;
  };

  // Smooth animation using requestAnimationFrame
  useEffect(() => {
    const animate = () => {
      const totalProgress = calculateTotalProgress();
      setCurrentProgress(totalProgress);
      
      // Continue animation if meditation is active
      if (isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isActive) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // When not active, just set the final position
      const totalProgress = calculateTotalProgress();
      setCurrentProgress(totalProgress);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, isActive, elapsed, duration]);

  // Calculate number of petals to show (0-8 petals)
  const numPetals = Math.floor((currentProgress / 100) * 8);
  
  // Calculate rotation for smooth petal animation
  const rotation = (currentProgress / 100) * 360;

  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-64 h-64 relative">
        {/* Lotus center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full border-4 border-yellow-300 shadow-lg">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full"></div>
        </div>

        {/* Petals */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              i < numPetals ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 45 + rotation}deg) translateY(-60px)`,
              transformOrigin: '50% 50%'
            }}
          >
            <div 
              className="w-8 h-16 bg-gradient-to-b from-pink-200 to-pink-400 rounded-full shadow-md"
              style={{
                transform: `rotate(${-i * 45 - rotation}deg)`,
                transformOrigin: '50% 100%'
              }}
            />
          </div>
        ))}

        {/* Progress indicator overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(calculateTotalProgress())}% open
        </div>
      </div>
    </div>
  );
}