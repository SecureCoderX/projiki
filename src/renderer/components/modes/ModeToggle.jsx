// src/renderer/components/modes/ModeToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../../stores/useAppStore';

const ModeToggle = ({ variant = 'default', size = 'default' }) => {
  const currentMode = useAppStore(state => state.currentMode);
  const switchMode = useAppStore(state => state.switchMode);

  const modes = [
    {
      id: 'structured',
      name: 'Structured Dev',
      icon: '🧱',
      shortName: 'Structured',
      color: 'from-blue-500 to-indigo-600',
      description: 'Project-focused development workflow'
    },
    {
      id: 'creative',
      name: 'Vibe Coder',
      icon: '🧠',
      shortName: 'Vibe',
      color: 'from-purple-500 to-pink-600',
      description: 'Creative AI-assisted flow state'
    }
  ];

  const handleModeSwitch = (modeId) => {
    if (modeId !== currentMode) {
      switchMode(modeId);
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  if (variant === 'header') {
    // Compact header version
    return (
      <div className="flex items-center bg-bg-tertiary rounded-lg p-1 border border-border">
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => handleModeSwitch(mode.id)}
            className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              currentMode === mode.id
                ? 'text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentMode === mode.id && (
              <motion.div
                layoutId="header-mode-background"
                className={`absolute inset-0 bg-gradient-to-r ${mode.color} rounded-md`}
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <span className="text-sm">{mode.icon}</span>
              <span className="hidden sm:inline">{mode.shortName}</span>
            </span>
          </motion.button>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    // Card variant for dashboard/settings
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">Workflow Mode</h3>
          <div className="text-xs text-text-muted">
            Current: {modes.find(m => m.id === currentMode)?.name}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              onClick={() => handleModeSwitch(mode.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left group ${
                currentMode === mode.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50 hover:bg-bg-tertiary'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{mode.icon}</span>
                <div>
                  <h4 className={`font-medium ${
                    currentMode === mode.id ? 'text-accent' : 'text-text-primary'
                  }`}>
                    {mode.name}
                  </h4>
                </div>
              </div>
              
              <p className="text-xs text-text-muted leading-relaxed">
                {mode.description}
              </p>
              
              {currentMode === mode.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Default toggle switch variant
  return (
    <div className="flex items-center bg-bg-tertiary rounded-lg p-1 border border-border">
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          onClick={() => handleModeSwitch(mode.id)}
          className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            currentMode === mode.id
              ? 'text-white shadow-lg'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentMode === mode.id && (
            <motion.div
              layoutId="mode-background"
              className={`absolute inset-0 bg-gradient-to-r ${mode.color} rounded-md`}
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <span>{mode.icon}</span>
            <span>{mode.name}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default ModeToggle;