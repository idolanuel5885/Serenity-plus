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

  // Fetch the lotus animation data and unhide all layers
  useEffect(() => {
    fetch('/lotus-animation.json')
      .then(response => response.json())
      .then(data => {
        console.log('Lotus animation data loaded:', data);
        console.log('Animation frames:', data.op, 'FPS:', data.fr);
        
        // Unhide all layers by setting hd: false
        if (data.layers) {
          data.layers.forEach((layer: any, index: number) => {
            console.log(`Layer ${index}:`, {
              name: layer.nm,
              type: layer.ty,
              hidden: layer.hd,
              opacity: layer.ks?.o?.k,
              scale: layer.ks?.s?.k,
              position: layer.ks?.p?.k,
              parent: layer.parent
            });
            
            if (layer.hd === true) {
              layer.hd = false;
              console.log('Unhiding layer:', layer.nm);
            }
            
            // Force opacity to 100 if it's 0
            if (layer.ks?.o?.k === 0) {
              layer.ks.o.k = 100;
              console.log('Setting opacity to 100 for layer:', layer.nm);
            }
            
            // Force scale to 100 if it's 0
            if (layer.ks?.s?.k && Array.isArray(layer.ks.s.k) && layer.ks.s.k[0] === 0) {
              layer.ks.s.k = [100, 100, 100];
              console.log('Setting scale to 100 for layer:', layer.nm);
            }
            
            // Special handling for parent null layers
            if (layer.ty === 3 && layer.nm === "Null 1") {
              console.log('Setting parent null layer to visible and proper scale');
              // Ensure the parent null layer is visible and properly scaled
              if (layer.ks?.s?.k) {
                layer.ks.s.k = [100, 100, 100];
              }
              if (layer.ks?.o?.k !== undefined) {
                layer.ks.o.k = 100;
              }
            }
          });
        }
        
        console.log('Modified animation data:', data);
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
          if (lottieRef.current) {
            lottieRef.current.play();
          }
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
        {animationData && (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={true}
            autoplay={isPlaying}
            style={{ width: '100%', height: '100%' }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid meet'
            }}
            onDataReady={() => {
              console.log('Lotus animation data ready');
              if (lottieRef.current) {
                console.log('Total frames:', lottieRef.current.totalFrames);
                console.log('Current frame:', lottieRef.current.currentFrame);
              }
            }}
          />
        )}
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
