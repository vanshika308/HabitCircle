import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { Menu, LogOut, ShieldAlert, Award } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High Risk':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
      case 'Medium Risk':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
      default:
        return 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass-nav z-40 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Branding Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 shadow-md">
            <span className="text-lg font-black leading-none select-none">⭕</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            HabitCircle
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {/* Streak Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs font-bold font-sans">
            <Award size={14} className="animate-pulse" />
            <span>{user.streaks?.currentStreak || 0}d Streak</span>
          </div>

          {/* Risk Level Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold font-sans ${getRiskColor(user.riskScore?.level)}`}>
            <ShieldAlert size={14} />
            <span>{user.riskScore?.level || 'Low Risk'}</span>
          </div>

          {/* User Profile Summary */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 pl-3 border-l border-zinc-200 dark:border-zinc-800 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-all">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {user.name}
              </p>
            </div>
          </div>

          {/* Logout Shortcut */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 ml-1 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50/5 transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
