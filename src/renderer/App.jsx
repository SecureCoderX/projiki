import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutProvider } from './contexts/LayoutContext';
import StoreProvider from './components/StoreProvider';
import TitleBar from './components/TitleBar';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import MainLayout from './components/layout/MainLayout';
import { useAutoSave } from './hooks/useAutoSave';
import { useAppStore } from './stores';

// Import pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Vault from './pages/Vault';
import Snippets from './pages/Snippets';
import Notes from './pages/Notes';
import Settings from './pages/Settings';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get loading state from store (with fallback for placeholder stores)
  const storeLoading = useAppStore(state => state?.isLoading) || false;
  const currentProject = useAppStore(state => state?.currentProject) || null;
  
  // Enable auto-save for the entire application
  const autoSave = useAutoSave({
    enabled: !!currentProject,
    debounceDelay: 1000,      // 1 second debounce
    autoSaveInterval: 30000,  // Auto-save every 30 seconds
    onSaveSuccess: (data) => {
      console.log('✅ Auto-save successful:', data?.project?.name || 'Unknown project')
    },
    onSaveError: (error) => {
      console.error('❌ Auto-save failed:', error?.message || 'Unknown error')
    }
  });

  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  // Show splash screen while loading OR while stores are initializing
  if (isLoading || storeLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Main app content with routing
  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden">
      <TitleBar />
      
      <MainLayout>
        {/* Auto-save status indicator */}
        {autoSave.isSaving && (
          <div className="fixed top-16 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded-md text-sm shadow-lg animate-pulse">
            💾 Saving...
          </div>
        )}
        
        {/* Save error notification */}
        {autoSave.saveError && (
          <div className="fixed top-16 right-4 z-50 bg-red-500 text-white px-3 py-1 rounded-md text-sm shadow-lg">
            ❌ Save failed: {autoSave.saveError}
          </div>
        )}
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/snippets" element={<Snippets />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LayoutProvider>
          <StoreProvider>
            <Router>
              <AppContent />
            </Router>
          </StoreProvider>
        </LayoutProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;