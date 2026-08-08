import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, fetchUserStats } from '../redux/slices/authSlice';
import { showToast } from '../redux/slices/uiSlice';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { User, FileText, Image, ShieldAlert, Award, Calendar, CheckCircle } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, stats, loading, statsLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    dispatch(fetchUserStats());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      dispatch(showToast({ message: 'Name cannot be empty', type: 'error' }));
      return;
    }
    dispatch(updateUserProfile(formData))
      .unwrap()
      .then(() => {
        dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
      })
      .catch((err) => {
        dispatch(showToast({ message: err || 'Failed to update profile', type: 'error' }));
      });
  };

  if (!user || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getRiskExplanation = (level) => {
    switch (level) {
      case 'High Risk':
        return {
          color: 'text-rose-500 border-rose-500/20 bg-rose-500/5',
          title: 'Immediate Action Needed',
          desc: 'Your check-in rate has dropped significantly or your streak has broken recently. Re-establish accountability by logging a habit check-in today!',
        };
      case 'Medium Risk':
        return {
          color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
          title: 'Streaks Vulnerable',
          desc: 'You have missed a few check-ins or let your recency slip. Consistency is key! Aim for 3 consecutive completion days to drop back to Low Risk.',
        };
      default:
        return {
          color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
          title: 'Accountability Secure',
          desc: 'Excellent consistency! Your streaks are healthy, and your circle group is receiving regular notifications. Keep up the high standards!',
        };
    }
  };

  const riskExplanation = getRiskExplanation(user.riskScore?.level);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-sans">
          My Account
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Manage your social identity and view your performance indicators
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Edit Card */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 font-sans flex items-center gap-2">
            <User size={20} className="text-brand-500" />
            Edit Profile Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-brand-500/10 flex-shrink-0">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="w-full">
                <Input
                  label="Avatar Image Link"
                  type="text"
                  name="avatarUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  icon={Image}
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Paste any image URL to update your profile photo
                </p>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                Short Biography
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <FileText size={18} />
                </div>
                <textarea
                  name="bio"
                  placeholder="Tell your accountability group about your goals..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-xl transition-all duration-200 text-sm py-3 pl-11 pr-4
                    bg-white/80 dark:bg-zinc-900/80 text-zinc-950 dark:text-zinc-50
                    border border-zinc-200 dark:border-zinc-800
                    focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </form>
        </div>

        {/* Right Side: Streaks & Dynamic Risk Analytics */}
        <div className="space-y-6">
          {/* Streaks Analytics Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 font-sans">
              <Award size={18} className="text-amber-500" />
              Streak Badges
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-sans">
                  Current Streak
                </p>
                <p className="text-3xl font-extrabold text-amber-500 mt-1 font-sans">
                  {user.streaks?.currentStreak || 0}d
                </p>
              </div>

              <div className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-sans">
                  Longest Streak
                </p>
                <p className="text-3xl font-extrabold text-zinc-700 dark:text-zinc-300 mt-1 font-sans">
                  {user.streaks?.longestStreak || 0}d
                </p>
              </div>
            </div>

            {user.streaks?.lastActiveDate && (
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/40 dark:border-zinc-800/40 pt-4">
                <Calendar size={14} />
                <span>Last active: {new Date(user.streaks.lastActiveDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Risk Advisory Panel */}
          <div className="glass-card p-6">
            <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 font-sans">
              <ShieldAlert size={18} className="text-brand-500" />
              Risk Advisory Report
            </h3>

            <div className="text-center py-4 bg-zinc-100/30 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-zinc-800/30 rounded-2xl mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">
                Dynamic Risk Score
              </span>
              <p className="text-5xl font-black text-zinc-900 dark:text-white mt-1.5 font-sans">
                {user.riskScore?.score || 0}
                <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">/100</span>
              </p>
              <span className={`inline-block mt-3 text-xs font-bold px-3 py-1.5 rounded-full border ${riskExplanation.color}`}>
                {user.riskScore?.level || 'Low Risk'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${riskExplanation.color} text-xs font-sans`}>
              <p className="font-extrabold mb-1">{riskExplanation.title}</p>
              <p className="leading-relaxed opacity-90">{riskExplanation.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
