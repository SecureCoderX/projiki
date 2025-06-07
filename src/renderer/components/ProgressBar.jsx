import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  progress = 0, 
  variant = 'default',
  size = 'medium',
  showPercent = false,
  animated = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
  };

  const variantClasses = {
    default: 'bg-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-accent to-blue-500',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-bg-tertiary rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <motion.div
          className={`h-full ${variantClasses[variant]} rounded-full`}
          initial={{ width: animated ? '0%' : `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: "easeOut" }}
        />
      </div>
      
      {showPercent && (
        <div className="mt-2 text-right">
          <span className="text-text-muted text-xs">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;