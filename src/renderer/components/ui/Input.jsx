import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helper,
  type = 'text',
  size = 'medium',
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-bg-secondary text-text-primary placeholder-text-muted';
  
  const errorClasses = error 
    ? 'border-red-500 focus:ring-red-500' 
    : 'border-border hover:border-text-muted';

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  };

  const classes = `${baseClasses} ${errorClasses} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={classes}
        {...props}
      />
      {helper && !error && (
        <p className="text-xs text-text-muted">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;