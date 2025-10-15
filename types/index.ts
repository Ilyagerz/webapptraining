// Типы для приложения NUBO Training

export interface User {
  id: string;
  telegramId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  email?: string;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  restTimerDefault: number; // секунды
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartTimer: boolean;
  weightUnit: 'kg' | 'lbs';
}

export interface Exercise {
  id: string;
  name: string;
  nameEn?: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  equipment: Equipment[];
  description: string;
  instructions: string[];
  gifUrl?: string;
  isCustom: boolean;
  userId?: string; // для кастомных упражнений
}

export type ExerciseCategory = 
  | 'strength' 
  | 'cardio' 
  | 'stretching' 
  | 'other';

export type MuscleGroup = 
  | 'chest'      // Грудь
  | 'back'       // Спина
  | 'shoulders'  // Плечи
  | 'arms'       // Руки
  | 'legs'       // Ноги
  | 'abs'        // Пресс
  | 'glutes'     // Ягодицы
  | 'fullBody'   // Все тело
  | 'other';

export type Equipment = 
  | 'barbell'     // Штанга
  | 'dumbbell'    // Гантели
  | 'machine'     // Тренажер
  | 'cable'       // Блоки/кабели
  | 'bodyweight'  // Свой вес
  | 'kettlebell'  // Гири
  | 'bands'       // Резинки
  | 'other';

export type SetType = 'standard' | 'amrap' | 'emom';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  isWarmup: boolean;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  // Special set types
  setType: SetType;
  targetTime?: number; // для AMRAP (сколько времени) или EMOM (интервал)
  actualTime?: number; // фактическое время выполнения
}

export interface PreviousSetData {
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
  superset?: string; // ID группы суперсета (legacy)
  supersetId?: string; // ID группы суперсета
  supersetOrder?: number; // Порядок в суперсете (1 или 2)
  restTimer?: number; // переопределение таймера отдыха для этого упражнения
}

export interface Workout {
  id: string;
  userId: string;
  templateId?: string; // если создана из шаблона
  templateName?: string;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // секунды
  exercises: WorkoutExercise[];
  totalVolume: number; // кг
  totalSets: number;
  totalReps: number;
  notes?: string;
  isActive: boolean;
  records?: WorkoutRecord[]; // рекорды установленные в этой тренировке
}

export interface WorkoutRecord {
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | '1rm' | 'volume' | 'reps';
  value: number;
  previousValue?: number;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  isSystemTemplate: boolean; // системные шаблоны vs пользовательские
}

export interface TemplateExercise {
  id?: string; // Временный ID для UI
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  targetReps?: string; // например "8-12"
  targetWeight?: number;
  restTimer?: number;
  superset?: string;
  notes?: string;
  reps?: number; // Для обратной совместимости
}

export interface WorkoutHistory {
  workouts: Workout[];
  totalWorkouts: number;
  totalVolume: number;
  totalDuration: number;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
    calves?: number;
    neck?: number;
    shoulders?: number;
  };
  photos?: string[];
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | '1rm' | 'volume' | 'reps';
  value: number;
  date: Date;
  workoutId: string;
}

// Статистика
export interface UserStats {
  userId: string;
  totalWorkouts: number;
  totalVolume: number;
  totalDuration: number;
  currentStreak: number;
  longestStreak: number;
  favoriteExercises: Array<{ exerciseId: string; count: number }>;
  volumeByMuscleGroup: Record<MuscleGroup, number>;
  weeklyWorkouts: number[];
}

// AI Program
export interface AIProgramRequest {
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'weightLoss';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  duration: number; // недель
  equipment: Equipment[];
  restrictions?: string;
}

export interface AIProgram {
  id: string;
  name: string;
  description: string;
  duration: number;
  templates: WorkoutTemplate[];
  schedule: string; // какие дни недели
}

// Telegram
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: string;
  hash: string;
}








