import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from './Loading';

const LoadingOverlay = ({ 
  isVisible, 
  text = 'Loading...', 
  variant = 'spinner',
  blur = true 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            blur ? 'backdrop-blur-sm' : ''
          }`}
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.8)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-bg-secondary border border-border rounded-lg p-8 shadow-2xl"
          >
            <Loading size="large" text={text} variant={variant} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;