import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Получить реальные данные из базы данных
    // Пока возвращаем моковые данные
    
    const stats = {
      totalWorkouts: 45,
      totalVolume: 285000,
      totalSets: 680,
      totalReps: 4250,
      streak: 7,
      lastWorkout: new Date(),
      weeklyWorkouts: [3, 2, 4, 3, 2, 1, 2],
      monthlyVolume: [
        { month: 'Янв', volume: 45000 },
        { month: 'Фев', volume: 52000 },
        { month: 'Мар', volume: 61000 },
        { month: 'Апр', volume: 58000 },
      ],
      topExercises: [
        { name: 'Жим штанги лежа', count: 12 },
        { name: 'Приседания', count: 11 },
        { name: 'Становая тяга', count: 10 },
        { name: 'Жим гантелей', count: 8 },
        { name: 'Подтягивания', count: 7 },
      ],
      progressData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        volume: Math.floor(Math.random() * 10000) + 5000,
      })),
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

