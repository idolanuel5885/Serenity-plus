'use client';

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';

interface SimpleLotusAnimationProps {
  isPlaying?: boolean;
  speed?: number;
}

export default function SimpleLotusAnimation({ 
  isPlaying = true, 
  speed = 1 
}: SimpleLotusAnimationProps) {
  const lottieRef = useRef<any>(null);
  const [animationData, setAnimationData] = useState(null);

  // Fetch the lotus animation data
  useEffect(() => {
    fetch('/lotus-animation.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading lotus animation:', error));
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

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
      <div className="w-64 h-64">
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={true}
          autoplay={isPlaying}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
