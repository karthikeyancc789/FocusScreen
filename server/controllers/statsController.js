import Session from '../models/Session.js';
import Task from '../models/Task.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user stats
// @route   GET /api/stats
// @access  Private
export const getUserStats = asyncHandler(async (req, res) => {
  // Get completed sessions count
  const sessionCount = await Session.countDocuments({ 
    user: req.user._id,
    completed: true
  });
  
  // Get completed tasks count
  const totalTasks = await Task.countDocuments({ user: req.user._id });
  const completedTasks = await Task.countDocuments({ 
    user: req.user._id,
    completed: true
  });
  
  // Get average focus score
  const focusScoreResult = await Session.aggregate([
    { $match: { user: req.user._id, focusScore: { $exists: true } } },
    { $group: { _id: null, average: { $avg: '$focusScore' } } }
  ]);
  
  const averageFocusScore = focusScoreResult.length > 0 
    ? Math.round(focusScoreResult[0].average)
    : 0;
  
  // Get recent sessions
  const recentSessions = await Session.find({ user: req.user._id })
    .sort({ startTime: -1 })
    .limit(5);
  
  res.json({
    sessionCount,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    averageFocusScore,
    recentSessions,
  });
});

// @desc    Create a session
// @route   POST /api/stats/sessions
// @access  Private
export const createSession = asyncHandler(async (req, res) => {
  const { type, startTime, endTime, duration, completed, focusScore, stressLevel, distractionCount, tasks } = req.body;

  const session = await Session.create({
    user: req.user._id,
    type,
    startTime,
    endTime,
    duration,
    completed,
    focusScore,
    stressLevel,
    distractionCount,
    tasks,
  });

  res.status(201).json(session);
});

// @desc    Update a session
// @route   PUT /api/stats/sessions/:id
// @access  Private
export const updateSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Check if session belongs to user
  if (session.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this session');
  }

  const updatedSession = await Session.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(updatedSession);
});

// @desc    Get sessions by date range
// @route   GET /api/stats/sessions
// @access  Private
export const getSessionsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const query = { user: req.user._id };
  
  if (startDate && endDate) {
    query.startTime = { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    };
  }
  
  const sessions = await Session.find(query).sort({ startTime: -1 });
  
  res.json(sessions);
});

// @desc    Get focus metrics over time
// @route   GET /api/stats/focus
// @access  Private
export const getFocusMetrics = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const focusData = await Session.aggregate([
    { 
      $match: { 
        user: req.user._id,
        startTime: { $gte: startDate },
        focusScore: { $exists: true }
      } 
    },
    {
      $group: {
        _id: { 
          $dateToString: { format: '%Y-%m-%d', date: '$startTime' } 
        },
        averageFocus: { $avg: '$focusScore' },
        averageStress: { $avg: '$stressLevel' },
        totalSessions: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json(focusData);
});