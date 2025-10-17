'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface WorkoutCalendarProps {
  workouts: any[];
  onClose: () => void;
}

export function WorkoutCalendar({ workouts, onClose }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all workout dates
  const workoutDates = new Set(
    workouts.map((w) =>
      new Date(w.completedAt || w.startedAt).toDateString()
    )
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  // Next month
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null); // Empty cells before first day
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft size={20} className="text-gray-700 dark:text-white" />
          </button>

          <h2 className="text-lg font-bold text-black dark:text-white">
            {currentMonth.toLocaleDateString('ru-RU', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight size={20} className="text-gray-700 dark:text-white" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600 dark:text-gray-300"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const date = new Date(year, month, day);
              const dateString = date.toDateString();
              const hasWorkout = workoutDates.has(dateString);
              const isToday =
                dateString === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                    ${
                      hasWorkout
                        ? 'bg-electric-lime text-nubo-dark'
                        : isToday
                        ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-electric-lime" />
              <span className="text-gray-600 dark:text-gray-300">
                Тренировка
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
              <span className="text-gray-600 dark:text-gray-300">
                Сегодня
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-electric-lime text-nubo-dark rounded-xl font-semibold"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

