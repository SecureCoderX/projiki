import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutProvider } from './contexts/LayoutContext';
import TitleBar from './components/TitleBar';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import MainLayout from './components/layout/MainLayout';

// Import pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Vault from './pages/Vault';
import Snippets from './pages/Snippets';
import Notes from './pages/Notes';
import Settings from './pages/Settings';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Main app content with routing
  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden">
      <TitleBar />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
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
          <Router>
            <AppContent />
          </Router>
        </LayoutProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;