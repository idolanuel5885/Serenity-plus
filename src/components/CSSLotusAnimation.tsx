'use client';

import { useEffect, useState } from 'react';

interface CSSLotusAnimationProps {
  isPlaying?: boolean;
  speed?: number;
}

export default function CSSLotusAnimation({ 
  isPlaying = true, 
  speed = 1 
}: CSSLotusAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate number of petals to show (0-8 petals)
  const numPetals = Math.min(Math.floor((currentFrame / 417) * 8), 8);

  useEffect(() => {
    if (isPlaying && !isAnimating) {
      setIsAnimating(true);
      let frame = 0;
      const interval = setInterval(() => {
        frame += speed;
        if (frame >= 417) {
          frame = 0; // Loop back to start
        }
        setCurrentFrame(frame);
      }, 1000 / 60); // 60 FPS

      return () => {
        clearInterval(interval);
        setIsAnimating(false);
      };
    }
  }, [isPlaying, speed, isAnimating]);

  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-64 h-64 relative">
        {/* Debug info */}
        <div className="absolute top-0 left-0 bg-black text-white text-xs p-1 z-10">
          Frame: {Math.floor(currentFrame)} | Petals: {numPetals}
        </div>
        
        {/* Lotus center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full border-4 border-yellow-300 shadow-lg z-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full"></div>
        </div>

        {/* Petals */}
        {Array.from({ length: 8 }, (_, i) => {
          const isVisible = i < numPetals;
          const angle = (i / 8) * 2 * Math.PI; // Angle for each petal
          const radius = 60; // Distance from center

          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <div
              key={i}
              className={`absolute top-1/2 left-1/2 transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle * (180 / Math.PI) + 90}deg)`,
                transformOrigin: '50% 50%',
                transitionDelay: `${i * 100}ms` // Stagger the appearance
              }}
            >
              <div 
                className="w-8 h-16 bg-gradient-to-b from-pink-200 to-pink-400 rounded-full shadow-md"
              />
            </div>
          );
        })}

        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round((currentFrame / 417) * 100)}% open
        </div>
      </div>
    </div>
  );
}
