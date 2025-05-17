import React, { useState } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock, Brain } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Sample data (would be replaced with real data from an API)
const generatePastDays = () => {
  return Array.from({ length: 7 }, (_, i) => {
    return format(subDays(new Date(), 6 - i), 'MMM dd');
  });
};

// Dummy data for demo
const focusData = {
  labels: generatePastDays(),
  datasets: [
    {
      label: 'Focus Score',
      data: [65, 72, 68, 75, 82, 78, 85],
      fill: false,
      backgroundColor: 'rgba(51, 102, 255, 0.2)',
      borderColor: 'rgba(51, 102, 255, 1)',
      tension: 0.4,
    },
  ],
};

const taskCompletionData = {
  labels: ['Completed', 'Pending'],
  datasets: [
    {
      data: [75, 25],
      backgroundColor: ['rgba(76, 175, 80, 0.6)', 'rgba(244, 67, 54, 0.6)'],
      borderColor: ['rgba(76, 175, 80, 1)', 'rgba(244, 67, 54, 1)'],
      borderWidth: 1,
    },
  ],
};

const sessionData = {
  labels: generatePastDays(),
  datasets: [
    {
      label: 'Focus Sessions',
      data: [3, 5, 4, 6, 3, 5, 4],
      backgroundColor: 'rgba(51, 102, 255, 0.6)',
    },
  ],
};

const StatsOverview: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp size={20} className="mr-2 text-primary-500" />
            Performance Overview
          </h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === 'week'
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === 'month'
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="h-64">
          <Line
            data={focusData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    color: 'rgb(156, 163, 175)',
                  },
                  grid: {
                    color: 'rgba(156, 163, 175, 0.1)',
                  },
                },
                x: {
                  ticks: {
                    color: 'rgb(156, 163, 175)',
                  },
                  grid: {
                    display: false,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  titleColor: 'rgb(243, 244, 246)',
                  bodyColor: 'rgb(243, 244, 246)',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar size={18} className="mr-2 text-primary-500" />
            Task Completion Rate
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-44 h-44">
              <Doughnut
                data={taskCompletionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'rgb(156, 163, 175)',
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      titleColor: 'rgb(243, 244, 246)',
                      bodyColor: 'rgb(243, 244, 246)',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock size={18} className="mr-2 text-primary-500" />
            Focus Sessions
          </h3>
          <div className="h-64">
            <Bar
              data={sessionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'rgb(156, 163, 175)',
                      stepSize: 1,
                    },
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                  },
                  x: {
                    ticks: {
                      color: 'rgb(156, 163, 175)',
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    titleColor: 'rgb(243, 244, 246)',
                    bodyColor: 'rgb(243, 244, 246)',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Brain size={18} className="mr-2 text-primary-500" />
          Focus Recommendations
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">Optimal Work Times</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Based on your patterns, your highest focus periods are in the morning between 9 AM and 11 AM. 
              Schedule important tasks during this window.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">Break Suggestions</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You tend to lose focus after 45 minutes of continuous work. Consider using a 25-5 minute 
              work-break ratio instead of the default 25-5.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">Focus Improvement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your focus improves when you complete small tasks first. Try organizing your task list to 
              start with quick wins before tackling larger projects.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsOverview;