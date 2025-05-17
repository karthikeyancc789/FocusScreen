import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/constants';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  let user: User | null = null;
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  try {
    if (userStr && userStr !== 'undefined') {
      user = JSON.parse(userStr);
    }

  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    localStorage.removeItem('user'); // Clean up corrupt data
  }

  return {
    user,
    token,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        set({ user, token, isLoading: false });
        console.log(localStorage);
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || 'Authentication failed'
          : 'Authentication failed';
        set({ error: message, isLoading: false });
      }
    },

    register: async (name, email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({ user, token, isLoading: false });
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || 'Registration failed'
          : 'Registration failed';
        set({ error: message, isLoading: false });
        console.error(message);
      }
    },

    logout: () => {
      console.log("User is logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    },

    clearError: () => set({ error: null }),
  };
});
