import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import useProjectStore from '../stores/useProjectStore';
import useAppStore from '../stores/useAppStore';
import ProjectGrid from '../components/projects/ProjectGrid';
import ProjectForm from '../components/projects/ProjectForm';
import ProjectFilters from '../components/projects/ProjectFilters';

const Projects = () => {
  const navigate = useNavigate();
  
  const {
    projects,
    loadingProjects,
    projectsError,
    templates,
    deleteProject,
    updateProject,
    duplicateProject,
    archiveProject,
    unarchiveProject,
    setCurrentProject,
    loadProjects
  } = useProjectStore();

  const { addNotification } = useAppStore();

  // Modal states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    mode: 'all',
    priority: 'all',
    search: '',
    tags: [],
    sortBy: 'updatedAt-desc'
  });

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Filter by mode
    if (filters.mode !== 'all') {
      filtered = filtered.filter(project => project.mode === filters.mode);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(project => 
        project.metadata?.priority === filters.priority
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        )
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(project =>
        filters.tags.every(tag =>
          project.metadata?.tags?.includes(tag)
        )
      );
    }

    // Sort projects
    const [sortField, sortDirection] = filters.sortBy.split('-');
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
        case 'updatedAt':
          aValue = new Date(a[sortField]);
          bValue = new Date(b[sortField]);
          break;
        case 'deadline':
          aValue = a.metadata?.deadline ? new Date(a.metadata.deadline) : new Date('2099-12-31');
          bValue = b.metadata?.deadline ? new Date(b.metadata.deadline) : new Date('2099-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.metadata?.priority] || 0;
          bValue = priorityOrder[b.metadata?.priority] || 0;
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (sortDirection === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [projects, filters]);

  // Handle project actions
  const handleCreateProject = (templateId = null) => {
    if (templateId === 'template') {
      setShowTemplateSelector(true);
    } else {
      setSelectedTemplate(templateId);
      setEditingProject(null);
      setShowProjectForm(true);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setSelectedTemplate(null);
    setShowProjectForm(true);
  };

  const handleDeleteProject = (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      deleteProject(project.id);
    }
  };

  const handleDuplicateProject = (project) => {
    duplicateProject(project.id);
  };

  const handleArchiveProject = (project) => {
    if (project.status === 'archived') {
      unarchiveProject(project.id);
    } else {
      archiveProject(project.id);
    }
  };

  const handleSelectProject = (project) => {
    setCurrentProject(project);
    
    // Show notification that project has been selected
    addNotification({
      type: 'success',
      title: 'Project Selected',
      message: `"${project.name}" is now active. Navigate to Tasks to manage project tasks.`
    });
    
    // Navigate to tasks page after a brief delay to show the notification
    setTimeout(() => {
      navigate('/tasks');
    }, 1000);
    
    console.log('Selected project:', project.name);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    setSelectedTemplate(null);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      mode: 'all',
      priority: 'all',
      search: '',
      tags: [],
      sortBy: 'updatedAt-desc'
    });
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setShowTemplateSelector(false);
    setShowProjectForm(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6"
      >
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1">
            Manage your development projects with structured and creative workflows
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Create Project Dropdown */}
          <div className="relative group">
            <Button variant="primary" onClick={() => handleCreateProject()}>
              New Project
            </Button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-bg-secondary border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-2">
                <button
                  onClick={() => handleCreateProject()}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  <div className="font-medium">Blank Project</div>
                  <div className="text-xs text-text-muted">Start from scratch</div>
                </button>
                
                <div className="border-t border-border my-1"></div>
                <div className="px-4 py-1 text-xs font-medium text-text-muted uppercase tracking-wide">
                  Templates
                </div>
                
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleCreateProject(template.id)}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-text-muted">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Search */}
      <div className="sm:hidden mb-4">
        <div className="text-sm text-text-muted text-center">
          Use the search bar above to find projects
        </div>
      </div>

      {/* Error State */}
      {projectsError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 mr-3">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div>
              <h3 className="font-medium text-red-800">Error Loading Projects</h3>
              <p className="text-sm text-red-600 mt-1">{projectsError}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ProjectFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          projectsCount={filteredAndSortedProjects.length}
        />
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProjectGrid
          projects={filteredAndSortedProjects}
          loading={loadingProjects}
          onProjectEdit={handleEditProject}
          onProjectDelete={handleDeleteProject}
          onProjectDuplicate={handleDuplicateProject}
          onProjectArchive={handleArchiveProject}
          onProjectSelect={handleSelectProject}
          onCreateProject={handleCreateProject}
        />
      </motion.div>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={handleCloseForm}
        project={editingProject}
        templateId={selectedTemplate}
      />

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary border border-border rounded-lg p-6 max-w-2xl mx-4"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Choose a Template
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="p-4 border border-border rounded-lg hover:bg-bg-tertiary transition-colors text-left"
                >
                  <h3 className="font-medium text-text-primary mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-text-muted mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-accent text-white rounded">
                      {template.defaultMode}
                    </span>
                    <span className="text-xs text-text-muted">
                      {template.defaultTasks?.length || 0} default tasks
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowTemplateSelector(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowTemplateSelector(false);
                  handleCreateProject();
                }}
              >
                Start Blank Instead
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;