import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkinHabit,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all habit actions

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .put(updateHabit)
  .delete(deleteHabit);

router.post('/:id/checkin', checkinHabit);

export default router;
