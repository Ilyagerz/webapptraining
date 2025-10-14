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
        data={data}
        labels={days}
        label="Тренировки"
        color="#d4ff00"
      />
    </div>
  );
}


