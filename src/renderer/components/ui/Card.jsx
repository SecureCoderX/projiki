import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  hover = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-200';

  const variants = {
    default: 'bg-bg-secondary border-border',
    elevated: 'bg-bg-secondary border-border shadow-lg',
    outline: 'bg-transparent border-border',
    ghost: 'bg-bg-tertiary border-transparent',
  };

  const paddings = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const hoverClasses = hover ? 'hover:shadow-md hover:border-text-muted cursor-pointer' : '';

  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`;

  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent
      className={classes}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
