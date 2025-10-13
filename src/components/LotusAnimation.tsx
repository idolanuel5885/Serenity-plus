'use client';

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';

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
  const [animationData, setAnimationData] = useState(null);

  // Fetch the lotus animation data
  useEffect(() => {
    fetch('/real_lotus.json')
      .then(response => response.json())
      .then(data => {
        console.log('Lotus animation data loaded:', data);
        console.log('Animation frames:', data.op, 'FPS:', data.fr);
        
        // Just unhide the layers without modifying scale/opacity
        if (data.layers) {
          data.layers.forEach((layer: any, index: number) => {
            if (layer.hd === true) {
              layer.hd = false;
              console.log('Unhiding layer:', layer.nm);
            }
          });
        }
        
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
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-64 h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading lotus animation...</div>
        </div>
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