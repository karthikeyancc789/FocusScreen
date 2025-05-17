import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
}

interface PomodoroState {
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  currentMode: 'work' | 'shortBreak' | 'longBreak';
  currentSession: number;
  settings: PomodoroSettings;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipToNext: () => void;
  tick: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      isActive: false,
      isPaused: false,
      timeRemaining: 25 * 60, // 25 minutes in seconds
      currentMode: 'work',
      currentSession: 1,
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
      },
      
      startTimer: () => {
        const { currentMode, settings } = get();
        let duration;
        
        if (currentMode === 'work') {
          duration = settings.workDuration * 60;
        } else if (currentMode === 'shortBreak') {
          duration = settings.shortBreakDuration * 60;
        } else {
          duration = settings.longBreakDuration * 60;
        }
        
        set({ 
          isActive: true, 
          isPaused: false,
          timeRemaining: duration 
        });
      },
      
      pauseTimer: () => set({ isPaused: true }),
      
      resumeTimer: () => set({ isPaused: false }),
      
      resetTimer: () => {
        const { settings, currentMode } = get();
        let duration;
        
        if (currentMode === 'work') {
          duration = settings.workDuration * 60;
        } else if (currentMode === 'shortBreak') {
          duration = settings.shortBreakDuration * 60;
        } else {
          duration = settings.longBreakDuration * 60;
        }
        
        set({
          isActive: false,
          isPaused: false,
          timeRemaining: duration,
        });
      },
      
      skipToNext: () => {
        const { currentMode, currentSession, settings } = get();
        const { sessionsBeforeLongBreak } = settings;
        
        // Determine next mode and session
        let nextMode: 'work' | 'shortBreak' | 'longBreak';
        let nextSession = currentSession;
        
        if (currentMode === 'work') {
          if (currentSession % sessionsBeforeLongBreak === 0) {
            nextMode = 'longBreak';
          } else {
            nextMode = 'shortBreak';
          }
        } else {
          nextMode = 'work';
          if (currentMode === 'longBreak') {
            nextSession = 1;
          } else {
            nextSession = currentSession + 1;
          }
        }
        
        // Set duration based on next mode
        let duration;
        if (nextMode === 'work') {
          duration = settings.workDuration * 60;
        } else if (nextMode === 'shortBreak') {
          duration = settings.shortBreakDuration * 60;
        } else {
          duration = settings.longBreakDuration * 60;
        }
        
        set({
          currentMode: nextMode,
          currentSession: nextSession,
          timeRemaining: duration,
          isActive: false,
          isPaused: false,
        });
      },
      
      tick: () => {
        const { timeRemaining, isActive, isPaused } = get();
        
        if (isActive && !isPaused && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (isActive && !isPaused && timeRemaining === 0) {
          // When timer completes, automatically move to next session
          get().skipToNext();
        }
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        get().resetTimer();
      },
    }),
    {
      name: 'pomodoro-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);