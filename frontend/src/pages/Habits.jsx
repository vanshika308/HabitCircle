import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHabits, removeHabit } from '../redux/slices/habitSlice';
import { showToast } from '../redux/slices/uiSlice';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { Plus, CheckSquare, Sparkles } from 'lucide-react';

const Habits = () => {
  const dispatch = useDispatch();
  const { habits, loading, error } = useSelector((state) => state.habits);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  const handleEditClick = (habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setHabitToEdit(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this habit? All streaks and history will be lost.')) {
      dispatch(removeHabit(id))
        .unwrap()
        .then(() => {
          dispatch(showToast({ message: 'Habit deleted successfully.', type: 'success' }));
        })
        .catch((err) => {
          dispatch(showToast({ message: err || 'Failed to delete habit', type: 'error' }));
        });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-sans">
            My Habits
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Build lasting routines, track check-ins, and secure your accountability score
          </p>
        </div>

        <Button
          onClick={handleAddClick}
          variant="primary"
          icon={Plus}
          className="w-full sm:w-auto"
        >
          Create Habit
        </Button>
      </div>

      {/* Habits Content Workspace */}
      {loading && habits.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : habits.length === 0 ? (
        /* Sleek Empty State Card */
        <div className="glass-card p-12 text-center max-w-lg mx-auto border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl mt-12 shadow-xl">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-6">
            <CheckSquare size={32} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight font-sans">
            Start Your Routine
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed font-sans">
            You don't have any active habits yet! Create your first habit today to establish streaks, unlock performance analytics, and begin accountability feedback.
          </p>
          <Button
            onClick={handleAddClick}
            variant="primary"
            icon={Plus}
            className="mt-8 px-6"
          >
            Create First Habit
          </Button>
        </div>
      ) : (
        /* Habits Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Creation and Edit Form Modal Overlay */}
      <HabitForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        habitToEdit={habitToEdit}
      />
    </div>
  );
};

export default Habits;
