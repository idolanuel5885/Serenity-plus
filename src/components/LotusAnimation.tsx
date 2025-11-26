'use client';

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { getCachedAnimationData, preloadLotusAnimation } from '../lib/lotus-animation-cache';

interface LotusAnimationProps {
  progress: number; // 0-100, represents the current progress of the lotus opening
  isActive: boolean; // whether the meditation is currently active
  duration: number; // total duration of the current meditation in seconds
  elapsed: number; // elapsed time in the current meditation in seconds
}

export default function LotusAnimation({ 
  progress, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isActive: _isActive, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  duration: _duration, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  elapsed: _elapsed 
}: LotusAnimationProps) {
  const lottieRef = useRef<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);

  // Load animation data - check cache first, then fetch if needed
  useEffect(() => {
    // Check if data is already cached (preloaded from homepage)
    const cached = getCachedAnimationData();
    if (cached) {
      console.log('Lotus animation: Using cached data');
      setAnimationData(cached);
      return;
    }

    // Not cached, fetch it (fallback for direct navigation to timer page)
    console.log('Lotus animation: Fetching data (not preloaded)');
    preloadLotusAnimation()
      .then(data => {
        setAnimationData(data);
      })
      .catch(error => console.error('Error loading lotus animation:', error));
  }, []);

  // Control animation based on progress
  useEffect(() => {
    if (lottieRef.current && animationData) {
      // Calculate target frame based on progress (0-100% maps to 0-417 frames)
      const targetFrame = Math.floor((progress / 100) * animationData.op);
      
      console.log('Setting lotus frame:', { progress, targetFrame, totalFrames: animationData.op });
      
      // Go to the target frame
      lottieRef.current.goToAndStop(targetFrame, true);
    }
  }, [progress, animationData]);

  if (!animationData) {
    // Return empty div with same dimensions to prevent layout shift
    // Animation will appear as soon as JSON loads (very fast)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-64 h-64"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-64 h-64 relative">
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={false}
          autoplay={false}
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid meet'
          }}
        />
      </div>
    </div>
  );
}