import React, { useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui';
import useProjectStore from '../stores/useProjectStore';

const Dashboard = () => {
  // Get projects array and compute stats safely
  const projects = useProjectStore(state => state.projects)
  
  // Use useMemo to prevent infinite re-renders
  const projectStats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      archived: projects.filter(p => p.status === 'archived').length,
      paused: projects.filter(p => p.status === 'paused').length,
    }
  }, [projects])
  
  const recentProjects = useMemo(() => {
    return projects
      .filter(p => p.status === 'active')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3)
  }, [projects])
  
  // Mock task data for now (will be real when task store is implemented)
  const mockTaskStats = useMemo(() => ({
    total: projects.length * 8, // Estimate 8 tasks per project
    active: projects.length * 3,
    completed: projects.length * 5,
  }), [projects.length])

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-text-primary">{projectStats.total}</p>
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
              <p className="text-text-muted text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-text-primary">{projectStats.active}</p>
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
              <p className="text-text-muted text-sm">Completed Projects</p>
              <p className="text-2xl font-bold text-text-primary">{projectStats.completed}</p>
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
              <p className="text-text-muted text-sm">Archived Projects</p>
              <p className="text-2xl font-bold text-text-primary">{projectStats.archived}</p>
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
            📊 Project Overview
          </h3>
          
          {projects.length > 0 ? (
            <>
              <p className="text-text-secondary mb-4">
                You have {projectStats.total} projects in your workspace. 
                {projectStats.active > 0 && ` ${projectStats.active} are currently active.`}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Active Projects</span>
                  <Badge variant="success">{projectStats.active}</Badge>
                </div>
                {projectStats.paused > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Paused Projects</span>
                    <Badge variant="warning">{projectStats.paused}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Completed Projects</span>
                  <Badge variant="primary">{projectStats.completed}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Archived Projects</span>
                  <Badge variant="default">{projectStats.archived}</Badge>
                </div>
              </div>
              
              {recentProjects.length > 0 && (
                <>
                  <h4 className="font-medium text-text-primary mb-2">Recent Projects</h4>
                  <div className="space-y-2 mb-4">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-2 bg-bg-tertiary rounded">
                        <div>
                          <div className="font-medium text-text-primary text-sm">{project.name}</div>
                          <div className="text-xs text-text-muted">{project.mode} • {project.status}</div>
                        </div>
                        <Badge variant={project.status === 'active' ? 'success' : 'default'} size="small">
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-text-secondary mb-4">
              No projects yet. Create your first project to get started with Projiki!
            </p>
          )}
          
          <Button variant="primary" className="w-full">
            {projects.length > 0 ? 'View All Projects' : 'Create Your First Project'}
          </Button>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-text-primary">
            🎉 Phase 3 Step 3.1 Complete!
          </h3>
          <p className="text-text-secondary mb-4">
            Project Management UI successfully implemented with full CRUD operations, 
            template system, and data persistence.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Foundation & Architecture</span>
              <Badge variant="success">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Data Architecture</span>
              <Badge variant="success">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Project Management UI</span>
              <Badge variant="success">Complete</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Task Management Interface</span>
              <Badge variant="warning">Next</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Mode Switching</span>
              <Badge variant="default">Planned</Badge>
            </div>
          </div>
          <Button variant="primary" className="w-full">
            Ready for Phase 3 Step 3.2: Task Management
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;