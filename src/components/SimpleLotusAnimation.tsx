'use client';

import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

// Simple lotus animation data - just the essential frames
const lotusAnimationData = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 150,
  "w": 400,
  "h": 400,
  "nm": "Lotus Animation",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Lotus",
      "sr": 1,
      "ks": {
        "o": {
          "a": 0,
          "k": 100,
          "ix": 11
        },
        "r": {
          "a": 0,
          "k": 0,
          "ix": 10
        },
        "p": {
          "a": 0,
          "k": [200, 200, 0],
          "ix": 2
        },
        "a": {
          "a": 0,
          "k": [0, 0, 0],
          "ix": 1
        },
        "s": {
          "a": 1,
          "k": [
            {
              "i": {
                "x": [0.833, 0.833, 0.833],
                "y": [0.833, 0.833, 0.833]
              },
              "o": {
                "x": [0.167, 0.167, 0.167],
                "y": [0.167, 0.167, 0.167]
              },
              "t": 0,
              "s": [0, 0, 100]
            },
            {
              "i": {
                "x": [0.833, 0.833, 0.833],
                "y": [0.833, 0.833, 0.833]
              },
              "o": {
                "x": [0.167, 0.167, 0.167],
                "y": [0.167, 0.167, 0.167]
              },
              "t": 75,
              "s": [100, 100, 100]
            },
            {
              "t": 150,
              "s": [100, 100, 100]
            }
          ],
          "ix": 6
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": {
                "a": 0,
                "k": [80, 80],
                "ix": 2
              },
              "p": {
                "a": 0,
                "k": [0, 0],
                "ix": 3
              },
              "nm": "Ellipse Path 1",
              "mn": "ADBE Vector Shape - Ellipse",
              "hd": false
            },
            {
              "ty": "st",
              "c": {
                "a": 0,
                "k": [0.8, 0.4, 0.6, 1],
                "ix": 3
              },
              "o": {
                "a": 0,
                "k": 100,
                "ix": 4
              },
              "w": {
                "a": 0,
                "k": 4,
                "ix": 5
              },
              "lc": 1,
              "lj": 1,
              "ml": 4,
              "bm": 0,
              "d": [
                {
                  "n": "d",
                  "nm": "dash",
                  "v": {
                    "a": 0,
                    "k": 0,
                    "ix": 1
                  }
                }
              ],
              "nm": "Stroke 1",
              "mn": "ADBE Vector Graphic - Stroke",
              "hd": false
            },
            {
              "ty": "tr",
              "p": {
                "a": 0,
                "k": [0, 0],
                "ix": 2
              },
              "a": {
                "a": 0,
                "k": [0, 0],
                "ix": 1
              },
              "s": {
                "a": 0,
                "k": [100, 100],
                "ix": 3
              },
              "r": {
                "a": 0,
                "k": 0,
                "ix": 6
              },
              "o": {
                "a": 0,
                "k": 100,
                "ix": 7
              },
              "sk": {
                "a": 0,
                "k": 0,
                "ix": 4
              },
              "sa": {
                "a": 0,
                "k": 0,
                "ix": 5
              },
              "nm": "Transform"
            }
          ],
          "nm": "Lotus Petal",
          "np": 2,
          "cix": 2,
          "bm": 0,
          "ix": 1,
          "mn": "ADBE Vector Group",
          "hd": false
        }
      ],
      "ip": 0,
      "op": 150,
      "st": 0,
      "bm": 0
    }
  ],
  "markers": []
};

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
