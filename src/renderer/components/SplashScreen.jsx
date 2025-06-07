import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const loadingStages = [
    'Initializing application...',
    'Loading components...',
    'Setting up workspace...',
    'Preparing interface...',
    'Ready!'
  ];

  useEffect(() => {
    const simulateLoading = async () => {
      try {
        for (let i = 0; i < loadingStages.length; i++) {
          setLoadingStage(i);
          
          // Simulate different loading times for each stage
          const stageDuration = i === loadingStages.length - 1 ? 500 : 800 + Math.random() * 400;
          
          // Animate progress for this stage
          const startProgress = (i / loadingStages.length) * 100;
          const endProgress = ((i + 1) / loadingStages.length) * 100;
          
          await animateProgress(startProgress, endProgress, stageDuration);
          
          // Small delay between stages
          if (i < loadingStages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        // Wait a moment before completing
        await new Promise(resolve => setTimeout(resolve, 500));
        onComplete();
        
      } catch (err) {
        setError(err.message);
      }
    };

    const animateProgress = (start, end, duration) => {
      return new Promise(resolve => {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progressRatio = Math.min(elapsed / duration, 1);
          const currentProgress = start + (end - start) * progressRatio;
          
          setProgress(currentProgress);
          
          if (progressRatio < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        animate();
      });
    };

    simulateLoading();
  }, [onComplete]);

  const handleRetry = () => {
    setError(null);
    setLoadingStage(0);
    setProgress(0);
    // Restart loading process
    window.location.reload();
  };

  if (error) {
    return (
      <div className="h-screen bg-bg-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md p-8 bg-bg-secondary rounded-lg border border-border text-center"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-text-primary">Loading Failed</h2>
          <p className="text-text-secondary mb-6">
            Failed to initialize the application. Please try again.
          </p>
          
          <button
            onClick={handleRetry}
            className="bg-accent hover:bg-accent-hover text-white py-2 px-6 rounded transition-colors"
          >
            Retry
          </button>
          
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-text-muted text-sm hover:text-text-secondary">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-bg-primary rounded text-xs text-red-400 overflow-auto">
              {error}
            </pre>
          </details>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-primary flex items-center justify-center overflow-hidden">
      <div className="text-center">
        {/* App Logo/Icon */}
        <motion.div
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="mb-8"
>
  <img 
    src="/src/assets/logo.png" 
    alt="Projiki Logo" 
    className="w-24 h-24 mx-auto drop-shadow-2xl"
  />
</motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-2"
        >
          <h1 className="text-4xl font-bold text-text-primary">Projiki</h1>
          <p className="text-text-secondary text-lg">Project Manager for Developers</p>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 w-80 mx-auto"
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-blue-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Loading Stage Text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-text-secondary text-sm"
            >
              {loadingStages[loadingStage]}
            </motion.p>
          </AnimatePresence>

          {/* Progress Percentage */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-text-muted text-xs mt-2"
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-accent rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;