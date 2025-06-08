import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, ThemeToggle } from '../ui';
import SearchBar from '../common/SearchBar';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';

const MainLayout = ({ 
  children, 
  headerTitle = null, 
  headerActions = null, 
  breadcrumbItems = null 
}) => {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar } = useLayout();
  const { isDark } = useTheme();

  const getMainContentMargin = () => {
    if (!sidebarOpen) return 'ml-0';
    return sidebarCollapsed ? 'ml-16' : 'ml-70';
  };

  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-bg-secondary border-b border-border px-6 py-4 flex items-center justify-between relative z-20">
        {/* Left side - Menu toggle and breadcrumbs */}
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
            {headerTitle && (
              <div className="border-l border-border pl-4">
                <h1 className="text-lg font-semibold text-text-primary">{headerTitle}</h1>
              </div>
            )}
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <SearchBar placeholder="Search projects, tasks, notes..." />
        </div>

        {/* Right side - Actions and theme toggle */}
        <div className="flex items-center space-x-3">
          {headerActions}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className={`flex-1 overflow-auto transition-all duration-300 ${getMainContentMargin()}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;