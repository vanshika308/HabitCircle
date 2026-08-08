import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearToast } from '../../redux/slices/uiSlice';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-brand-500" size={20} />,
  };

  const borderColors = {
    success: 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
    error: 'border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200',
    info: 'border-brand-500/30 bg-teal-50/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-lg ${borderColors[toast.type]} min-w-[280px] max-w-sm transition-all duration-300`}>
        <div className="flex-shrink-0">{icons[toast.type]}</div>
        <div className="flex-grow text-sm font-semibold pr-2 font-sans">{toast.message}</div>
        <button
          onClick={() => dispatch(clearToast())}
          className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
