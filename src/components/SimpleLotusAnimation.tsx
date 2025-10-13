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
      .then(data => {
        console.log('Lotus animation data loaded:', data);
        console.log('Animation frames:', data.op, 'FPS:', data.fr);
        setAnimationData(data);
      })
      .catch(error => console.error('Error loading lotus animation:', error));
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      if (isPlaying) {
        // Reset to frame 0 and play the full animation
        lottieRef.current.goToAndStop(0, true);
        setTimeout(() => {
          lottieRef.current.play();
        }, 100);
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Remove the manual frame control debugging

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
      <div className="w-64 h-64 relative">
        <style jsx>{`
          .lotus-animation {
            width: 100% !important;
            height: 100% !important;
          }
          .lotus-animation svg {
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={true}
          autoplay={isPlaying}
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid meet',
            className: 'lotus-animation',
            hideOnTransparent: false,
            clearCanvas: false,
            renderer: 'canvas'
          }}
          onComplete={() => {
            console.log('Lotus animation completed');
          }}
          onLoopComplete={() => {
            console.log('Lotus animation loop completed');
          }}
          onDataReady={() => {
            console.log('Lotus animation data ready');
            if (lottieRef.current) {
              console.log('Total frames:', lottieRef.current.totalFrames);
              console.log('Current frame:', lottieRef.current.currentFrame);
              
              // Force all layers to be visible
              const animation = lottieRef.current;
              if (animation && animation.renderer && animation.renderer.layers) {
                animation.renderer.layers.forEach((layer: any) => {
                  if (layer) {
                    layer.setVisible(true);
                  }
                });
              }
            }
          }}
        />
        {/* Debug info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Animation loaded: {animationData ? 'Yes' : 'No'}</p>
          <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
          <p>Speed: {speed}x</p>
        </div>
      </div>
    </div>
  );
}
