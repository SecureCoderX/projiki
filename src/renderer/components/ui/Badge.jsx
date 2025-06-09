import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-colors';
  
  const variants = {
    default: 'bg-bg-tertiary text-text-muted border border-border',
    primary: 'bg-accent/20 text-accent border border-accent/30',
    secondary: 'bg-purple-500/20 text-purple-500 border border-purple-500/30',
    success: 'bg-green-500/20 text-green-500 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-500 border border-red-500/30',
  };
  
  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base',
  };
  
  const classes = `
    ${baseClasses}
    ${variants[variant] || variants.default}
    ${sizes[size] || sizes.default}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;