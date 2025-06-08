import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, ThemeToggle } from '../ui';
import Breadcrumb from './Breadcrumb';

const Header = ({ title, actions = null, breadcrumbItems = null }) => {
  const { sidebarOpen, toggleSidebar } = useLayout();
  const { isDark } = useTheme();

  return (
    <header className="bg-bg-secondary border-b border-border px-6 py-4 flex items-center justify-between relative z-50">
      {/* Left side - Menu toggle, breadcrumbs, title */}
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

        <div className="flex items-center space-x-4">
          <Breadcrumb customItems={breadcrumbItems} />
          {title && (
            <div className="border-l border-border pl-4">
              <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Actions and theme toggle */}
      <div className="flex items-center space-x-3">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;