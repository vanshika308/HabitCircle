import express from 'express';
import {
  getGroups,
  createGroup,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  sendNudge,
  sendHighFive,
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all group actions

router.route('/')
  .get(getGroups)
  .post(createGroup);

router.route('/:id')
  .get(getGroupDetails);

router.post('/:id/join', joinGroup);
router.post('/:id/leave', leaveGroup);

// Social interactions routes
router.post('/:id/interactions/nudge', sendNudge);
router.post('/:id/interactions/highfive', sendHighFive);

export default router;
