import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const exerciseId = params.id;

    // TODO: Получить реальные данные из базы данных
    // Пока возвращаем моковые данные для демонстрации
    
    // Симулируем данные тренировок
    const mockWorkouts = Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i * 3);
      
      const setsCount = 3 + Math.floor(Math.random() * 2); // 3-4 подхода
      const sets = Array.from({ length: setsCount }, (_, j) => ({
        weight: 60 + Math.floor(Math.random() * 40) + i * 2, // Прогрессия веса
        reps: 6 + Math.floor(Math.random() * 6), // 6-11 повторений
        completed: true,
      }));

      return {
        id: `workout-${i}`,
        completedAt: date.toISOString(),
        exercises: [
          {
            exerciseId,
            sets,
          },
        ],
      };
    });

    return NextResponse.json(mockWorkouts, {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error fetching exercise data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise data' },
      { status: 500 }
    );
  }
}

