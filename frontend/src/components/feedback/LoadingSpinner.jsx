import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className={`relative flex items-center justify-center`}>
      <div className={`animate-spin rounded-full border-zinc-200 dark:border-zinc-800 border-t-brand-500 ${sizeClasses[size]}`} />
      <div className="absolute font-sans text-[10px] font-bold text-brand-500 animate-pulse">⭕</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-zinc-50/70 dark:bg-zinc-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {spinner}
        <p className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider animate-pulse uppercase">
          Syncing Orbit...
        </p>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
