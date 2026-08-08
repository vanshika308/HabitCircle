import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  required = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-xl transition-all duration-200 text-sm py-3
            ${Icon ? 'pl-11' : 'pl-4'} pr-4
            bg-white/80 dark:bg-zinc-900/80 text-zinc-950 dark:text-zinc-50
            border border-zinc-200 dark:border-zinc-800
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none
            ${error ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
