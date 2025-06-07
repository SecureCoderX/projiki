import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Load saved layout preferences
    const savedSidebarOpen = localStorage.getItem('projiki-sidebar-open');
    const savedSidebarCollapsed = localStorage.getItem('projiki-sidebar-collapsed');
    
    if (savedSidebarOpen !== null) {
      setSidebarOpen(JSON.parse(savedSidebarOpen));
    }
    if (savedSidebarCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedSidebarCollapsed));
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newValue = !prev;
      localStorage.setItem('projiki-sidebar-open', JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('projiki-sidebar-collapsed', JSON.stringify(newValue));
      return newValue;
    });
  };

  const value = {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    toggleSidebarCollapse,
    setSidebarOpen,
    setSidebarCollapsed,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};