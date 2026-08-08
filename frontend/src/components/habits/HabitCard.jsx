import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleHabit } from '../../redux/slices/habitSlice';
import { showToast } from '../../redux/slices/uiSlice';
import { Flame, Award, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';

const HabitCard = ({ habit, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  // Helper to compile past 7 days dates, ordered from oldest to newest (today)
  const getLast7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      
      days.push({ dateString, dayName, dayNum });
    }
    return days;
  };

  const last7Days = getLast7Days();

  const handleToggle = (date) => {
    dispatch(toggleHabit({ id: habit._id, date }))
      .unwrap()
      .then((res) => {
        const wasCompleted = res.habit.history.find(h => h.date === date)?.completed;
        if (wasCompleted) {
          dispatch(showToast({ message: `Logged "${habit.name}" check-in.`, type: 'success' }));
        } else {
          dispatch(showToast({ message: `Removed check-in for "${habit.name}".`, type: 'info' }));
        }
      })
      .catch((err) => {
        dispatch(showToast({ message: err || 'Check-in failed', type: 'error' }));
      });
  };

  const checkCompleted = (dateStr) => {
    const entry = habit.history.find((entry) => entry.date === dateStr);
    return entry ? entry.completed : false;
  };

  return (
    <div className="glass-card p-5 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-150 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700">
      <div>
        {/* Header Actions */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 mb-2 font-sans">
              {habit.frequency}
            </span>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white leading-tight font-sans tracking-tight">
              {habit.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(habit)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              title="Edit"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(habit._id)}
              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-2 line-clamp-2 leading-normal font-sans">
            {habit.description}
          </p>
        )}
      </div>

      {/* Streaks (Minimal design) */}
      <div className="flex items-center gap-4 my-4 py-2 border-y border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1">
          <Flame size={13} className="text-zinc-800 dark:text-zinc-200" />
          <div className="text-[11px] font-sans">
            <span className="font-bold text-zinc-900 dark:text-white">
              {habit.streak?.current || 0}d
            </span>
            <span className="text-zinc-400 ml-1">current</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Award size={13} className="text-zinc-400" />
          <div className="text-[11px] font-sans">
            <span className="font-bold text-zinc-900 dark:text-white">
              {habit.streak?.longest || 0}d
            </span>
            <span className="text-zinc-400 ml-1">longest</span>
          </div>
        </div>
      </div>

      {/* Interactive 7-Day Grid */}
      <div>
        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2 font-sans">
          Log completions
        </span>
        <div className="grid grid-cols-7 gap-1.5">
          {last7Days.map((day) => {
            const completed = checkCompleted(day.dateString);
            const isToday = day.dateString === new Date().toISOString().split('T')[0];

            return (
              <button
                key={day.dateString}
                onClick={() => handleToggle(day.dateString)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all duration-150
                  ${completed
                    ? 'bg-zinc-950 dark:bg-zinc-50 border-zinc-950 dark:border-zinc-50 text-white dark:text-zinc-950 shadow-sm'
                    : isToday
                      ? 'bg-white dark:bg-zinc-900 border-zinc-900 dark:border-zinc-500 text-zinc-900 dark:text-zinc-100 hover:border-zinc-950'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/80 hover:border-zinc-300 text-zinc-400 dark:text-zinc-500'
                  }
                `}
                title={`${day.dateString}: ${completed ? 'Completed' : 'Pending'}`}
              >
                <span className={`text-[8px] font-bold uppercase select-none leading-none
                  ${completed ? 'text-zinc-200 dark:text-zinc-700' : 'text-zinc-400'}
                `}>
                  {day.dayName.charAt(0)}
                </span>
                <span className="text-[11px] font-bold mt-1 leading-none font-sans">
                  {day.dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
