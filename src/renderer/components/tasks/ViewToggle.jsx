import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui';

const ViewToggle = ({ 
  currentView = 'kanban',
  onViewChange,
  className = '',
  size = 'medium'
}) => {
  const views = [
    {
      id: 'kanban',
      label: 'Kanban',
      description: 'Visual workflow board',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="3"/>
          <rect x="3" y="8" width="7" height="5"/>
          <rect x="3" y="16" width="7" height="5"/>
          <rect x="14" y="3" width="7" height="6"/>
          <rect x="14" y="12" width="7" height="2"/>
          <rect x="14" y="17" width="7" height="4"/>
        </svg>
      )
    },
    {
      id: 'list',
      label: 'List',
      description: 'Traditional task list',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      )
    },
    {
      id: 'timeline',
      label: 'Timeline',
      description: 'Gantt-style timeline',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="2"/>
          <rect x="5" y="8" width="12" height="2"/>
          <rect x="7" y="12" width="8" height="2"/>
          <rect x="9" y="16" width="6" height="2"/>
          <circle cx="3" cy="5" r="1"/>
          <circle cx="5" cy="9" r="1"/>
          <circle cx="7" cy="13" r="1"/>
          <circle cx="9" cy="17" r="1"/>
        </svg>
      )
    },
    {
      id: 'creative',
      label: 'Creative',
      description: 'Freeform workspace',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          <path d="M21 21l-8-8"/>
          <path d="M21 3l-8 8"/>
          <path d="M3 21l8-8"/>
          <path d="M3 3l8 8"/>
        </svg>
      )
    }
  ];

  const buttonSize = size === 'small' ? 'small' : 'medium';
  const iconSize = size === 'small' ? '16' : '20';

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Desktop View - Button Group */}
      <div className="hidden sm:flex items-center bg-bg-secondary border border-border rounded-lg p-1">
        {views.map((view) => (
          <motion.div key={view.id} className="relative">
            <Button
              variant={currentView === view.id ? 'primary' : 'ghost'}
              size={buttonSize}
              onClick={() => onViewChange?.(view.id)}
              className={`relative flex items-center space-x-2 px-3 py-2 transition-all ${
                currentView === view.id 
                  ? 'text-white shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title={view.description}
            >
              <span className="flex-shrink-0">
                {React.cloneElement(view.icon, { 
                  width: iconSize, 
                  height: iconSize 
                })}
              </span>
              <span className="font-medium">{view.label}</span>
            </Button>
            
            {currentView === view.id && (
              <motion.div
                layoutId="activeViewIndicator"
                className="absolute inset-0 bg-accent rounded-md -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Mobile View - Dropdown */}
      <div className="sm:hidden relative group">
        <Button
          variant="secondary"
          size={buttonSize}
          className="flex items-center space-x-2"
        >
          {React.cloneElement(
            views.find(v => v.id === currentView)?.icon || views[0].icon,
            { width: iconSize, height: iconSize }
          )}
          <span className="font-medium">
            {views.find(v => v.id === currentView)?.label || views[0].label}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </Button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
          <div className="py-2">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange?.(view.id)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3 ${
                  currentView === view.id
                    ? 'bg-accent text-white'
                    : 'text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <span className="flex-shrink-0">
                  {React.cloneElement(view.icon, { width: "16", height: "16" })}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{view.label}</div>
                  <div className="text-xs opacity-75">{view.description}</div>
                </div>
                {currentView === view.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Description (Desktop) */}
      {size !== 'small' && (
        <div className="hidden lg:block ml-4 text-sm text-text-muted">
          {views.find(v => v.id === currentView)?.description}
        </div>
      )}
    </div>
  );
};

export default ViewToggle;