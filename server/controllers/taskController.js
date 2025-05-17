import Task from '../models/Task.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, category, dueDate, completed } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please add a task title');
  }

  const task = await Task.create({
    user: req.user._id,
    title,
    description,
    priority,
    category,
    dueDate,
    completed: completed || false,
  });

  res.status(201).json(task);
});

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to user
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to access this task');
  }

  res.json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to user
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this task');
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if task belongs to user
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this task');
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
});

// @desc    Get tasks by category
// @route   GET /api/tasks/category/:category
// @access  Private
export const getTasksByCategory = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    user: req.user._id,
    category: req.params.category,
  });
  res.json(tasks);
});

// @desc    Get tasks by priority
// @route   GET /api/tasks/priority/:priority
// @access  Private
export const getTasksByPriority = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    user: req.user._id,
    priority: req.params.priority,
  });
  res.json(tasks);
});