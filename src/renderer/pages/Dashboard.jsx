import React from 'react';
import { Card, Button, Badge } from '../components/ui';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-text-primary">12</p>
            </div>
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Active Tasks</p>
              <p className="text-2xl font-bold text-text-primary">47</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                <polyline points="9,11 12,14 22,4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Code Snippets</p>
              <p className="text-2xl font-bold text-text-primary">156</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
                <polyline points="16,18 22,12 16,6"/>
                <polyline points="8,6 2,12 8,18"/>
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Prompts Saved</p>
              <p className="text-2xl font-bold text-text-primary">89</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text-primary">
            🎉 Phase 1 Complete!
          </h3>
          <p className="text-text-secondary mb-4">
            Foundation and core architecture successfully implemented with professional navigation and layout system.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Project Setup</span>
              <Badge variant="success">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Window & Lifecycle</span>
              <Badge variant="success">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Splash & Loading</span>
              <Badge variant="success">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Design System</span>
              <Badge variant="success">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Navigation & Layout</span>
              <Badge variant="success">Complete</Badge>
            </div>
          </div>
          <Button variant="primary" className="w-full">
            Ready for Phase 2: Data Architecture
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text-primary">
            🚀 What's Working
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Responsive sidebar with collapse/expand</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Dynamic breadcrumb navigation</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Theme switching (dark/light modes)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Professional component library</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Smooth animations and transitions</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Cross-platform window management</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;