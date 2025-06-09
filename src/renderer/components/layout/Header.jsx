import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, ThemeToggle } from '../ui';
import ModeToggle from '../modes/ModeToggle';
import Breadcrumb from './Breadcrumb';
import useAppStore from '../../stores/useAppStore';

const Header = ({ title, actions = null, breadcrumbItems = null }) => {
  const { sidebarOpen, toggleSidebar } = useLayout();
  const { isDark } = useTheme();
  const currentMode = useAppStore(state => state.currentMode);

  const getModeIndicator = () => {
    const modeConfig = {
      structured: {
        icon: '🧱',
        name: 'Structured Dev',
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      },
      creative: {
        icon: '🧠',
        name: 'Vibe Coder',
        color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      }
    };

    const config = modeConfig[currentMode] || modeConfig.structured;

    return (
      <div className={`px-2 py-1 rounded-md border text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        <span className="hidden sm:inline">{config.name}</span>
      </div>
    );
  };

  return (
    <header className="bg-bg-secondary border-b border-border px-6 py-4 flex items-center justify-between relative z-50">
      {/* Left side - Menu toggle, mode indicator, breadcrumbs, title */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="small"
          onClick={toggleSidebar}
          className="p-2"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </Button>

        {/* Mode Indicator */}
        {getModeIndicator()}

        <div className="flex items-center space-x-4">
          <Breadcrumb customItems={breadcrumbItems} />
          {title && (
            <div className="border-l border-border pl-4">
              <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Mode toggle, actions, and theme toggle */}
      <div className="flex items-center space-x-3">
        {/* Mode Toggle - compact header version */}
        <ModeToggle variant="header" />
        
        {actions}
        
        <div className="border-l border-border pl-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;