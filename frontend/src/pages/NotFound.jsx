import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="glass-card p-10 text-center max-w-md shadow-xl border border-zinc-200/40 dark:border-zinc-800/40 rounded-3xl">
        <span className="text-6xl select-none leading-none">🛰️</span>
        <h1 className="text-4xl font-black text-zinc-950 dark:text-white tracking-tight mt-6 font-sans">
          404 - Lost Orbit
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed font-sans">
          The requested circle page could not be located in our Habit accountability network. Let's redirect you home.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          className="mt-8 px-6"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
