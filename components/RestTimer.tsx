'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Plus, Minus, RotateCcw, Pause, Play, Settings } from 'lucide-react';
import { vibrate, playSound } from '@/lib/utils';

export function RestTimer() {
  const { restTimerActive, restTimeRemaining, setRestTimer, user, updateSettings } = useAppStore();
  const [timeLeft, setTimeLeft] = useState(restTimeRemaining);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const defaultRestTime = user?.settings?.restTimerDefault || 90;
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Запрос Wake Lock при старте таймера
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && restTimerActive && !isPaused) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock активирован');
        }
      } catch (err) {
        console.error('Wake Lock не удалось активировать:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock освобожден');
        } catch (err) {
          console.error('Ошибка освобождения Wake Lock:', err);
        }
      }
    };

    if (restTimerActive && !isPaused) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [restTimerActive, isPaused]);

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
    <div className="fixed inset-x-0 top-0 z-50 p-4 safe-top">
      <div className="max-w-md mx-auto glass-effect rounded-2xl p-4 border-2 border-electric-lime shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          {/* Compact Timer Display */}
          <div className="flex items-center gap-3 flex-1">
            <div className="text-3xl font-bold text-black dark:text-white tabular-nums min-w-[100px]">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            
            {/* Compact Progress Bar */}
            <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-electric-lime transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeLeft(Math.max(0, timeLeft - 15))}
              className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
              title="-15 сек"
            >
              <Minus size={16} />
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
              title={isPaused ? "Продолжить" : "Пауза"}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>

            <button
              onClick={() => setTimeLeft(timeLeft + 15)}
              className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
              title="+15 сек"
            >
              <Plus size={16} />
            </button>

            <button
              onClick={() => setTimeLeft(restTimeRemaining)}
              className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
              title="Сброс"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setRestTimer(false, 0)}
              className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
              title="Закрыть"
            >
              <X size={16} />
            </button>
          </div>
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
