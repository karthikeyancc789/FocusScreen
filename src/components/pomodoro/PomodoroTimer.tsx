import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Settings, RefreshCw } from 'lucide-react';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import PomodoroSettings from './PomodoroSettings';

const PomodoroTimer: React.FC = () => {
  const {
    isActive,
    isPaused,
    timeRemaining,
    currentMode,
    currentSession,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipToNext,
    tick,
  } = usePomodoroStore();

  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Format time remaining as MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress calculation
  const getMaxTime = () => {
    if (currentMode === 'work') return settings.workDuration * 60;
    if (currentMode === 'shortBreak') return settings.shortBreakDuration * 60;
    return settings.longBreakDuration * 60;
  };
  
  const progress = 1 - timeRemaining / getMaxTime();

  // Setup timer interval
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        tick();
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, tick]);

  // Set document title to show timer
  useEffect(() => {
    const modeLabel = currentMode === 'work' ? 'Focus' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break';
    document.title = isActive ? `${formattedTime} - ${modeLabel} | FocusForge` : 'FocusForge';
    
    return () => {
      document.title = 'FocusForge';
    };
  }, [formattedTime, isActive, currentMode]);

  const getModeColor = () => {
    switch (currentMode) {
      case 'work':
        return 'text-primary-500 dark:text-primary-400';
      case 'shortBreak':
        return 'text-secondary-500 dark:text-secondary-400';
      case 'longBreak':
        return 'text-accent-500 dark:text-accent-400';
      default:
        return 'text-primary-500 dark:text-primary-400';
    }
  };

  const getModeBgColor = () => {
    switch (currentMode) {
      case 'work':
        return 'bg-primary-500 dark:bg-primary-600';
      case 'shortBreak':
        return 'bg-secondary-500 dark:bg-secondary-600';
      case 'longBreak':
        return 'bg-accent-500 dark:bg-accent-600';
      default:
        return 'bg-primary-500 dark:bg-primary-600';
    }
  };

  const handleTimerAction = () => {
    if (!isActive) {
      startTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const getModeLabel = () => {
    switch (currentMode) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pomodoro Timer</h2>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Timer settings"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="flex mb-4 justify-center space-x-2">
        <button
          className={`py-1 px-3 rounded-full text-sm font-medium ${
            currentMode === 'work'
              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => {
            if (currentMode !== 'work') {
              skipToNext();
            }
          }}
        >
          Focus
        </button>
        <button
          className={`py-1 px-3 rounded-full text-sm font-medium ${
            currentMode === 'shortBreak'
              ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => {
            if (currentMode !== 'shortBreak') {
              skipToNext();
            }
          }}
        >
          Short Break
        </button>
        <button
          className={`py-1 px-3 rounded-full text-sm font-medium ${
            currentMode === 'longBreak'
              ? 'bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => {
            if (currentMode !== 'longBreak') {
              skipToNext();
            }
          }}
        >
          Long Break
        </button>
      </div>

      <div className="relative flex justify-center items-center mb-8 pt-4">
        <div className="w-64 h-64 rounded-full flex items-center justify-center relative">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#F0F0F0"
              strokeWidth="4"
              className="dark:stroke-gray-700"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={45 * 2 * Math.PI}
              strokeDashoffset={45 * 2 * Math.PI * (1 - progress)}
              className={getModeColor()}
              initial={{ strokeDashoffset: 45 * 2 * Math.PI }}
              animate={{ strokeDashoffset: 45 * 2 * Math.PI * (1 - progress) }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${getModeColor()}`}>{formattedTime}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">{getModeLabel()}</div>
            {currentMode === 'work' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Session {currentSession}/{settings.sessionsBeforeLongBreak}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleTimerAction}
          className={`p-3 rounded-full ${getModeBgColor()} text-white shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-105`}
          aria-label={isActive && !isPaused ? 'Pause timer' : 'Start timer'}
        >
          {isActive && !isPaused ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-105"
          aria-label="Reset timer"
        >
          <RefreshCw size={24} />
        </button>
        <button
          onClick={skipToNext}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-105"
          aria-label="Skip to next session"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {showSettings && (
        <PomodoroSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default PomodoroTimer;