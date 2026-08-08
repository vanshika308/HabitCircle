import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserStats } from '../redux/slices/authSlice';
import { fetchHabits, toggleHabit } from '../redux/slices/habitSlice';
import { fetchGroups } from '../redux/slices/groupSlice';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../redux/slices/uiSlice';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import Button from '../components/common/Button';
import { Flame, Award, ShieldAlert, CheckCircle, ArrowRight, Circle, CheckCircle2, Users } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, stats, statsLoading } = useSelector((state) => state.auth);
  const { habits, loading: habitsLoading } = useSelector((state) => state.habits);
  const { groups } = useSelector((state) => state.groups);

  const [userJoinedGroups, setUserJoinedGroups] = useState([]);

  useEffect(() => {
    dispatch(fetchUserStats());
    dispatch(fetchHabits());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (groups && user) {
      const active = groups.filter((g) => g.members.includes(user._id));
      setUserJoinedGroups(active);
    }
  }, [groups, user]);

  const handleQuickCheckin = (habitId, habitName) => {
    const todayStr = new Date().toISOString().split('T')[0];
    dispatch(toggleHabit({ id: habitId, date: todayStr }))
      .unwrap()
      .then((res) => {
        const wasCompleted = res.habit.history.find(h => h.date === todayStr)?.completed;
        if (wasCompleted) {
          dispatch(showToast({ message: `Habit "${habitName}" logged!`, type: 'success' }));
        } else {
          dispatch(showToast({ message: `Check-in removed for "${habitName}".`, type: 'info' }));
        }
        dispatch(fetchUserStats());
      })
      .catch((err) => {
        dispatch(showToast({ message: err || 'Check-in failed', type: 'error' }));
      });
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High Risk':
        return 'text-rose-600 border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20';
      case 'Medium Risk':
        return 'text-amber-600 border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20';
      default:
        return 'text-zinc-600 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20';
    }
  };

  if (statsLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { analytics } = stats;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Minimalist Welcome Card */}
      <div className="glass-card p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
            ⭕ Accountability Overview
          </span>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight font-sans">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-sans">
            Your accountability status is <span className="font-bold text-zinc-700 dark:text-zinc-300">{user?.riskScore?.level}</span>. Log your routines to maintain your streak!
          </p>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Weekly Completion Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-sans">
              Weekly Completion
            </span>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1.5 font-sans">
              {analytics?.weeklyCompletionRate || 0}%
            </p>
          </div>
          <div className="mt-4 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-zinc-900 dark:bg-zinc-50 h-full rounded-full transition-all duration-300"
              style={{ width: `${analytics?.weeklyCompletionRate || 0}%` }}
            />
          </div>
        </div>

        {/* Monthly Completion Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-sans">
              Monthly Completion
            </span>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1.5 font-sans">
              {analytics?.monthlyCompletionRate || 0}%
            </p>
          </div>
          <div className="mt-4 w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-zinc-900 dark:bg-zinc-50 h-full rounded-full transition-all duration-300"
              style={{ width: `${analytics?.monthlyCompletionRate || 0}%` }}
            />
          </div>
        </div>

        {/* Current Active Streak Card */}
        <div className="glass-card p-6 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-sans">
              Current Streak
            </span>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1.5 font-sans">
              {user?.streaks?.currentStreak || 0}d
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shadow-sm">
            <Flame size={18} />
          </div>
        </div>

        {/* Accountability Risk Rating */}
        <div className="glass-card p-6 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-sans">
              Risk Score
            </span>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1.5 font-sans">
              {user?.riskScore?.score || 0}
              <span className="text-xs text-zinc-400">/100</span>
            </p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${getRiskColor(user?.riskScore?.level)}`}>
            <ShieldAlert size={18} />
          </div>
        </div>
      </div>

      {/* Main Grid: Personal habits + Group Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Habits Quick Check-in Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold text-zinc-900 dark:text-white flex items-center gap-2 font-sans">
                <CheckCircle size={18} className="text-zinc-800 dark:text-zinc-200" />
                Quick Log Check-ins
              </h3>
              <Button
                onClick={() => navigate('/habits')}
                variant="secondary"
                size="sm"
                icon={ArrowRight}
              >
                Go to Habits
              </Button>
            </div>

            {habitsLoading && habits.length === 0 ? (
              <LoadingSpinner />
            ) : habits.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p className="text-sm font-semibold font-sans">No routines tracked yet.</p>
                <p className="text-[10px] mt-1 font-sans">Create a habit in the Habits Workspace to begin.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {habits.map((habit) => {
                  const completedToday = habit.history.some(
                    (entry) => entry.date === todayStr && entry.completed
                  );

                  return (
                    <div
                      key={habit._id}
                      onClick={() => handleQuickCheckin(habit._id, habit.name)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-150 active:scale-[0.99]
                        ${completedToday
                          ? 'bg-zinc-50/50 dark:bg-zinc-800/10 border-zinc-900/10 dark:border-zinc-50/10 hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {completedToday ? (
                          <CheckCircle2 className="text-zinc-900 dark:text-zinc-100 flex-shrink-0" size={18} />
                        ) : (
                          <Circle className="text-zinc-300 dark:text-zinc-700 flex-shrink-0" size={18} />
                        )}
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-white leading-tight font-sans">
                            {habit.name}
                          </p>
                          <span className="inline-block mt-1 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-sans">
                            {habit.frequency}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        <Flame size={13} className={habit.streak?.current > 0 ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'} />
                        <span className="font-extrabold text-zinc-950 dark:text-white font-sans">{habit.streak?.current || 0}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Group Standings Summary */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold text-zinc-900 dark:text-white flex items-center gap-2 font-sans">
                <Users size={18} className="text-zinc-800 dark:text-zinc-200" />
                Active Circles
              </h3>
              <Button
                onClick={() => navigate('/groups')}
                variant="secondary"
                size="sm"
                icon={ArrowRight}
              >
                Find Circles
              </Button>
            </div>

            {userJoinedGroups.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 font-sans">
                <p className="text-xs font-bold">Not in any circles yet.</p>
                <p className="text-[9px] mt-1 text-zinc-400">Join an accountability circle to start peer-to-peer tracking.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userJoinedGroups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => navigate(`/groups/${group._id}`)}
                    className="flex justify-between items-center p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-950 dark:text-white font-sans">
                        {group.name}
                      </p>
                      <span className="text-[9px] text-zinc-400 mt-1 font-sans block">
                        {group.members.length} members
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-zinc-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
