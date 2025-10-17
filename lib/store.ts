// Zustand store для управления состоянием приложения
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Workout, WorkoutTemplate, Exercise, UserSettings, BodyMeasurement } from '@/types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Workouts
  workouts: Workout[];
  addWorkout: (workout: Workout) => void;
  
  // Active Workout
  activeWorkout: Workout | null;
  setActiveWorkout: (workout: Workout | null) => void;
  updateActiveWorkout: (updates: Partial<Workout>) => void;
  startWorkout: (workout: Partial<Workout>) => void;
  updateWorkout: (workout: Workout) => void;
  completeWorkout: () => void;
  
  // Templates
  templates: WorkoutTemplate[];
  setTemplates: (templates: WorkoutTemplate[]) => void;
  addTemplate: (template: WorkoutTemplate) => void;
  
  // Exercises
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  
  // Measurements
  measurements: BodyMeasurement[];
  setMeasurements: (measurements: BodyMeasurement[]) => void;
  addMeasurement: (measurement: BodyMeasurement) => void;
  
  // UI State
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Rest Timer
  restTimerActive: boolean;
  restTimeRemaining: number;
  setRestTimer: (active: boolean, time?: number) => void;
  startRestTimer: (seconds: number) => void;
  decrementRestTimer: () => void;
  
  // Network State
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  
  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      updateSettings: (settings) => set((state) => ({
        user: state.user ? {
          ...state.user,
          settings: { ...state.user.settings, ...settings }
        } : null,
      })),
      
      // Workouts
      workouts: [],
      addWorkout: (workout) => set((state) => ({
        workouts: [workout, ...state.workouts],
      })),
      
      // Active Workout
      activeWorkout: null,
      setActiveWorkout: (workout) => set({ activeWorkout: workout }),
      updateActiveWorkout: (updates) => set((state) => ({
        activeWorkout: state.activeWorkout ? {
          ...state.activeWorkout,
          ...updates,
        } : null,
      })),
      startWorkout: (workout) => set({
        activeWorkout: {
          id: workout.id || '',
          userId: workout.userId || get().user?.id || '',
          name: workout.templateName || 'Тренировка',
          exercises: workout.exercises || [],
          startedAt: workout.startedAt || new Date(),
          templateId: workout.templateId,
          templateName: workout.templateName,
          notes: workout.notes || '',
          isActive: true,
          totalVolume: 0,
          totalSets: 0,
          totalReps: 0,
        } as Workout,
      }),
      updateWorkout: (workout) => set({ activeWorkout: workout }),
      completeWorkout: () => set({ activeWorkout: null }),
      
      // Templates
      templates: [],
      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template],
      })),
      
      // Exercises
      exercises: [],
      setExercises: (exercises) => set({ exercises }),
      addExercise: (exercise) => set((state) => ({
        exercises: [...state.exercises, exercise],
      })),
      
      // Measurements
      measurements: [],
      setMeasurements: (measurements) => set({ measurements }),
      addMeasurement: (measurement) => set((state) => ({
        measurements: [measurement, ...state.measurements], // Новые замеры в начале
      })),
      
      // UI State
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        // Применяем тему к документу
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      // Rest Timer
      restTimerActive: false,
      restTimeRemaining: 0,
      setRestTimer: (active, time) => set({
        restTimerActive: active,
        restTimeRemaining: time !== undefined ? time : get().restTimeRemaining,
      }),
      startRestTimer: (seconds) => set((state) => ({
        restTimerActive: true,
        restTimeRemaining: seconds || state.user?.settings?.restTimerDefault || 90,
      })),
      decrementRestTimer: () => set((state) => ({
        restTimeRemaining: Math.max(0, state.restTimeRemaining - 1),
        restTimerActive: state.restTimeRemaining > 1,
      })),
      
      // Network State
      isOnline: true,
      setIsOnline: (online) => set({ isOnline: online }),
      
      // Loading States
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'nubo-training-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      } as any),
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        templates: state.templates,
      }),
    }
  )
);



