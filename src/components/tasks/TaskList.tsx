import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash, Edit, Info, X, Calendar, Tag } from 'lucide-react';
import { useTasksStore, Task } from '../../stores/tasksStore';
import { TASK_PRIORITIES } from '../../config/constants';
import { toast } from 'sonner';

const TaskList: React.FC = () => {
  const { tasks, updateTask, deleteTask } = useTasksStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Get unique categories from tasks
  const categories = ['all', ...new Set(tasks.map(task => task.category))];

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || 
                        (filter === 'active' && !task.completed) || 
                        (filter === 'completed' && task.completed);
                        
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task._id, { completed: !task.completed });
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task._id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    
    try {
      await updateTask(id, { title: editTitle });
      setEditingTask(null);
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
  };

  const toggleExpandTask = (id: string) => {
    setExpandedTask(expandedTask === id ? null : id);
  };

  const getPriorityStyles = (priority: 'low' | 'medium' | 'high') => {
    const priorityObj = TASK_PRIORITIES.find(p => p.value === priority);
    return priorityObj?.color || '';
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-4">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Your Tasks
            {filteredTasks.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({filteredTasks.length})
              </span>
            )}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                className={`px-3 py-1 text-sm ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-sm ${
                  filter === 'active'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button
                className={`px-3 py-1 text-sm ${
                  filter === 'completed'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p>No tasks found. Add a new task to get started!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredTasks.map(task => (
                <motion.li
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="py-3"
                >
                  <div className="flex items-start">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`flex-shrink-0 h-5 w-5 rounded-full border ${
                        task.completed
                          ? 'bg-primary-500 border-primary-500 flex items-center justify-center'
                          : 'border-gray-300 dark:border-gray-600'
                      } mt-1 mr-3`}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed && <Check size={14} className="text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingTask === task._id ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(task._id)}
                            className="ml-2 p-1 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            aria-label="Save edit"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="ml-1 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            aria-label="Cancel edit"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-start">
                            <span
                              className={`text-sm font-medium ${
                                task.completed
                                  ? 'line-through text-gray-500 dark:text-gray-400'
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getPriorityStyles(
                                task.priority
                              )}`}
                            >
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Tag size={12} className="mr-1" />
                              {task.category}
                            </span>
                            
                            {task.dueDate && (
                              <span className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                {formatDate(task.dueDate as Date)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex ml-3 items-center">
                      {!editingTask && (
                        <>
                          <button
                            onClick={() => toggleExpandTask(task._id)}
                            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            aria-label="View details"
                          >
                            <Info size={18} />
                          </button>
                          <button
                            onClick={() => startEditing(task)}
                            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            aria-label="Edit task"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            aria-label="Delete task"
                          >
                            <Trash size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded task details */}
                  {expandedTask === task._id && task.description && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 ml-8 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                    >
                      {task.description}
                    </motion.div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskList;