'use client';

import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

// Import the actual lotus animation JSON
import lotusAnimationData from '/public/lotus-animation.json';

interface SimpleLotusAnimationProps {
  isPlaying?: boolean;
  speed?: number;
}

export default function SimpleLotusAnimation({ 
  isPlaying = true, 
  speed = 1 
}: SimpleLotusAnimationProps) {
  const lottieRef = useRef<any>(null);

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

  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-64 h-64">
        <Lottie
          lottieRef={lottieRef}
          animationData={lotusAnimationData}
          loop={true}
          autoplay={isPlaying}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
