'use client';

import { getSupersetColor, getSupersetPosition } from '@/lib/superset-utils';
import type { WorkoutExercise } from '@/types';

interface SupersetIndicatorProps {
  exercise: WorkoutExercise;
}

export function SupersetIndicator({ exercise }: SupersetIndicatorProps) {
  if (!exercise.superset) return null;

  const color = getSupersetColor(exercise.superset);
  const position = getSupersetPosition(exercise);

  return (
    <div className={`absolute -left-2 top-0 bottom-0 w-1 rounded-full ${color.split(' ')[1]}`}>
      <div className="absolute -left-3 top-2 w-6 h-6 rounded-full bg-background border-2 flex items-center justify-center text-xs font-bold">
        {position}
      </div>
    </div>
  );
}
