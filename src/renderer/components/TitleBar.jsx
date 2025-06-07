import React, { useState, useEffect } from 'react';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [appInfo, setAppInfo] = useState({});

  useEffect(() => {
    // Get initial window state
    const getInitialState = async () => {
      try {
        const state = await window.electronAPI?.getWindowState();
        const info = await window.electronAPI?.getAppInfo();
        
        if (state) {
          setIsMaximized(state.isMaximized);
          setIsFocused(state.isFocused);
        }
        
        if (info) {
          setAppInfo(info);
        }
      } catch (error) {
        console.error('Failed to get initial state:', error);
      }
    };

    getInitialState();

    // Listen for window state changes
    const removeStateListener = window.electronAPI?.onWindowStateChanged((event, data) => {
      setIsMaximized(data.isMaximized);
    });

    const removeFocusListener = window.electronAPI?.onWindowFocusChanged((event, data) => {
      setIsFocused(data.focused);
    });

    // Cleanup listeners
    return () => {
      removeStateListener?.();
      removeFocusListener?.();
    };
  }, []);

  const handleMinimize = async () => {
    try {
      await window.electronAPI?.minimizeWindow();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      const result = await window.electronAPI?.maximizeWindow();
      if (result) {
        setIsMaximized(result.maximized);
      }
    } catch (error) {
      console.error('Failed to maximize/restore window:', error);
    }
  };

  const handleClose = async () => {
    try {
      await window.electronAPI?.closeWindow();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  // Platform-specific styles
  const isMac = window.electronAPI?.isMac;

  return (
    <div className={`bg-bg-secondary border-b border-border h-12 flex items-center justify-between px-4 select-none relative z-50 ${
      !isFocused ? 'opacity-75' : ''
    }`}>
      {/* Left side - App icon and title */}
      <div className="flex items-center space-x-3">
        {/* App icon */}
        <img 
          src="/src/assets/logo.png" 
          alt="Projiki" 
          className="w-6 h-6 rounded-sm"
        />
        
        {/* App title and version - draggable area */}
        <div className="drag-region flex items-center space-x-2">
          <span className="text-text-primary font-medium">Projiki</span>
          {appInfo.version && (
            <span className="text-text-muted text-xs">v{appInfo.version}</span>
          )}
        </div>
      </div>

      {/* Center - Draggable area */}
      <div className="flex-1 drag-region h-full"></div>
      
      {/* Right side - Window controls */}
      <div className="flex items-center">
        {/* Platform-specific window controls */}
        {!isMac && (
          <div className="flex items-center space-x-1">
            {/* Minimize button */}
            <button
              onClick={handleMinimize}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors rounded"
              aria-label="Minimize"
              title="Minimize"
            >
              <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
                <rect width="10" height="1" />
              </svg>
            </button>

            {/* Maximize/Restore button */}
            <button
              onClick={handleMaximize}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors rounded"
              aria-label={isMaximized ? "Restore" : "Maximize"}
              title={isMaximized ? "Restore Down" : "Maximize"}
            >
              {isMaximized ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="2" y="2" width="6" height="6" />
                  <rect x="0" y="0" width="6" height="6" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect width="10" height="10" />
                </svg>
              )}
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-red-600 hover:text-white transition-colors rounded"
              aria-label="Close"
              title="Close"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M1 1l8 8M9 1l-8 8" />
              </svg>
            </button>
          </div>
        )}

        {/* macOS traffic lights will be handled by the system */}
      </div>
    </div>
  );
};

export default TitleBar;