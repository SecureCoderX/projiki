import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Badge } from '../components/ui';
import { KanbanBoard, TaskList, TimelineView, CreativeView, TaskFilters, ViewToggle } from '../components/tasks';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';

// 🐛 NEW BUG TRACKING IMPORTS
import BugForm from '../components/tasks/BugForm';
import BugCard from '../components/tasks/BugCard';
import BugFilters from '../components/tasks/BugFilters';

import useTaskStore from '../stores/useTaskStore';
import useProjectStore from '../stores/useProjectStore';
import useAppStore from '../stores/useAppStore';

const Tasks = () => {
  const navigate = useNavigate();
  
  // Store hooks
  const {
    tasks,
    loadingTasks,
    tasksError,
    currentView,
    setCurrentView,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    tagFilter,
    setTagFilter,
    // 🐛 NEW BUG TRACKING FILTERS
    typeFilter,
    setTypeFilter,
    severityFilter,
    setSeverityFilter,
    clearFilters,
    getFilteredTasks,
    getTaskStats,
    getAllTaskTags,
    initialize,
    // 🐛 NEW BUG TRACKING METHODS
    deleteTask,
    createTask
  } = useTaskStore();
  
  const projects = useProjectStore(state => state.projects);
  const addNotification = useAppStore(state => state.addNotification);
  
  // Local state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // 🐛 NEW BUG TRACKING STATE
  const [showBugForm, setShowBugForm] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [showBugFilters, setShowBugFilters] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by project
    if (selectedProjectFilter !== 'all') {
      filtered = filtered.filter(task => task.projectId === selectedProjectFilter);
    }

    // Apply store filters
    if (statusFilter.length > 0) {
      filtered = filtered.filter(task => statusFilter.includes(task.status));
    }

    if (priorityFilter.length > 0) {
      filtered = filtered.filter(task => priorityFilter.includes(task.metadata?.priority));
    }

    if (tagFilter.length > 0) {
      filtered = filtered.filter(task => 
        task.metadata?.tags?.some(tag => tagFilter.includes(tag))
      );
    }

    // 🐛 NEW BUG TRACKING FILTERS
    if (typeFilter.length > 0) {
      filtered = filtered.filter(task => typeFilter.includes(task.type));
    }

    if (severityFilter.length > 0) {
      filtered = filtered.filter(task => 
        task.type === 'bug' && severityFilter.includes(task.metadata?.severity)
      );
    }

    // Sort tasks
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case 'title':
        return sortedFiltered.sort((a, b) => {
          const result = a.title.localeCompare(b.title);
          return sortOrder === 'asc' ? result : -result;
        });
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
        return sortedFiltered.sort((a, b) => {
          const aPriority = priorityOrder[a.metadata?.priority] || 0;
          const bPriority = priorityOrder[b.metadata?.priority] || 0;
          const result = aPriority - bPriority;
          return sortOrder === 'asc' ? result : -result;
        });
      // 🐛 NEW SEVERITY SORTING
      case 'severity':
        const severityOrder = { critical: 5, major: 4, medium: 3, minor: 2, trivial: 1 };
        return sortedFiltered.sort((a, b) => {
          const aSeverity = a.type === 'bug' ? (severityOrder[a.metadata?.severity] || 3) : 0;
          const bSeverity = b.type === 'bug' ? (severityOrder[b.metadata?.severity] || 3) : 0;
          const result = aSeverity - bSeverity;
          return sortOrder === 'asc' ? result : -result;
        });
      case 'createdAt':
      case 'updatedAt':
        return sortedFiltered.sort((a, b) => {
          const result = new Date(a[sortBy]) - new Date(b[sortBy]);
          return sortOrder === 'asc' ? result : -result;
        });
      default:
        return sortedFiltered;
    }
  }, [tasks, searchTerm, selectedProjectFilter, statusFilter, priorityFilter, tagFilter, typeFilter, severityFilter, sortBy, sortOrder, lastUpdate]);

  // 🐛 ENHANCED STATS WITH BUG TRACKING
  const stats = useMemo(() => {
    const allTasks = filteredTasks;
    const bugs = allTasks.filter(t => t.type === 'bug');
    
    return {
      total: allTasks.length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      inProgress: allTasks.filter(t => t.status === 'in-progress').length,
      review: allTasks.filter(t => t.status === 'review').length,
      done: allTasks.filter(t => t.status === 'done').length,
      blocked: allTasks.filter(t => t.status === 'blocked').length,
      // 🐛 NEW BUG STATS
      bugs: {
        total: bugs.length,
        open: bugs.filter(b => b.status === 'open').length,
        critical: bugs.filter(b => b.metadata?.severity === 'critical').length,
      },
      byProject: projects.reduce((acc, project) => {
        acc[project.id] = allTasks.filter(t => t.projectId === project.id).length;
        return acc;
      }, {})
    };
  }, [filteredTasks, projects]);

  // Event handlers
  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  // 🐛 NEW BUG TRACKING HANDLERS
  const handleCreateBug = () => {
    setEditingBug(null);
    setShowBugForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleEditBug = (bug) => {
    setEditingBug(bug);
    setShowBugForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        setLastUpdate(Date.now());
        addNotification({
          type: 'success',
          title: 'Task Deleted',
          message: 'Task has been successfully deleted.'
        });
      } catch (error) {
        console.error('Failed to delete task:', error);
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete task. Please try again.'
        });
      }
    }
  };

  const handleDuplicateTask = async (task) => {
    try {
      const duplicatedTask = {
        ...task,
        title: `${task.title} (Copy)`,
        projectId: task.projectId
      };
      delete duplicatedTask.id;
      delete duplicatedTask.createdAt;
      delete duplicatedTask.updatedAt;
      
      await createTask(duplicatedTask);
      setLastUpdate(Date.now());
      addNotification({
        type: 'success',
        title: 'Task Duplicated',
        message: 'Task has been successfully duplicated.'
      });
    } catch (error) {
      console.error('Failed to duplicate task:', error);
      addNotification({
        type: 'error',
        title: 'Duplicate Failed',
        message: 'Failed to duplicate task. Please try again.'
      });
    }
  };

  const handleTaskSuccess = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    setLastUpdate(Date.now());
  };

  const handleBugSuccess = () => {
    setShowBugForm(false);
    setEditingBug(null);
    setLastUpdate(Date.now());
  };

  const handleUpdateTask = () => {
    setLastUpdate(Date.now());
  };

  const clearAllFilters = () => {
    clearFilters();
    setSearchTerm('');
    setSelectedProjectFilter('all');
  };

  if (loadingTasks) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-muted">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="p-6">
        <Card padding="large" className="text-center">
          <div className="text-red-500 mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-text-primary">Failed to Load Tasks</h3>
          <p className="text-text-muted mb-4">{tasksError}</p>
          <Button variant="primary" onClick={() => initialize()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">All Tasks & Bugs</h1>
          <p className="text-text-secondary">
            Manage tasks and bugs across all projects • {stats.total} total items
            {/* 🐛 SHOW BUG STATS IN HEADER */}
            {stats.bugs.total > 0 && (
              <span className="ml-2">
                • {stats.bugs.total} bugs ({stats.bugs.open} open
                {stats.bugs.critical > 0 && <span className="text-red-500">, {stats.bugs.critical} critical</span>})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            View Projects
          </Button>
          
          {/* 🐛 NEW BUG CREATION BUTTON */}
          <Button variant="secondary" onClick={handleCreateBug}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M8 6h10"/>
              <path d="M6 12h12"/>
              <path d="M8 18h10"/>
            </svg>
            Report Bug
          </Button>
          
          <Button variant="primary" onClick={handleCreateTask}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            New Task
          </Button>
        </div>
      </div>

      {/* 🐛 NEW ENHANCED QUICK STATS WITH BUG TRACKING */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.total}</div>
            <div className="text-sm text-text-muted">Total</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.todo}</div>
            <div className="text-sm text-text-muted">To Do</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            <div className="text-sm text-text-muted">In Progress</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.review}</div>
            <div className="text-sm text-text-muted">Review</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.done}</div>
            <div className="text-sm text-text-muted">Done</div>
          </Card>
          <Card padding="medium" className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.blocked}</div>
            <div className="text-sm text-text-muted">Blocked</div>
          </Card>
          {/* 🐛 NEW BUG STATS CARD */}
          <Card padding="medium" className="text-center border-orange-500/30">
            <div className="text-2xl font-bold text-orange-500">{stats.bugs.total}</div>
            <div className="text-sm text-text-muted">Bugs</div>
            {stats.bugs.critical > 0 && (
              <div className="text-xs text-red-500 mt-1">{stats.bugs.critical} critical</div>
            )}
          </Card>
        </div>
      )}

      {/* 🐛 BUG FILTERS SECTION */}
      {showBugFilters && (
        <div className="mb-6">
          <BugFilters />
        </div>
      )}

      {/* Filters and Controls */}
      <Card padding="medium" className="mb-6">
        <div className="space-y-4">
          {/* Search and View Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks and bugs by title, content, or tags..."
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 🐛 TOGGLE BUG FILTERS BUTTON */}
              <Button
                variant={showBugFilters ? "primary" : "outline"}
                size="small"
                onClick={() => setShowBugFilters(!showBugFilters)}
              >
                🐛 Bug Filters
              </Button>
              
              <ViewToggle 
                currentView={currentView} 
                onViewChange={setCurrentView}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project
              </label>
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({stats.byProject[project.id] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="createdAt">Recently Created</option>
                <option value="title">Title A-Z</option>
                <option value="priority">Priority</option>
                {/* 🐛 NEW SEVERITY SORT OPTION */}
                <option value="severity">Bug Severity</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Actions
              </label>
              <Button
                variant="outline"
                size="small"
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Task Filters Component */}
          <TaskFilters />
        </div>
      </Card>

      {/* Main Content */}
      {tasks.length === 0 ? (
        /* Empty State */
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.02 1.17.06"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No Tasks Yet</h3>
            <p className="text-text-secondary mb-4">
              Create your first task or report a bug to start organizing your work
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" onClick={handleCreateTask}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Create First Task
              </Button>
              {/* 🐛 BUG REPORTING IN EMPTY STATE */}
              <Button variant="secondary" onClick={handleCreateBug}>
                🐛 Report Bug
              </Button>
            </div>
          </div>
        </Card>
      ) : filteredTasks.length === 0 ? (
        /* No Results */
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No Items Found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        /* Task Views */
        <div>
          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">
              Showing {filteredTasks.length} of {tasks.length} items
              {/* 🐛 SHOW BREAKDOWN BY TYPE */}
              {filteredTasks.length > 0 && (
                <span className="ml-2">
                  ({filteredTasks.filter(t => t.type === 'task' || !t.type).length} tasks, {filteredTasks.filter(t => t.type === 'bug').length} bugs)
                </span>
              )}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-muted">View:</span>
              <ViewToggle 
                currentView={currentView} 
                onViewChange={setCurrentView}
                size="small"
              />
            </div>
          </div>

          {/* Task Content Based on View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'kanban' && (
                <KanbanBoard 
                  tasks={filteredTasks} 
                  onUpdate={handleUpdateTask}
                  groupBy="status"
                />
              )}
              
              {currentView === 'list' && (
                <div className="space-y-3">
                  {/* 🐛 RENDER BUGS AND TASKS WITH APPROPRIATE COMPONENTS */}
                  {filteredTasks.map(task => (
                    task.type === 'bug' ? (
                      <BugCard
                        key={task.id}
                        bug={task}
                        onEdit={handleEditBug}
                        onDelete={handleDeleteTask}
                        onDuplicate={handleDuplicateTask}
                      />
                    ) : (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onDuplicate={handleDuplicateTask}
                      />
                    )
                  ))}
                </div>
              )}
              
              {currentView === 'timeline' && (
                <TimelineView 
                  tasks={filteredTasks} 
                  onUpdate={handleUpdateTask}
                />
              )}
              
              {currentView === 'creative' && (
                <CreativeView 
                  tasks={filteredTasks} 
                  onUpdate={handleUpdateTask}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        task={editingTask}
        onSuccess={handleTaskSuccess}
      />

      {/* 🐛 BUG FORM MODAL */}
      <BugForm
        isOpen={showBugForm}
        onClose={() => setShowBugForm(false)}
        bug={editingBug}
        mode={editingBug ? 'edit' : 'create'}
        onSuccess={handleBugSuccess}
      />
    </div>
  );
};

export default Tasks;