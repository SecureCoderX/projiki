// Complete ProjectWorkspace.jsx with all fixes
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Store imports
import useProjectStore from '../../stores/useProjectStore';
import useTaskStore from '../../stores/useTaskStore';
import useNotesStore from '../../stores/useNotesStore';
import usePromptStore from '../../stores/usePromptStore';
import useSnippetStore from '../../stores/useSnippetStore';

// Component imports
import { Button, Card, Input } from '../ui';
import { TaskCard, KanbanBoard } from '../tasks';
import { NoteCard } from '../notes';
import { PromptCard } from '../prompts';
import { SnippetCard } from '../snippets';
import Loading from '../Loading';

// Form imports for creating new items
import TaskForm from '../tasks/TaskForm';
import NoteForm from '../notes/NoteForm';
import PromptForm from '../prompts/PromptForm';
import SnippetForm from '../snippets/SnippetForm';
import ProjectForm from '../projects/ProjectForm';

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Store hooks with subscriptions
  const projects = useProjectStore(state => state.projects);
  const tasks = useTaskStore(state => state.tasks);
  const loadTasks = useTaskStore(state => state.loadTasks);
  const notes = useNotesStore(state => state.notes);
  const loadNotes = useNotesStore(state => state.loadNotes);
  const prompts = usePromptStore(state => state.prompts);
  const snippets = useSnippetStore(state => state.snippets);
  
  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [editingNote, setEditingNote] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
const [editingSnippet, setEditingSnippet] = useState(null);
  
  // Modal states for creating new items
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [showSnippetForm, setShowSnippetForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  
  // Get project data
  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);
  
  // Real-time data subscriptions with search filtering
  const projectTasks = useMemo(() => {
    let filtered = tasks.filter(task => task.projectId === projectId);
    
    if (projectSearchTerm && activeTab === 'tasks') {
      const searchLower = projectSearchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.content.toLowerCase().includes(searchLower) ||
        task.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [tasks, projectId, projectSearchTerm, activeTab, lastUpdate]);
  
  const projectNotes = useMemo(() => {
    let filtered = notes.filter(note => note.projectId === projectId);
    
    if (projectSearchTerm && activeTab === 'notes') {
      const searchLower = projectSearchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [notes, projectId, projectSearchTerm, activeTab, lastUpdate]);
  
  const projectPrompts = useMemo(() => {
    let filtered = [];
    
    if (project) {
      filtered = prompts.filter(prompt => 
        prompt.tags?.includes(project.name) || 
        prompt.tags?.includes(projectId) ||
        prompt.projectId === projectId
      );
    }
    
    if (projectSearchTerm && activeTab === 'prompts') {
      const searchLower = projectSearchTerm.toLowerCase();
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(searchLower) ||
        prompt.content.toLowerCase().includes(searchLower) ||
        prompt.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [prompts, project, projectId, projectSearchTerm, activeTab, lastUpdate]);
  
  const projectSnippets = useMemo(() => {
    let filtered = [];
    
    if (project) {
      filtered = snippets.filter(snippet => 
        snippet.tags?.includes(project.name) || 
        snippet.tags?.includes(projectId) ||
        snippet.projectId === projectId
      );
    }
    
    if (projectSearchTerm && activeTab === 'snippets') {
      const searchLower = projectSearchTerm.toLowerCase();
      filtered = filtered.filter(snippet => 
        snippet.title.toLowerCase().includes(searchLower) ||
        snippet.code.toLowerCase().includes(searchLower) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [snippets, project, projectId, projectSearchTerm, activeTab, lastUpdate]);
  
  // Real-time statistics calculation
  const projectStats = useMemo(() => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      progressPercentage,
      totalNotes: projectNotes.length,
      totalPrompts: projectPrompts.length,
      totalSnippets: projectSnippets.length
    };
  }, [projectTasks, projectNotes, projectPrompts, projectSnippets, lastUpdate]);
  
  // Handler functions for creating new items
  const handleCreateTask = () => {
    setShowTaskForm(true);
  };
  
  const handleCreateNote = () => {
  setEditingNote(null); // Clear any existing editing note
  setShowNoteForm(true);
};
  
  const handleCreatePrompt = () => {
  setEditingPrompt(null); // Clear any existing editing prompt
  setShowPromptForm(true);
};
  
  const handleCreateSnippet = () => {
  setEditingSnippet(null); // Clear any existing editing snippet
  setShowSnippetForm(true);
};
  
  const handleEditProject = () => {
    setShowProjectForm(true);
  };
  
  // Success handlers for form submissions
  const handleTaskSuccess = () => {
    setShowTaskForm(false);
    setLastUpdate(Date.now()); // Force refresh
  };
  
  const handleNoteSuccess = () => {
    setShowNoteForm(false);
    setLastUpdate(Date.now());
  };
  
  const handlePromptSuccess = () => {
  setShowPromptForm(false);
  setEditingPrompt(null);
  
  // Force refresh prompts from store
  usePromptStore.getState().loadPrompts();
  
  setLastUpdate(Date.now());
};
  
  const handleSnippetSuccess = () => {
  setShowSnippetForm(false);
  setEditingSnippet(null);
  
  // Force refresh snippets from store
  useSnippetStore.getState().loadSnippets();
  
  setLastUpdate(Date.now());
};
  
  const handleProjectSuccess = () => {
    setShowProjectForm(false);
    setLastUpdate(Date.now());
  };
  
  // Tab configuration with inline SVG icons
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v5h5"/>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.04.74 5.57 1.97"/>
        </svg>
      ),
      count: null 
    },
    { 
      id: 'tasks', 
      label: 'Tasks', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.02 1.17.06"/>
        </svg>
      ),
      count: projectStats.totalTasks 
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      count: projectStats.totalNotes 
    },
    { 
      id: 'prompts', 
      label: 'Prompts', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
        </svg>
      ),
      count: projectStats.totalPrompts 
    },
    { 
      id: 'snippets', 
      label: 'Snippets', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16,18 22,12 16,6"/>
          <polyline points="8,6 2,12 8,18"/>
        </svg>
      ),
      count: projectStats.totalSnippets 
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      ),
      count: null 
    }
  ];
  
  // Handle loading and automatic data refresh
  useEffect(() => {
    if (project || (!project && projects.length > 0)) {
      setLoading(false);
    }
  }, [project, projects]);

  // Auto-refresh data when entering project workspace
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const refreshData = async () => {
        try {
          // Load fresh data for this project
          if (loadTasks) {
            await loadTasks(projectId);
          }
          if (loadNotes) {
            await loadNotes();
          }
          // Force component update
          setLastUpdate(Date.now());
        } catch (error) {
          console.error('Failed to refresh project data:', error);
        }
      };
      
      refreshData();
    }
  }, [projectId, projects.length, loadTasks, loadNotes]);

  // Listen for real-time store changes
  useEffect(() => {
    const handleStoreChange = () => {
      setLastUpdate(Date.now());
    };

    // Set up interval to check for changes (lightweight polling)
    const interval = setInterval(handleStoreChange, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Force refresh when navigating between tabs
  useEffect(() => {
    setLastUpdate(Date.now());
  }, [activeTab]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Project Not Found
        </h2>
        <p className="text-text-muted mb-4">
          The project you're looking for doesn't exist or may have been deleted.
        </p>
        <Button onClick={() => navigate('/projects')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M19 12H6M12 5l-7 7 7 7"/>
          </svg>
          Back to Projects
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Project Header - KEEPING YOUR THEME CHANGES */}
      <Card className="mb-6 bg-gradient-to-r from-bg-secondary to-bg-secondary dark:from-blue-900/20 dark:to-indigo-900/20 border-border">
        <div className="p-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm text-text-muted mb-4">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center hover:text-accent transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                <path d="M19 12H6M12 5l-7 7 7 7"/>
              </svg>
              Projects
            </button>
            <span className="mx-2">/</span>
            <span className="text-text-primary font-medium">{project.name}</span>
          </div>
          
          {/* Project Header Content */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-text-primary">
                  {project.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : project.status === 'completed'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {project.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.mode === 'structured' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {project.mode}
                </span>
              </div>
              
              {project.description && (
                <p className="text-text-muted mb-4 leading-relaxed">
                  {project.description}
                </p>
              )}
              
              {/* Project Metadata */}
              <div className="flex items-center gap-6 text-sm text-text-muted">
                {project.metadata?.deadline && (
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>Due {new Date(project.metadata.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                {project.metadata?.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>{project.metadata.estimatedHours}h estimated</span>
                  </div>
                )}
                {project.metadata?.priority && (
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <span className="capitalize">{project.metadata.priority} priority</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons - FIXED EDIT FUNCTIONALITY */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="small" onClick={handleEditProject}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {projectStats.totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-muted">
                  Progress: {projectStats.completedTasks} of {projectStats.totalTasks} tasks completed
                </span>
                <span className="font-medium text-text-primary">
                  {projectStats.progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${projectStats.progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Real-time Tab Navigation with live counts */}
      <Card className="mb-6">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-muted hover:text-text-primary hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                >
                  <IconComponent />
                  {tab.label}
                  {tab.count !== null && (
                    <motion.span 
                      key={tab.count} // Key changes trigger animation
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className={`${
                        isActive 
                          ? 'bg-accent/10 text-accent'
                          : 'bg-gray-100 text-text-muted dark:bg-gray-800'
                      } ml-2 py-0.5 px-2 rounded-full text-xs font-medium`}
                    >
                      {tab.count}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Project Search - FUNCTIONAL SEARCH */}
        {activeTab !== 'overview' && (
          <div className="p-4 border-b border-border">
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {projectSearchTerm && (
              <p className="text-sm text-text-muted mt-2">
                {activeTab === 'tasks' && `Found ${projectTasks.length} tasks`}
                {activeTab === 'notes' && `Found ${projectNotes.length} notes`}
                {activeTab === 'prompts' && `Found ${projectPrompts.length} prompts`}
                {activeTab === 'snippets' && `Found ${projectSnippets.length} snippets`}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real-time Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Total Tasks</p>
                      <motion.p 
                        key={projectStats.totalTasks}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-text-primary"
                      >
                        {projectStats.totalTasks}
                      </motion.p>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.02 1.17.06"/>
                    </svg>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Completed</p>
                      <motion.p 
                        key={projectStats.completedTasks}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-green-600"
                      >
                        {projectStats.completedTasks}
                      </motion.p>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Notes</p>
                      <motion.p 
                        key={projectStats.totalNotes}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-text-primary"
                      >
                        {projectStats.totalNotes}
                      </motion.p>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted">Resources</p>
                      <motion.p 
                        key={projectStats.totalPrompts + projectStats.totalSnippets}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-text-primary"
                      >
                        {projectStats.totalPrompts + projectStats.totalSnippets}
                      </motion.p>
                    </div>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500">
                      <polyline points="16,18 22,12 16,6"/>
                      <polyline points="8,6 2,12 8,18"/>
                    </svg>
                  </div>
                </Card>
              </div>
              
              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-text-muted">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              {projectTasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.02 1.17.06"/>
                  </svg>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {projectSearchTerm ? 'No matching tasks found' : 'No tasks found'}
                  </h3>
                  <p className="text-text-muted mb-4">
                    {projectSearchTerm 
                      ? `No tasks match "${projectSearchTerm}". Try a different search term.`
                      : 'Get started by creating your first task for this project.'
                    }
                  </p>
                  {!projectSearchTerm && (
                    <Button onClick={handleCreateTask}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Task
                    </Button>
                  )}
                </Card>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Tasks ({projectTasks.length})
                    </h3>
                    <Button onClick={handleCreateTask}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Task
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onUpdate={() => setLastUpdate(Date.now())} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              {projectNotes.length === 0 ? (
                <Card className="p-8 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {projectSearchTerm ? 'No matching notes found' : 'No notes found'}
                  </h3>
                  <p className="text-text-muted mb-4">
                    {projectSearchTerm 
                      ? `No notes match "${projectSearchTerm}". Try a different search term.`
                      : 'Start documenting your project with notes.'
                    }
                  </p>
                  {!projectSearchTerm && (
                    <Button onClick={handleCreateNote}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Note
                    </Button>
                  )}
                </Card>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Notes ({projectNotes.length})
                    </h3>
                    <Button onClick={handleCreateNote}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Note
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectNotes.map((note) => (
                      <NoteCard 
  key={note.id} 
  note={note} 
  onEdit={(note) => {
    // Set the note to edit and open the form
    setEditingNote(note);
    setShowNoteForm(true);
  }}
  onDelete={async (note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await useNotesStore.getState().deleteNote(note.id);
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  }}
  onDuplicate={async (note) => {
  try {
    const duplicatedNote = {
      title: `${note.title} (Copy)`,
      content: note.content,
      type: note.type,
      projectId: projectId, // Add this line
      tags: [...(note.tags || [])],
      metadata: { ...note.metadata }
    };
    await useNotesStore.getState().createNote(duplicatedNote);
    setLastUpdate(Date.now());
  } catch (error) {
    console.error('Failed to duplicate note:', error);
  }
}}
  onToggleFavorite={async (note) => {
    try {
      await useNotesStore.getState().updateNote(note.id, {
        isFavorite: !note.isFavorite
      });
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }}
  onArchive={async (note) => {
    try {
      await useNotesStore.getState().updateNote(note.id, {
        isArchived: !note.isArchived
      });
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to archive note:', error);
    }
  }}
/>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompts' && (
            <div>
              {projectPrompts.length === 0 ? (
                <Card className="p-8 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  </svg>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {projectSearchTerm ? 'No matching prompts found' : 'No prompts found'}
                  </h3>
                  <p className="text-text-muted mb-4">
                    {projectSearchTerm 
                      ? `No prompts match "${projectSearchTerm}". Try a different search term.`
                      : 'Save AI prompts related to this project.'
                    }
                  </p>
                  {!projectSearchTerm && (
                    <Button onClick={handleCreatePrompt}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Prompt
                    </Button>
                  )}
                </Card>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Prompts ({projectPrompts.length})
                    </h3>
                    <Button onClick={handleCreatePrompt}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Prompt
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectPrompts.map((prompt) => (
                      <PromptCard 
  key={prompt.id} 
  prompt={prompt} 
  onEdit={(prompt) => {
    console.log('🐛 Edit prompt clicked:', prompt);
    setEditingPrompt(prompt);
    setShowPromptForm(true);
  }}
  onDelete={async (prompt) => {
    if (window.confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      try {
        await usePromptStore.getState().deletePrompt(prompt.id);
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  }}
  onDuplicate={async (prompt) => {
  try {
    console.log('🐛 Duplicating prompt for project:', project.name, projectId);
    const duplicatedPrompt = {
      title: `${prompt.title} (Copy)`,
      content: prompt.content,
      category: prompt.category,
      tags: [...(prompt.tags || []), project.name, projectId], // Add both project name and ID
      metadata: { ...prompt.metadata }
    };
    console.log('🐛 Duplicated prompt data:', duplicatedPrompt);
    await usePromptStore.getState().createPrompt(duplicatedPrompt);
    setLastUpdate(Date.now());
  } catch (error) {
    console.error('Failed to duplicate prompt:', error);
  }
}}
  onToggleFavorite={async (prompt) => {
    try {
      await usePromptStore.getState().updatePrompt(prompt.id, {
        isFavorite: !prompt.isFavorite
      });
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }}
  onUse={async (prompt) => {
    try {
      // Copy to clipboard and increment usage
      await navigator.clipboard.writeText(prompt.content);
      await usePromptStore.getState().updatePrompt(prompt.id, {
        usageCount: (prompt.usageCount || 0) + 1
      });
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to use prompt:', error);
    }
  }}
  onSelect={(prompt) => {
    // Optional: Handle prompt selection
    console.log('Prompt selected:', prompt.title);
  }}
/>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'snippets' && (
            <div>
              {projectSnippets.length === 0 ? (
                <Card className="p-8 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
                    <polyline points="16,18 22,12 16,6"/>
                    <polyline points="8,6 2,12 8,18"/>
                  </svg>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {projectSearchTerm ? 'No matching snippets found' : 'No code snippets found'}
                  </h3>
                  <p className="text-text-muted mb-4">
                    {projectSearchTerm 
                      ? `No snippets match "${projectSearchTerm}". Try a different search term.`
                      : 'Store code snippets for this project.'
                    }
                  </p>
                  {!projectSearchTerm && (
                    <Button onClick={handleCreateSnippet}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Snippet
                    </Button>
                  )}
                </Card>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Code Snippets ({projectSnippets.length})
                    </h3>
                    <Button onClick={handleCreateSnippet}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Add Snippet
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectSnippets.map((snippet) => (
                      <SnippetCard 
  key={snippet.id} 
  snippet={snippet} 
  onEdit={(snippet) => {
    console.log('🐛 Edit snippet clicked:', snippet);
    setEditingSnippet(snippet);
    setShowSnippetForm(true);
  }}
  onDelete={async (snippet) => {
    if (window.confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      try {
        await useSnippetStore.getState().deleteSnippet(snippet.id);
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Failed to delete snippet:', error);
      }
    }
  }}
  onDuplicate={async (snippet) => {
  try {
    const duplicatedSnippet = {
      title: `${snippet.title} (Copy)`,
      code: snippet.code,
      language: snippet.language,
      category: snippet.category,
      description: snippet.description,
      projectId: projectId, // Add this line
      tags: [...(snippet.tags || [])],
      metadata: { ...snippet.metadata }
    };
    await useSnippetStore.getState().createSnippet(duplicatedSnippet);
    setLastUpdate(Date.now());
  } catch (error) {
    console.error('Failed to duplicate snippet:', error);
  }
}}
  onToggleFavorite={async (snippet) => {
    try {
      await useSnippetStore.getState().updateSnippet(snippet.id, {
        isFavorite: !snippet.isFavorite
      });
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }}
  onUse={async (snippet) => {
    try {
      // Copy to clipboard and increment usage
      await navigator.clipboard.writeText(snippet.code);
      await useSnippetStore.getState().updateSnippet(snippet.id, {
        usageCount: (snippet.usageCount || 0) + 1
      });
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to use snippet:', error);
    }
  }}
  onSelect={(snippet) => {
    // Optional: Handle snippet selection
    console.log('Snippet selected:', snippet.title);
  }}
/>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <Card className="p-8 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Activity Timeline
              </h3>
              <p className="text-text-muted">
                Project activity timeline will be implemented in a future update.
              </p>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modal Forms for Creating/Editing Items */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        task={null}
        defaultProjectId={projectId}
        onSuccess={handleTaskSuccess}
      />

      <NoteForm
  isOpen={showNoteForm}
  onClose={() => {
    setShowNoteForm(false);
    setEditingNote(null);
  }}
  note={editingNote}
  mode={editingNote ? 'edit' : 'create'}
  defaultProjectId={projectId} // Add this line
  onSuccess={() => {
    handleNoteSuccess();
    setEditingNote(null);
  }}
/>

      <PromptForm
  isOpen={showPromptForm}
  onClose={() => {
    setShowPromptForm(false);
    setEditingPrompt(null);
    // Force refresh after close
    usePromptStore.getState().loadPrompts();
    setLastUpdate(Date.now());
  }}
  prompt={editingPrompt}
  mode={editingPrompt ? 'edit' : 'create'}
  defaultTags={project ? [project.name] : []}
  defaultProjectId={projectId}
/>

      <SnippetForm
  isOpen={showSnippetForm}
  onClose={() => {
    setShowSnippetForm(false);
    setEditingSnippet(null);
  }}
  snippet={editingSnippet}
  mode={editingSnippet ? 'edit' : 'create'}
  defaultProjectId={projectId} // Add this line
  onSuccess={() => {
    handleSnippetSuccess();
    setEditingSnippet(null);
  }}
/>

      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        project={project}
        onSuccess={handleProjectSuccess}
      />
    </div>
  );
};

export default ProjectWorkspace;