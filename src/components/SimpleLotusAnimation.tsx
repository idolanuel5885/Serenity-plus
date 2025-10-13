'use client';

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { AnimationItem } from 'lottie-web';

interface SimpleLotusAnimationProps {
  isPlaying?: boolean;
  speed?: number;
}

export default function SimpleLotusAnimation({ 
  isPlaying = true, 
  speed = 1 
}: SimpleLotusAnimationProps) {
  const lottieRef = useRef<AnimationItem | null>(null);
  const [animationData, setAnimationData] = useState(null);

  // Fetch the lotus animation data and create animation directly
  useEffect(() => {
    fetch('/lotus-animation.json')
      .then(response => response.json())
      .then(data => {
        console.log('Lotus animation data loaded:', data);
        console.log('Animation frames:', data.op, 'FPS:', data.fr);
        setAnimationData(data);
        
        // Create animation directly with lottie-web
        if (lottieRef.current) {
          lottieRef.current.destroy();
        }
        
        const container = document.getElementById('lotus-container');
        if (container && data) {
          import('lottie-web').then((lottie) => {
            const animation = lottie.default.loadAnimation({
              container: container,
              renderer: 'svg',
              loop: true,
              autoplay: isPlaying,
              animationData: data,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid meet'
              }
            });
            
            lottieRef.current = animation;
            
            // Force all layers to be visible
            if (animation.renderer && animation.renderer.layers) {
              animation.renderer.layers.forEach((layer: any) => {
                if (layer) {
                  layer.setVisible(true);
                }
              });
            }
          });
        }
      })
      .catch(error => console.error('Error loading lotus animation:', error));
  }, [isPlaying]);

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
        <div 
          id="lotus-container" 
          style={{ width: '100%', height: '100%' }}
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
