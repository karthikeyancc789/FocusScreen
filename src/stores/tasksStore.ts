import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/constants';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ tasks: response.data, isLoading: false });
    } catch (error) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to fetch tasks'
        : 'Failed to fetch tasks';
      set({ error: message, isLoading: false });
    }
  },

  addTask: async (task) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ tasks: [...get().tasks, response.data], isLoading: false });
    } catch (error) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to add task'
        : 'Failed to add task';
      set({ error: message, isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/tasks/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ 
        tasks: get().tasks.map(task => task._id === id ? response.data : task),
        isLoading: false 
      });
    } catch (error) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to update task'
        : 'Failed to update task';
      set({ error: message, isLoading: false });
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ 
        tasks: get().tasks.filter(task => task._id !== id),
        isLoading: false 
      });
    } catch (error) {
      const message = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to delete task'
        : 'Failed to delete task';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));