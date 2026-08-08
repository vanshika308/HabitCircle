import express from 'express';
import { updateUserProfile, getUserStats } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, updateUserProfile);
router.get('/stats', protect, getUserStats);

export default router;
