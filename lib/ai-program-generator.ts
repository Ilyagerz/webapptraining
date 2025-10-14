// AI генератор программ тренировок
import type {
  AIProgramRequest,
  AIProgram,
  WorkoutTemplate,
  TemplateExercise,
  Exercise,
  Equipment,
} from '@/types';
import { getDefaultExercises } from './exercises-data';

// Генерация программы на основе параметров
export function generateAIProgram(request: AIProgramRequest): AIProgram {
  const { goal, experience, daysPerWeek, duration, equipment: availableEquipment } = request;

  // Получаем все упражнения
  const allExercises = getDefaultExercises();
  
  // Фильтруем упражнения по доступному оборудованию
  const filteredExercises = allExercises.filter((ex) =>
    ex.equipment.some((eq) => availableEquipment.includes(eq))
  );

  // Создаем шаблоны на основе цели и частоты
  const templates = createTemplates(
    goal,
    experience,
    daysPerWeek,
    filteredExercises
  );

  // Генерируем название и описание программы
  const programName = generateProgramName(goal, daysPerWeek, duration);
  const programDescription = generateProgramDescription(goal, experience, daysPerWeek);

  return {
    id: `ai-program-${Date.now()}`,
    name: programName,
    description: programDescription,
    duration,
    templates,
    schedule: generateSchedule(daysPerWeek),
  };
}

// Создание шаблонов тренировок
function createTemplates(
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  daysPerWeek: number,
  exercises: Exercise[]
): WorkoutTemplate[] {
  const templates: Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isSystemTemplate'>[] = [];

  if (daysPerWeek === 2 || daysPerWeek === 3) {
    // Full Body
    templates.push(
      createFullBodyTemplate(exercises, goal, experience, 'A'),
      createFullBodyTemplate(exercises, goal, experience, 'B')
    );
    if (daysPerWeek === 3) {
      templates.push(createFullBodyTemplate(exercises, goal, experience, 'C'));
    }
  } else if (daysPerWeek === 4) {
    // Upper/Lower
    templates.push(
      createUpperTemplate(exercises, goal, experience, 'A'),
      createLowerTemplate(exercises, goal, experience, 'A'),
      createUpperTemplate(exercises, goal, experience, 'B'),
      createLowerTemplate(exercises, goal, experience, 'B')
    );
  } else if (daysPerWeek === 5 || daysPerWeek === 6) {
    // Push/Pull/Legs
    templates.push(
      createPushTemplate(exercises, goal, experience, 'A'),
      createPullTemplate(exercises, goal, experience, 'A'),
      createLegsTemplate(exercises, goal, experience, 'A')
    );
    if (daysPerWeek === 6) {
      templates.push(
        createPushTemplate(exercises, goal, experience, 'B'),
        createPullTemplate(exercises, goal, experience, 'B'),
        createLegsTemplate(exercises, goal, experience, 'B')
      );
    }
  }

  return templates.map((template, index) => ({
    ...template,
    id: `template-${Date.now()}-${index}`,
    userId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    isSystemTemplate: true,
  }));
}

// Создание Full Body шаблона
function createFullBodyTemplate(
  exercises: Exercise[],
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  variant: 'A' | 'B' | 'C'
): Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isSystemTemplate'> {
  const { sets, reps } = getSetsReps(goal, experience);

  const exerciseSelection = [
    exercises.find((e) => e.muscleGroup === 'legs' && e.equipment.includes('barbell')), // Приседания
    exercises.find((e) => e.muscleGroup === 'chest' && e.equipment.includes('barbell')), // Жим
    exercises.find((e) => e.muscleGroup === 'back' && e.equipment.includes('barbell')), // Тяга
    exercises.find((e) => e.muscleGroup === 'shoulders'), // Плечи
    exercises.find((e) => e.muscleGroup === 'abs'), // Пресс
  ].filter((e): e is Exercise => e !== undefined);

  return {
    name: `Full Body ${variant}`,
    description: 'Тренировка всего тела',
    exercises: exerciseSelection.map((ex) => ({
      exerciseId: ex.id,
      exercise: ex,
      sets,
      targetReps: reps,
      restTimer: getRestTimer(goal),
    })),
  };
}

// Создание Upper шаблона
function createUpperTemplate(
  exercises: Exercise[],
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  variant: 'A' | 'B'
): Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isSystemTemplate'> {
  const { sets, reps } = getSetsReps(goal, experience);

  const exerciseSelection = [
    exercises.find((e) => e.muscleGroup === 'chest'), // Грудь
    exercises.find((e) => e.muscleGroup === 'back'), // Спина
    exercises.find((e) => e.muscleGroup === 'shoulders'), // Плечи
    exercises.find((e) => e.muscleGroup === 'arms'), // Руки
  ].filter((e): e is Exercise => e !== undefined);

  return {
    name: `Upper Body ${variant}`,
    description: 'Верх тела',
    exercises: exerciseSelection.map((ex) => ({
      exerciseId: ex.id,
      exercise: ex,
      sets,
      targetReps: reps,
      restTimer: getRestTimer(goal),
    })),
  };
}

// Создание Lower шаблона
function createLowerTemplate(
  exercises: Exercise[],
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  variant: 'A' | 'B'
): Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isSystemTemplate'> {
  const { sets, reps } = getSetsReps(goal, experience);

  const exerciseSelection = [
    exercises.find((e) => e.muscleGroup === 'legs' && e.equipment.includes('barbell')), // Приседания
    exercises.find((e) => e.muscleGroup === 'legs' && !e.name.includes('Приседания')), // Другое на ноги
    exercises.find((e) => e.muscleGroup === 'glutes'), // Ягодицы
    exercises.find((e) => e.muscleGroup === 'abs'), // Пресс
  ].filter((e): e is Exercise => e !== undefined);

  return {
    name: `Lower Body ${variant}`,
    description: 'Низ тела',
    exercises: exerciseSelection.map((ex) => ({
      exerciseId: ex.id,
      exercise: ex,
      sets,
      targetReps: reps,
      restTimer: getRestTimer(goal),
    })),
  };
}

// Создание Push шаблона
function createPushTemplate(
  exercises: Exercise[],
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  variant: 'A' | 'B'
): Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isSystemTemplate'> {
  const { sets, reps } = getSetsReps(goal, experience);

  const exerciseSelection = [
    exercises.find((e) => e.muscleGroup === 'chest'), // Грудь
    exercises.find((e) => e.muscleGroup === 'shoulders'), // Плечи
    exercises.find((e) => e.muscleGroup === 'arms' && e.name.includes('трицепс')), // Трицепс
  ].filter((e): e is Exercise => e !== undefined);

  return {
    name: `Push ${variant}`,
    description: 'Толкающие мышцы',
    exercises: exerciseSelection.map((ex) => ({
      exerciseId: ex.id,
      exercise: ex,
      sets,
      targetReps: reps,
      restTimer: getRestTimer(goal),
    })),
  };
}

// Создание Pull шаблона
function createPullTemplate(
  exercises: Exercise[],
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  variant: 'A' | 'B'
): Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isSystemTemplate'> {
  const { sets, reps } = getSetsReps(goal, experience);

  const exerciseSelection = [
    exercises.find((e) => e.muscleGroup === 'back'), // Спина
    exercises.find((e) => e.muscleGroup === 'arms' && e.name.includes('бицепс')), // Бицепс
  ].filter((e): e is Exercise => e !== undefined);

  return {
    name: `Pull ${variant}`,
    description: 'Тянущие мышцы',
    exercises: exerciseSelection.map((ex) => ({
      exerciseId: ex.id,
      exercise: ex,
      sets,
      targetReps: reps,
      restTimer: getRestTimer(goal),
    })),
  };
}

// Создание Legs шаблона
function createLegsTemplate(
  exercises: Exercise[],
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  variant: 'A' | 'B'
): Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isSystemTemplate'> {
  const { sets, reps } = getSetsReps(goal, experience);

  const exerciseSelection = [
    exercises.find((e) => e.muscleGroup === 'legs'), // Ноги
    exercises.find((e) => e.muscleGroup === 'glutes'), // Ягодицы
    exercises.find((e) => e.muscleGroup === 'abs'), // Пресс
  ].filter((e): e is Exercise => e !== undefined);

  return {
    name: `Legs ${variant}`,
    description: 'Ноги',
    exercises: exerciseSelection.map((ex) => ({
      exerciseId: ex.id,
      exercise: ex,
      sets,
      targetReps: reps,
      restTimer: getRestTimer(goal),
    })),
  };
}

// Получить подходы и повторения в зависимости от цели
function getSetsReps(
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience']
): { sets: number; reps: string } {
  const baseSets = experience === 'beginner' ? 2 : experience === 'intermediate' ? 3 : 4;

  switch (goal) {
    case 'strength':
      return { sets: baseSets, reps: '4-6' };
    case 'hypertrophy':
      return { sets: baseSets, reps: '8-12' };
    case 'endurance':
      return { sets: baseSets - 1, reps: '15-20' };
    case 'weightLoss':
      return { sets: baseSets, reps: '12-15' };
  }
}

// Получить время отдыха в зависимости от цели
function getRestTimer(goal: AIProgramRequest['goal']): number {
  switch (goal) {
    case 'strength':
      return 180; // 3 минуты
    case 'hypertrophy':
      return 90; // 1.5 минуты
    case 'endurance':
      return 45; // 45 секунд
    case 'weightLoss':
      return 60; // 1 минута
  }
}

// Генерация названия программы
function generateProgramName(
  goal: AIProgramRequest['goal'],
  daysPerWeek: number,
  duration: number
): string {
  const goalNames = {
    strength: 'Сила',
    hypertrophy: 'Масса',
    endurance: 'Выносливость',
    weightLoss: 'Похудение',
  };

  return `${goalNames[goal]} | ${daysPerWeek}x неделя | ${duration} недель`;
}

// Генерация описания программы
function generateProgramDescription(
  goal: AIProgramRequest['goal'],
  experience: AIProgramRequest['experience'],
  daysPerWeek: number
): string {
  const goalDescriptions = {
    strength: 'увеличения максимальной силы',
    hypertrophy: 'роста мышечной массы',
    endurance: 'повышения выносливости',
    weightLoss: 'снижения веса и жиросжигания',
  };

  const experienceDescriptions = {
    beginner: 'новичков',
    intermediate: 'среднего уровня',
    advanced: 'продвинутых атлетов',
  };

  return `Персонализированная программа для ${goalDescriptions[goal]}, адаптированная для ${experienceDescriptions[experience]}. ${daysPerWeek} тренировок в неделю с прогрессией нагрузки.`;
}

// Генерация расписания
function generateSchedule(daysPerWeek: number): string {
  const schedules: Record<number, string> = {
    2: 'Пн, Чт',
    3: 'Пн, Ср, Пт',
    4: 'Пн, Вт, Чт, Пт',
    5: 'Пн, Вт, Ср, Пт, Сб',
    6: 'Пн, Вт, Ср, Чт, Пт, Сб',
  };

  return schedules[daysPerWeek] || 'Гибкое расписание';
}

