import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ 
  children, 
  headerTitle = null, 
  headerActions = null, 
  breadcrumbItems = null 
}) => {
  const { sidebarOpen, sidebarCollapsed } = useLayout();

  const getMainContentMargin = () => {
    if (!sidebarOpen) return 'ml-0';
    return sidebarCollapsed ? 'ml-16' : 'ml-70';
  };

  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden">
      <Sidebar />
      
      <div className={`flex flex-col flex-1 transition-all duration-300 ${getMainContentMargin()}`}>
        <Header 
          title={headerTitle}
          actions={headerActions}
          breadcrumbItems={breadcrumbItems}
        />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;