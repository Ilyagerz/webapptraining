'use client';

import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface AMRAPTimerProps {
  targetTime: number; // в секундах
  onComplete: (reps: number, time: number) => void;
  onClose: () => void;
}

export function AMRAPTimer({ targetTime, onComplete, onClose }: AMRAPTimerProps) {
  const [timeLeft, setTimeLeft] = useState(targetTime);
  const [isRunning, setIsRunning] = useState(false);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleComplete = () => {
    const actualTime = targetTime - timeLeft;
    onComplete(reps, actualTime);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-background rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">AMRAP</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-electric-lime mb-4">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-muted-foreground">
            {timeLeft === 0 ? 'Время вышло!' : 'Осталось времени'}
          </p>
        </div>

        {/* Reps Counter */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <p className="text-center text-sm text-muted-foreground mb-2">Повторений</p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setReps(Math.max(0, reps - 1))}
              className="w-12 h-12 rounded-xl glass-effect hover:bg-muted/20 transition-colors flex items-center justify-center text-2xl"
            >
              -
            </button>
            <div className="text-5xl font-bold text-electric-lime min-w-[100px] text-center">
              {reps}
            </div>
            <button
              onClick={() => setReps(reps + 1)}
              className="w-12 h-12 rounded-xl glass-effect hover:bg-muted/20 transition-colors flex items-center justify-center text-2xl"
            >
              +
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={() => {
              setTimeLeft(targetTime);
              setIsRunning(false);
              setReps(0);
            }}
            className="p-4 rounded-xl glass-effect hover:bg-muted/20 transition-colors"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={timeLeft === 0}
            className="p-6 rounded-full bg-electric-lime text-nubo-dark hover:bg-electric-lime/90 transition-colors disabled:opacity-50"
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} />}
          </button>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={reps === 0}
          className="w-full px-6 py-4 bg-electric-lime text-nubo-dark rounded-xl font-bold text-lg card-hover disabled:opacity-50"
        >
          Завершить подход
        </button>
      </div>
    </div>
  );
}
