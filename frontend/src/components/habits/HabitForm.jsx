import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addHabit, editHabit } from '../../redux/slices/habitSlice';
import { showToast } from '../../redux/slices/uiSlice';
import Input from '../common/Input';
import Button from '../common/Button';
import { X, CheckCircle } from 'lucide-react';

const HabitForm = ({ isOpen, onClose, habitToEdit }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setFormData({
        name: habitToEdit.name || '',
        description: habitToEdit.description || '',
        frequency: habitToEdit.frequency || 'daily',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        frequency: 'daily',
      });
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      dispatch(showToast({ message: 'Habit name is required', type: 'error' }));
      return;
    }

    setLoading(true);

    if (habitToEdit) {
      // Edit mode
      dispatch(editHabit({ id: habitToEdit._id, habitData: formData }))
        .unwrap()
        .then(() => {
          dispatch(showToast({ message: 'Habit updated successfully!', type: 'success' }));
          setLoading(false);
          onClose();
        })
        .catch((err) => {
          dispatch(showToast({ message: err || 'Failed to update habit', type: 'error' }));
          setLoading(false);
        });
    } else {
      // Add mode
      dispatch(addHabit(formData))
        .unwrap()
        .then(() => {
          dispatch(showToast({ message: 'Habit created successfully! Time to check-in ⭕', type: 'success' }));
          setLoading(false);
          onClose();
        })
        .catch((err) => {
          dispatch(showToast({ message: err || 'Failed to create habit', type: 'error' }));
          setLoading(false);
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md glass-card p-6 md:p-8 rounded-3xl shadow-2xl relative border border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Form Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white font-sans tracking-tight">
            {habitToEdit ? 'Edit Habit Details' : 'Create New Habit'}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {habitToEdit ? 'Refine your parameters and save changes.' : 'Define your new routine to begin streak calculations.'}
          </p>
        </div>

        {/* Input Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Habit Name"
            type="text"
            name="name"
            placeholder="e.g. Read 15 Pages, Morning Run"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
              Description (Optional)
            </label>
            <textarea
              name="description"
              placeholder="e.g. Daily reading inside a non-fiction book to learn product development"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="block w-full rounded-xl transition-all duration-200 text-sm py-3 px-4
                bg-white/80 dark:bg-zinc-900/80 text-zinc-950 dark:text-zinc-50
                border border-zinc-200 dark:border-zinc-800
                focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
              Completion Frequency
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, frequency: 'daily' })}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200
                  ${formData.frequency === 'daily'
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-500/10'
                    : 'bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/40 dark:border-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }
                `}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, frequency: 'weekly' })}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200
                  ${formData.frequency === 'weekly'
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-500/10'
                    : 'bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/40 dark:border-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }
                `}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-zinc-200/40 dark:border-zinc-800/40 mt-6">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              {habitToEdit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;
