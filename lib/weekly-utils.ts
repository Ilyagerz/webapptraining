// Функция для недельной статистики (9 недель)
export function getWeeklyStats(workouts: any[], numberOfWeeks: number = 9): { week: string; workouts: number }[] {
  const result: { week: string; workouts: number }[] = [];
  const now = new Date();
  
  for (let i = numberOfWeeks - 1; i >= 0; i--) {
    // Начало недели (i недель назад от текущей)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7) - now.getDay() + 1); // Понедельник
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Воскресенье
    weekEnd.setHours(23, 59, 59, 999);
    
    // Подсчитываем тренировки за эту неделю
    const weekWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.completedAt || workout.startedAt);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    }).length;
    
    // Форматируем неделю как "1.9" (начало недели)
    const weekLabel = `${weekStart.getDate()}.${weekStart.getMonth() + 1}`;
    
    result.push({
      week: weekLabel,
      workouts: weekWorkouts,
    });
  }
  
  return result;
}

