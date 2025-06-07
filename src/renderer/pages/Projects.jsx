import React from 'react';
import { Card, Button } from '../components/ui';

const Projects = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary">Manage your development projects</p>
        </div>
        <Button variant="primary">
          New Project
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">No Projects Yet</h3>
          <p className="text-text-secondary mb-4">Create your first project to get started</p>
          <Button variant="primary">Create Project</Button>
        </div>
      </Card>
    </div>
  );
};

export default Projects;