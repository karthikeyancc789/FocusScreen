import express from 'express';
import {
  getUserStats,
  createSession,
  updateSession,
  getSessionsByDateRange,
  getFocusMetrics,
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserStats);

router.route('/sessions')
  .get(protect, getSessionsByDateRange)
  .post(protect, createSession);

router.route('/sessions/:id')
  .put(protect, updateSession);

router.get('/focus', protect, getFocusMetrics);

export default router;