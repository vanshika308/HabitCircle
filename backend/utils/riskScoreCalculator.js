import Habit from '../models/Habit.js';

/**
 * Calculates a user's Accountability Risk Score (0 - 100)
 * and returns the score and risk category.
 * 
 * @param {string} userId - Mongoose ObjectId string
 * @param {Object} userStreaks - User streaks object { currentStreak, longestStreak, lastActiveDate }
 * @returns {Object} { score, level }
 */
export const calculateUserRiskScore = async (userId, userStreaks) => {
  try {
    // 1. Fetch user's active habits
    const habits = await Habit.find({ user: userId, isActive: true });
    
    if (!habits || habits.length === 0) {
      return { score: 50, level: 'Medium Risk' }; // Neutral default if no habits exist
    }

    let totalPossibleCheckins = habits.length * 7;
    let completedCheckins = 0;
    const today = new Date();
    
    // Helper to get past 7 days dates as YYYY-MM-DD
    const last7DaysStrings = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    // 2. Count completions in the last 7 days
    habits.forEach(habit => {
      habit.history.forEach(entry => {
        if (last7DaysStrings.includes(entry.date) && entry.completed) {
          completedCheckins++;
        }
      });
    });

    // Calculate Completion Rate (0 to 1)
    const completionRate = totalPossibleCheckins > 0 ? (completedCheckins / totalPossibleCheckins) : 0;
    const missedRate = 1 - completionRate; // 0 = perfect completion, 1 = missed everything

    // Base score from missed rate (maps 0-1 to 0-60 points)
    let score = missedRate * 60;

    // 3. Streak break factor (maps to 0-20 points)
    // If current streak is much lower than longest streak, add risk points
    const current = userStreaks?.currentStreak || 0;
    const longest = userStreaks?.longestStreak || 0;
    
    if (longest > 0) {
      const streakRatio = current / longest;
      if (streakRatio < 0.25) {
        score += 20; // High risk: broken streak or barely active
      } else if (streakRatio < 0.6) {
        score += 10; // Moderate risk
      }
    } else {
      score += 15; // No historical streaks recorded yet
    }

    // 4. Recency factor (maps to 0-20 points)
    // Days since last completion date
    if (userStreaks?.lastActiveDate) {
      const lastActive = new Date(userStreaks.lastActiveDate);
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 5) {
        score += 20; // Inactive for a while
      } else if (diffDays > 2) {
        score += 10; // Inactive for a couple of days
      }
    } else {
      score += 20; // Never active
    }

    // Ensure score stays inside 0 - 100 bounds
    score = Math.min(Math.max(Math.round(score), 0), 100);

    // Determine category
    let level = 'Low Risk';
    if (score >= 70) {
      level = 'High Risk';
    } else if (score >= 30) {
      level = 'Medium Risk';
    }

    return { score, level };
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return { score: 50, level: 'Medium Risk' };
  }
};
