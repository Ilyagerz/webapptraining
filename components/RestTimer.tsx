'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Plus, Minus, RotateCcw } from 'lucide-react';
import { vibrate, playSound } from '@/lib/utils';

export function RestTimer() {
  const { restTimerActive, restTimerSeconds, setRestTimer } = useAppStore();
  const [timeLeft, setTimeLeft] = useState(restTimerSeconds);

  useEffect(() => {
    setTimeLeft(restTimerSeconds);
  }, [restTimerSeconds]);

  useEffect(() => {
    if (!restTimerActive || timeLeft <= 0) {
      if (timeLeft === 0) {
        vibrate('heavy');
        playSound();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          vibrate('heavy');
          playSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerActive, timeLeft]);

  if (!restTimerActive) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((restTimerSeconds - timeLeft) / restTimerSeconds) * 100;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 p-4">
      <div className="max-w-md mx-auto glass-effect rounded-2xl p-6 border-2 border-electric-lime shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Отдых</h3>
          <button
            onClick={() => setRestTimer(false, 0)}
            className="p-1.5 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-electric-lime">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted/20 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-electric-lime transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setTimeLeft(Math.max(0, timeLeft - 15))}
            className="p-3 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
          >
            <Minus size={20} />
          </button>

          <button
            onClick={() => setTimeLeft(restTimerSeconds)}
            className="p-3 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={() => setTimeLeft(timeLeft + 15)}
            className="p-3 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {timeLeft === 0 && (
          <div className="mt-4 text-center">
            <p className="text-electric-lime font-semibold animate-pulse">
              Отдых завершен! 💪
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
