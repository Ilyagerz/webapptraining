'use client';

import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { vibrate } from '@/lib/utils';

interface EMOMTimerProps {
  rounds: number;
  intervalSeconds: number;
  onComplete: () => void;
  onClose: () => void;
}

export function EMOMTimer({ rounds, intervalSeconds, onComplete, onClose }: EMOMTimerProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(intervalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          vibrate('medium');
          
          if (currentRound >= rounds) {
            setIsRunning(false);
            return 0;
          }
          
          setCurrentRound((r) => r + 1);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentRound, rounds, intervalSeconds]);

  const handleReset = () => {
    setCurrentRound(1);
    setTimeLeft(intervalSeconds);
    setIsRunning(false);
  };

  const isComplete = currentRound > rounds && timeLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-background rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">EMOM</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Round Counter */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">Раунд</p>
          <div className="text-4xl font-bold text-electric-lime">
            {currentRound} / {rounds}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-electric-lime mb-4">
            {timeLeft}
          </div>
          <p className="text-muted-foreground">
            {isComplete ? 'Завершено!' : 'секунд до следующего раунда'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-muted/20 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-electric-lime transition-all duration-1000"
            style={{ width: `${((intervalSeconds - timeLeft) / intervalSeconds) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={handleReset}
            className="p-4 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={isComplete}
            className="p-6 rounded-full bg-electric-lime text-nubo-dark hover:bg-electric-lime/90 transition-colors disabled:opacity-50"
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} />}
          </button>
        </div>

        {/* Complete Button */}
        {isComplete && (
          <button
            onClick={onComplete}
            className="w-full px-6 py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold text-lg card-hover"
          >
            Завершить подход
          </button>
        )}
      </div>
    </div>
  );
}
