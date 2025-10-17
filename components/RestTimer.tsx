'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Plus, Minus, RotateCcw, Pause, Play, Settings } from 'lucide-react';
import { vibrate, playSound } from '@/lib/utils';

export function RestTimer() {
  const { restTimerActive, restTimeRemaining, setRestTimer } = useAppStore();
  const [timeLeft, setTimeLeft] = useState(restTimeRemaining);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setTimeLeft(restTimeRemaining);
  }, [restTimeRemaining]);

  useEffect(() => {
    if (!restTimerActive || timeLeft <= 0 || isPaused) {
      if (timeLeft === 0) {
        vibrate([200, 100, 200]);
        playSound();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          vibrate([200, 100, 200]);
          playSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerActive, timeLeft, isPaused]);

  if (!restTimerActive) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((restTimeRemaining - timeLeft) / restTimeRemaining) * 100;

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
          <div className="text-5xl font-bold text-black dark:text-white">
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
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => setTimeLeft(Math.max(0, timeLeft - 15))}
            className="p-3 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
            aria-label="Минус 15 секунд"
          >
            <Minus size={20} />
          </button>

          <button
            onClick={() => setTimeLeft(restTimeRemaining)}
            className="p-3 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
            aria-label="Сброс"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-4 rounded-xl bg-electric-lime text-nubo-dark hover:bg-electric-lime/90 transition-colors"
            aria-label={isPaused ? "Возобновить" : "Пауза"}
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
            aria-label="Настройки"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={() => setTimeLeft(timeLeft + 15)}
            className="p-3 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
            aria-label="Плюс 15 секунд"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 glass-effect rounded-xl space-y-3">
            <h4 className="text-sm font-semibold text-center mb-2">Настройка времени отдыха</h4>
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90, 120, 150, 180].map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => {
                    setTimeLeft(seconds);
                    setShowSettings(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-electric-lime hover:text-nubo-dark transition-colors text-sm font-medium"
                >
                  {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}

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
