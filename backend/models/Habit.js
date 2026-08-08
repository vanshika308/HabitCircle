import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a habit name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily',
  },
  history: [
    {
      date: {
        type: String, // Format: "YYYY-MM-DD" for timezone-independent local dates
        required: true,
      },
      completed: {
        type: Boolean,
        default: true,
      },
    },
  ],
  streak: {
    current: {
      type: Number,
      default: 0,
    },
    longest: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compile unique compound index to verify user doesn't double-create identical habit names
habitSchema.index({ user: 1, name: 1 }, { unique: true });

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
