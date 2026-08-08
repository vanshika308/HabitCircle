import Habit from '../models/Habit.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Activity from '../models/Activity.js';
import { calculateUserRiskScore } from '../utils/riskScoreCalculator.js';

// Helper to calculate streaks for a habit based on history dates
const calculateHabitStreak = (history) => {
  // Filter for completed entries and sort dates in ascending order
  const completedDates = history
    .filter(entry => entry.completed)
    .map(entry => entry.date)
    .sort();

  if (completedDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Remove duplicates just in case
  const uniqueDates = [...new Set(completedDates)];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // 1. Calculate Longest Streak
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i > 0) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // 2. Calculate Current Streak
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasCompletedToday = uniqueDates.includes(todayStr);
  const hasCompletedYesterday = uniqueDates.includes(yesterdayStr);

  if (!hasCompletedToday && !hasCompletedYesterday) {
    currentStreak = 0;
  } else {
    // Start counting backwards from the most recent completed date
    currentStreak = 1;
    let checkDate = hasCompletedToday ? new Date(todayStr) : new Date(yesterdayStr);
    
    // We walk backwards
    let idx = uniqueDates.indexOf(hasCompletedToday ? todayStr : yesterdayStr);
    while (idx > 0) {
      const curr = new Date(uniqueDates[idx]);
      const prev = new Date(uniqueDates[idx - 1]);
      const diffTime = Math.abs(curr - prev);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        idx--;
      } else {
        break;
      }
    }
  }

  return { current: currentStreak, longest: longestStreak };
};

// Helper to update overall user streaks
const updateUserStreaks = async (user) => {
  const habits = await Habit.find({ user: user._id, isActive: true });
  
  if (habits.length === 0) {
    user.streaks.currentStreak = 0;
    return await user.save();
  }

  // Find the maximum current and longest streaks among all habits
  let maxCurrent = 0;
  let maxLongest = 0;
  let latestActive = null;

  habits.forEach(habit => {
    maxCurrent = Math.max(maxCurrent, habit.streak.current);
    maxLongest = Math.max(maxLongest, habit.streak.longest);

    // Find the latest completed date
    const completedHistory = habit.history.filter(h => h.completed);
    if (completedHistory.length > 0) {
      const dates = completedHistory.map(h => new Date(h.date));
      const maxDate = new Date(Math.max(...dates));
      if (!latestActive || maxDate > latestActive) {
        latestActive = maxDate;
      }
    }
  });

  user.streaks.currentStreak = maxCurrent;
  user.streaks.longestStreak = Math.max(user.streaks.longestStreak, maxLongest);
  if (latestActive) {
    user.streaks.lastActiveDate = latestActive;
  }

  return await user.save();
};

// @desc    Get user habits
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req, res) => {
  try {
    const { name, description, frequency } = req.body;

    if (!name) {
      res.status(400);
      return res.json({ message: 'Habit name is required' });
    }

    // Verify duplicate habit name
    const duplicate = await Habit.findOne({ user: req.user._id, name, isActive: true });
    if (duplicate) {
      res.status(400);
      return res.json({ message: 'A habit with this name already exists' });
    }

    const habit = await Habit.create({
      user: req.user._id,
      name,
      description,
      frequency: frequency || 'daily',
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.id || req.params.id);

    if (!habit || !habit.isActive || habit.user.toString() !== req.user._id.toString()) {
      // Allow fallback check in case body fields map id
      res.status(404);
      return res.json({ message: 'Habit not found' });
    }

    habit.name = req.body.name || habit.name;
    habit.description = req.body.description !== undefined ? req.body.description : habit.description;
    habit.frequency = req.body.frequency || habit.frequency;

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit || !habit.isActive || habit.user.toString() !== req.user._id.toString()) {
      res.status(404);
      return res.json({ message: 'Habit not found' });
    }

    habit.isActive = false;
    await habit.save();

    // Recalculate global streaks and risk score since an active habit was deleted
    const user = await User.findById(req.user._id);
    await updateUserStreaks(user);
    const updatedRisk = await calculateUserRiskScore(user._id, user.streaks);
    user.riskScore = {
      score: updatedRisk.score,
      level: updatedRisk.level,
      lastCalculated: new Date()
    };
    await user.save();

    res.json({ message: 'Habit archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-in/toggle completion for a habit
// @route   POST /api/habits/:id/checkin
// @access  Private
export const checkinHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    const checkinDate = req.body.date || new Date().toISOString().split('T')[0];

    if (!habit || !habit.isActive || habit.user.toString() !== req.user._id.toString()) {
      res.status(404);
      return res.json({ message: 'Habit not found' });
    }

    // Check if the date is already logged
    const existingIndex = habit.history.findIndex(entry => entry.date === checkinDate);
    let isCompleted = false;

    if (existingIndex > -1) {
      // Toggle completion status
      habit.history[existingIndex].completed = !habit.history[existingIndex].completed;
      isCompleted = habit.history[existingIndex].completed;
    } else {
      // Create new record
      habit.history.push({ date: checkinDate, completed: true });
      isCompleted = true;
    }

    // 1. Recalculate Habit Streaks
    const newStreaks = calculateHabitStreak(habit.history);
    const originalStreak = habit.streak.current;
    habit.streak = {
      current: newStreaks.current,
      longest: newStreaks.longest,
    };
    await habit.save();

    // 2. Synchronize Overall User Streaks
    const user = await User.findById(req.user._id);
    await updateUserStreaks(user);

    // 3. Recalculate Accountability Risk Score
    const updatedRisk = await calculateUserRiskScore(user._id, user.streaks);
    user.riskScore = {
      score: updatedRisk.score,
      level: updatedRisk.level,
      lastCalculated: new Date()
    };
    await user.save();

    // 4. Social Integration: Push notifications/feed events to all user circles
    if (isCompleted) {
      const userGroups = await Group.find({ members: req.user._id });
      
      for (const group of userGroups) {
        // Create normal completion log
        await Activity.create({
          group: group._id,
          sender: req.user._id,
          type: 'habit_completed',
          details: { habitName: habit.name }
        });

        // Trigger streak milestone highlight if they reach positive milestone checkins
        const currentStreakVal = habit.streak.current;
        if (currentStreakVal > originalStreak && [3, 5, 7, 10, 15, 30].includes(currentStreakVal)) {
          await Activity.create({
            group: group._id,
            sender: req.user._id,
            type: 'streak_milestone',
            details: { habitName: habit.name, streakCount: currentStreakVal }
          });
        }
      }
    }

    res.json({
      habit,
      userStreaks: user.streaks,
      riskScore: user.riskScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
