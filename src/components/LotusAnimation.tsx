'use client';

import { useEffect, useState, useCallback } from 'react';

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

  // Calculate total progress including current session
  const calculateTotalProgress = useCallback(() => {
    if (isActive && duration > 0) {
      // During active meditation, add current session progress
      const sessionProgress = (elapsed / duration) * 100; // 0-100% of current session
      const sessionContribution = 10; // Each session contributes 10% (assuming 10 sessions per week)
      const currentSessionProgress = (sessionProgress / 100) * sessionContribution;
      const total = Math.min(progress + currentSessionProgress, 100);
      console.log('Calculating total progress:', { 
        progress, 
        sessionProgress, 
        currentSessionProgress, 
        total,
        elapsed,
        duration 
      });
      return total;
    }
    console.log('Not active, returning base progress:', progress);
    return progress;
  }, [progress, isActive, elapsed, duration]);

  // Update progress when props change
  useEffect(() => {
    const totalProgress = calculateTotalProgress();
    setCurrentProgress(totalProgress);
  }, [calculateTotalProgress]);

  // Calculate number of petals to show (0-8 petals)
  const numPetals = Math.floor((currentProgress / 100) * 8);

  console.log('Rendering lotus:', { currentProgress, numPetals, progress, isActive });

  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-64 h-64 relative border-2 border-red-500">
        {/* Debug info */}
        <div className="absolute top-0 left-0 bg-black text-white text-xs p-1 z-10">
          Debug: {Math.round(currentProgress)}% | Petals: {numPetals} | Active: {isActive ? 'Y' : 'N'}
        </div>
        
        {/* Lotus center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full border-4 border-yellow-300 shadow-lg z-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full"></div>
        </div>

        {/* Simple petal arrangement - 8 petals in a circle */}
        {Array.from({ length: 8 }, (_, i) => {
          const isVisible = i < numPetals;
          const angle = (i * 45); // 45 degrees between each petal
          const radius = 60; // Distance from center
          
          // Calculate position
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          
          return (
            <div
              key={i}
              className={`absolute top-1/2 left-1/2 transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle}deg)`,
                transformOrigin: '50% 50%'
              }}
            >
              <div 
                className="w-6 h-12 bg-gradient-to-b from-pink-200 to-pink-400 rounded-full shadow-md"
                style={{
                  transform: `rotate(${-angle}deg)`,
                  transformOrigin: '50% 100%'
                }}
              />
            </div>
          );
        })}

        {/* Progress indicator overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(calculateTotalProgress())}% open
        </div>
      </div>
    </div>
  );
}