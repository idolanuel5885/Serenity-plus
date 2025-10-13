'use client';

import { useState } from 'react';
import SimpleLotusAnimation from '@/components/SimpleLotusAnimation';
import CSSLotusAnimation from '@/components/CSSLotusAnimation';

export default function TestLotusPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(0.5); // Start with slower speed

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Simple Lotus Animation Test
        </h1>
        
        {/* Animation */}
        <div className="mb-8">
          <SimpleLotusAnimation isPlaying={isPlaying} speed={speed} />
        </div>
        
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => {
                // Manual frame control
                const frame = Math.floor(Math.random() * 417);
                console.log(`Manual frame: ${frame}`);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              Random Frame
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Speed: {speed}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>This is a simple lotus animation that just plays.</p>
            <p>No progress tracking, no partnerships, no complexity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
