'use client';

import { BarChart } from './charts/BarChart';

interface WeeklyChartProps {
  data: number[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="h-32">
      <BarChart
        data={{
          labels: days,
          values: data,
        }}
        label="Тренировки"
        color="#C6FF00"
      />
    </div>
  );
}




