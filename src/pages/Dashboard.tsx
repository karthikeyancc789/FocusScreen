import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTasksStore } from '../stores/tasksStore';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import FocusMonitor from '../components/focus/FocusMonitor';
import StatsOverview from '../components/stats/StatsOverview';

const Dashboard: React.FC = () => {
  const { fetchTasks, isLoading } = useTasksStore();
  const [activeTab, setActiveTab] = useState<'focus' | 'tasks' | 'stats'>('focus');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'focus':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <PomodoroTimer />
            </div>
            <div>
              <FocusMonitor />
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="grid grid-cols-1 gap-6">
            <TaskForm />
            <TaskList />
          </div>
        );
      case 'stats':
        return <StatsOverview />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your productivity, manage tasks, and stay focused
        </p>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'focus'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Focus & Pomodoro
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-32 w-full max-w-2xl bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;