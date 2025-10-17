import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Данные будут получаться из localStorage на клиенте
    // Этот endpoint возвращает структуру для типизации
    
    // В будущем здесь будет интеграция с реальной БД
    // const workouts = await db.workouts.findMany({ where: { userId } });
    
    const stats = {
      totalWorkouts: 0,
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      streak: 0,
      lastWorkout: null,
      weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0],
      monthlyVolume: [],
      topExercises: [],
      progressData: [],
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
