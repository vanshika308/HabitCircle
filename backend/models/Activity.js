import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Optional (used for Nudges and High-Fives between members)
  },
  type: {
    type: String,
    enum: ['habit_completed', 'streak_milestone', 'high_five', 'nudge'],
    required: true,
  },
  details: {
    habitName: {
      type: String,
    },
    streakCount: {
      type: Number,
    },
  },
}, {
  timestamps: true,
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
