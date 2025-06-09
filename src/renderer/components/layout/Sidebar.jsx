import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';
import useAppStore from '../../stores/useAppStore';
import { Button } from '../ui';

const Sidebar = () => {
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapse } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const currentMode = useAppStore(state => state.currentMode);

  // Mode-aware navigation items
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9"/>
            <rect x="14" y="3" width="7" height="5"/>
            <rect x="14" y="12" width="7" height="9"/>
            <rect x="3" y="16" width="7" height="5"/>
          </svg>
        ),
        modes: ['structured', 'creative'], // Show in both modes
        priority: 1
      }
    ];

    if (currentMode === 'structured') {
      // Structured Developer Mode - Emphasize project management
      return [
        ...baseItems,
        {
          id: 'projects',
          label: 'Projects',
          path: '/projects',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          ),
          modes: ['structured'],
          priority: 2,
          badge: 'primary'
        },
        {
          id: 'tasks',
          label: 'Tasks',
          path: '/tasks',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          ),
          modes: ['structured'],
          priority: 3,
          badge: 'success'
        },
        {
          id: 'vault',
          label: 'Vault',
          path: '/vault',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          ),
          modes: ['structured'],
          priority: 4
        },
        {
          id: 'notes',
          label: 'Documentation',
          path: '/notes',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          ),
          modes: ['structured'],
          priority: 5
        }
      ];
    } else {
      // Vibe Coder Mode - Emphasize creative tools and AI workflow
      return [
        ...baseItems,
        {
          id: 'vault',
          label: 'AI Vault',
          path: '/vault',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
          ),
          modes: ['creative'],
          priority: 2,
          badge: 'warning'
        },
        {
          id: 'snippets',
          label: 'Code Snippets',
          path: '/snippets',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16,18 22,12 16,6"/>
              <polyline points="8,6 2,12 8,18"/>
            </svg>
          ),
          modes: ['creative'],
          priority: 3,
          badge: 'info'
        },
        {
          id: 'notes',
          label: 'Quick Notes',
          path: '/notes',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18,2 22,6 12,16 8,16 8,12 18,2"/>
            </svg>
          ),
          modes: ['creative'],
          priority: 4,
          badge: 'secondary'
        },
        {
          id: 'projects',
          label: 'Projects',
          path: '/projects',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          ),
          modes: ['creative'],
          priority: 5
        },
        {
          id: 'tasks',
          label: 'Tasks',
          path: '/tasks',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          ),
          modes: ['creative'],
          priority: 6
        }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const secondaryItems = [
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m10.5-4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM21 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
        </svg>
      ),
    },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-cyan-500 text-white';
      case 'secondary':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getModeInfo = () => {
    return currentMode === 'structured' 
      ? {
          name: 'Structured Dev',
          icon: '🧱',
          color: 'text-blue-500',
          description: 'Project-focused workflow'
        }
      : {
          name: 'Vibe Coder',
          icon: '🧠',
          color: 'text-purple-500',
          description: 'Creative AI-assisted flow'
        };
  };

  const modeInfo = getModeInfo();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0, width: sidebarCollapsed ? 64 : 280 }}
          exit={{ x: -280 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed left-0 top-12 h-[calc(100vh-3rem)] bg-bg-secondary border-r border-border flex flex-col z-40"
        >
          {/* Sidebar Header with Mode Indicator */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{modeInfo.icon}</span>
                      <h2 className={`font-semibold ${modeInfo.color}`}>
                        {modeInfo.name}
                      </h2>
                    </div>
                    <p className="text-xs text-text-muted">
                      {modeInfo.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                variant="ghost"
                size="small"
                onClick={toggleSidebarCollapse}
                className="p-1.5 flex-shrink-0"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <polyline points="15,18 9,12 15,6"/>
                </motion.svg>
              </Button>
            </div>

            {/* Mode Indicator when collapsed */}
            {sidebarCollapsed && (
              <div className="flex justify-center">
                <div className={`text-lg ${modeInfo.color}`} title={modeInfo.name}>
                  {modeInfo.icon}
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                      isActive(item.path)
                        ? 'bg-accent text-white shadow-md'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                    }`}
                    whileHover={{ x: 2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between flex-1"
                        >
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${getBadgeColor(item.badge)}`}>
                              •
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </nav>

          {/* Mode-specific Quick Actions */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 border-t border-border bg-bg-tertiary/50"
            >
              <p className="text-xs font-medium text-text-muted mb-2">Quick Actions</p>
              <div className="space-y-1">
                {currentMode === 'structured' ? (
                  <>
                    <button className="w-full text-left text-xs text-text-secondary hover:text-accent px-2 py-1 rounded transition-colors">
                      📁 New Project
                    </button>
                    <button className="w-full text-left text-xs text-text-secondary hover:text-accent px-2 py-1 rounded transition-colors">
                      ✓ Create Task
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full text-left text-xs text-text-secondary hover:text-accent px-2 py-1 rounded transition-colors">
                      ⚡ Quick Capture
                    </button>
                    <button className="w-full text-left text-xs text-text-secondary hover:text-accent px-2 py-1 rounded transition-colors">
                      🤖 New Prompt
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Secondary Navigation */}
          <div className="border-t border-border p-2 space-y-1">
            {secondaryItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive(item.path)
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;