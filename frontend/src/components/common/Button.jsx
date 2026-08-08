import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon: Icon,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-sm shadow-brand-500/10',
    secondary: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:ring-brand-500',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500 shadow-sm shadow-rose-500/10',
    accent: 'bg-accent-violet hover:bg-violet-600 text-white focus:ring-accent-violet shadow-sm shadow-violet-500/10',
  };

  const sizes = {
    sm: 'py-2 px-3.5 text-xs',
    md: 'py-3 px-5 text-sm',
    lg: 'py-3.5 px-6 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="mr-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      ) : Icon ? (
        <Icon className="mr-2" size={size === 'sm' ? 14 : 18} />
      ) : null}
      {loading ? 'Processing...' : children}
    </button>
  );
};

export default Button;
