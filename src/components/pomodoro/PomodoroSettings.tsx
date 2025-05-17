import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import { motion, AnimatePresence } from 'framer-motion';

interface PomodoroSettingsProps {
  onClose: () => void;
}

const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({ onClose }) => {
  const { settings, updateSettings } = usePomodoroStore();
  
  const [workDuration, setWorkDuration] = useState(settings.workDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(settings.sessionsBeforeLongBreak);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      sessionsBeforeLongBreak,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
        >
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Timer Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="workDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Focus Duration (minutes)
              </label>
              <input
                id="workDuration"
                type="number"
                min="1"
                max="120"
                value={workDuration}
                onChange={(e) => setWorkDuration(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="shortBreakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short Break Duration (minutes)
              </label>
              <input
                id="shortBreakDuration"
                type="number"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="longBreakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long Break Duration (minutes)
              </label>
              <input
                id="longBreakDuration"
                type="number"
                min="1"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="sessionsBeforeLongBreak" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sessions Before Long Break
              </label>
              <input
                id="sessionsBeforeLongBreak"
                type="number"
                min="1"
                max="10"
                value={sessionsBeforeLongBreak}
                onChange={(e) => setSessionsBeforeLongBreak(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PomodoroSettings;