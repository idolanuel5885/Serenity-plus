'use client';

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { lotusAnimationData } from '@/lib/lotusAnimationData';

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
  const lottieRef = useRef<any>(null);
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
    if (!lottieRef.current) return;

    const animate = () => {
      if (lottieRef.current) {
        const totalProgress = calculateTotalProgress();
        setCurrentProgress(totalProgress);
        
        // Calculate target frame (0-417 frames total)
        const targetFrame = Math.floor((totalProgress / 100) * 417);
        lottieRef.current.goToAndStop(targetFrame, false);
      }
      
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
      const targetFrame = Math.floor((totalProgress / 100) * 417);
      lottieRef.current.goToAndStop(targetFrame, false);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, isActive, elapsed, duration]);

  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-64 h-64 relative">
        <Lottie
          lottieRef={lottieRef}
          animationData={lotusAnimationData}
          loop={false}
          autoplay={false}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Progress indicator overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(calculateTotalProgress())}% open
        </div>
      </div>
    </div>
  );
}