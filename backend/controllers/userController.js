import User from '../models/User.js';
import Habit from '../models/Habit.js';
import { calculateUserRiskScore } from '../utils/riskScoreCalculator.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatarUrl = req.body.avatarUrl !== undefined ? req.body.avatarUrl : user.avatarUrl;

      // Hashing is not re-triggered as password is not loaded or updated here
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        streaks: updatedUser.streaks,
        riskScore: updatedUser.riskScore,
      });
    } else {
      res.status(404);
      res.json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user statistics and recalculate risk score
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return res.json({ message: 'User not found' });
    }

    // 1. Recalculate Risk Score
    const updatedRisk = await calculateUserRiskScore(user._id, user.streaks);
    user.riskScore = {
      score: updatedRisk.score,
      level: updatedRisk.level,
      lastCalculated: new Date()
    };
    await user.save();

    // 2. Fetch User's habits to calculate completion rates
    const habits = await Habit.find({ user: user._id, isActive: true });
    
    let weeklyTotal = 0;
    let weeklyCompleted = 0;
    let monthlyTotal = 0;
    let monthlyCompleted = 0;

    const today = new Date();
    
    // Create Date limits
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    habits.forEach(habit => {
      // Each habit has a checklist history. Let's count check-ins in past 7 and 30 days.
      habit.history.forEach(entry => {
        const entryDate = new Date(entry.date);
        
        if (entryDate >= sevenDaysAgo && entryDate <= today) {
          weeklyTotal++;
          if (entry.completed) weeklyCompleted++;
        }
        
        if (entryDate >= thirtyDaysAgo && entryDate <= today) {
          monthlyTotal++;
          if (entry.completed) monthlyCompleted++;
        }
      });
    });

    const weeklyCompletionRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
    const monthlyCompletionRate = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;

    res.json({
      streaks: user.streaks,
      riskScore: user.riskScore,
      analytics: {
        weeklyCompletionRate,
        monthlyCompletionRate,
        totalHabitsCount: habits.length,
        weeklyCompletedCount: weeklyCompleted,
        weeklyTotalCheckins: weeklyTotal
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
