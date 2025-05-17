// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Pomodoro timer defaults
export const DEFAULT_WORK_DURATION = 25; // minutes
export const DEFAULT_SHORT_BREAK = 5; // minutes
export const DEFAULT_LONG_BREAK = 15; // minutes
export const DEFAULT_SESSIONS_BEFORE_LONG_BREAK = 4;

// Task categories
export const TASK_CATEGORIES = [
  'Work',
  'Study',
  'Personal',
  'Health',
  'Finance',
  'Chores',
  'Other'
];

// Task priorities
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-200 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-200 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-200 text-red-800' },
];