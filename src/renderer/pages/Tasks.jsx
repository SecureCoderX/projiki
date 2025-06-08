import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import useTaskStore from '../stores/useTaskStore';
import useAppStore from '../stores/useAppStore';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import ViewToggle from '../components/tasks/ViewToggle';

const Tasks = () => {
  const navigate = useNavigate();
  const {
    tasks,
    loadingTasks,
    tasksError,
    currentView,
    groupBy,
    sortBy,
    sortOrder,
    statusFilter,
    priorityFilter,
    tagFilter,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    duplicateTask,
    setCurrentView,
    setGroupBy,
    setSortBy,
    setSortOrder,
    setStatusFilter,
    setPriorityFilter,
    setTagFilter,
    clearFilters,
    getFilteredTasks,
    getTaskStats,
    getAllTaskTags,
    loadTasks
  } = useTaskStore();

  const { currentProject, addNotification } = useAppStore();

  // Modal states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState('todo');
  const [projectLoadingState, setProjectLoadingState] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [lastTaskUpdate, setLastTaskUpdate] = useState(Date.now());
  
  // Track task updates for real-time feedback
  useEffect(() => {
    setLastTaskUpdate(Date.now());
  }, [tasks.length, tasks]);
  
  // Load tasks when project changes with feedback
  useEffect(() => {
    const loadProjectTasks = async () => {
      if (currentProject) {
        setProjectLoadingState('loading');
        try {
          await loadTasks(currentProject.id);
          setProjectLoadingState('loaded');
          
          // Show success notification
          addNotification({
            type: 'success',
            title: 'Project Loaded',
            message: `Loaded tasks for "${currentProject.name}"`
          });
          
          // Clear loading state after a brief delay
          setTimeout(() => setProjectLoadingState(null), 2000);
        } catch (error) {
          setProjectLoadingState('error');
          console.error('Failed to load tasks:', error);
        }
      } else {
        setProjectLoadingState(null);
      }
    };

    loadProjectTasks();
  }, [currentProject?.id, loadTasks, addNotification]);

  // Real-time updates: Re-fetch filtered tasks when tasks change
  const filteredTasks = useMemo(() => {
    let filtered = getFilteredTasks();
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.content?.toLowerCase().includes(searchLower) ||
        task.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        )
      );
    }
    
    return filtered;
  }, [getFilteredTasks, searchTerm, tasks]); // Added 'tasks' dependency for real-time updates

  // Task statistics with real-time updates
  const taskStats = useMemo(() => getTaskStats(), [getTaskStats, tasks]);
  const availableTags = useMemo(() => getAllTaskTags(), [getAllTaskTags, tasks]);

  // Handle task actions
  const handleCreateTask = (status = 'todo') => {
    if (!currentProject) {
      addNotification({
        type: 'error',
        title: 'No Project Selected',
        message: 'Please select a project before creating tasks.'
      });
      return;
    }
    
    setDefaultTaskStatus(status);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleDuplicateTask = async (task) => {
    try {
      const duplicatedTaskData = {
        title: `${task.title} (Copy)`,
        content: task.content,
        type: task.type,
        status: task.status,
        metadata: {
          ...task.metadata,
          // Reset some metadata for the copy
          actualTime: null
        }
      };
      
      await createTask(duplicatedTaskData);
      
      addNotification({
        type: 'success',
        title: 'Task Duplicated',
        message: `"${task.title}" has been duplicated.`
      });
    } catch (error) {
      console.error('Failed to duplicate task:', error);
      addNotification({
        type: 'error',
        title: 'Duplication Failed',
        message: `Failed to duplicate task: ${error.message}`
      });
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      // Task store will handle notifications and real-time updates
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleTaskPriorityChange = async (taskId, newPriority) => {
    try {
      await updateTaskPriority(taskId, newPriority);
      // Task store will handle notifications and real-time updates
    } catch (error) {
      console.error('Failed to update task priority:', error);
    }
  };

  const handleTaskSelect = (task) => {
    // For now, just edit the task when selected
    // In the future, this could open a detailed view
    handleEditTask(task);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
  };

  const handleGoToProjects = () => {
    navigate('/projects');
  };

  const renderTaskView = () => {
    const commonProps = {
      tasks: filteredTasks,
      onTaskEdit: handleEditTask,
      onTaskDelete: handleDeleteTask,
      onTaskDuplicate: handleDuplicateTask,
      onTaskStatusChange: handleTaskStatusChange,
      onTaskPriorityChange: handleTaskPriorityChange,
      onTaskSelect: handleTaskSelect,
      onTaskCreate: handleCreateTask,
      loading: loadingTasks || projectLoadingState === 'loading'
    };

    switch (currentView) {
      case 'kanban':
        return <KanbanBoard {...commonProps} />;
      case 'list':
        return (
          <TaskList 
            {...commonProps}
            groupBy={groupBy}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        );
      case 'timeline':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                  <rect x="3" y="4" width="18" height="2"/>
                  <rect x="5" y="8" width="12" height="2"/>
                  <rect x="7" y="12" width="8" height="2"/>
                  <rect x="9" y="16" width="6" height="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Timeline View Coming Soon</h3>
              <p className="text-text-muted">Gantt-style timeline view will be available in the next update.</p>
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                  <path d="M21 21l-8-8"/>
                  <path d="M21 3l-8 8"/>
                  <path d="M3 21l8-8"/>
                  <path d="M3 3l8 8"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Creative View Coming Soon</h3>
              <p className="text-text-muted">Freeform creative workspace will be available in the next update.</p>
            </div>
          </div>
        );
      default:
        return <KanbanBoard {...commonProps} />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6"
      >
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-text-primary">Tasks</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-text-secondary">
              {currentProject ? (
                <>Manage tasks for <span className="font-medium text-text-primary">{currentProject.name}</span></>
              ) : (
                'Select a project to manage tasks'
              )}
            </p>
            {currentProject && (
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-text-muted">{taskStats.total} total</span>
                <span className="text-green-600">{taskStats.done} done</span>
                <span className="text-blue-600">{taskStats.inProgress} in progress</span>
                <span className="text-yellow-600">{taskStats.todo} todo</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ViewToggle
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>
      </motion.div>

      {/* No Project Selected State */}
      {!currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Project Selected</h3>
          <p className="text-text-muted mb-4 max-w-md">
            Please select a project from the Projects page to view and manage tasks.
          </p>
          <Button
            variant="primary"
            onClick={handleGoToProjects}
          >
            Go to Projects
          </Button>
        </motion.div>
      )}

      {/* Project Loading Notification */}
      {projectLoadingState === 'loading' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Loading project tasks...</span>
        </motion.div>
      )}

      {/* Project Loaded Notification */}
      {projectLoadingState === 'loaded' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          <span>Tasks loaded successfully!</span>
        </motion.div>
      )}

      {/* Error State */}
      {tasksError && (
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
              <h3 className="font-medium text-red-800">Error Loading Tasks</h3>
              <p className="text-sm text-red-600 mt-1">{tasksError}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      {currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Controls for List View */}
            {currentView === 'list' && (
              <div className="flex items-center space-x-3">
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="status">Group by Status</option>
                  <option value="priority">Group by Priority</option>
                  <option value="type">Group by Type</option>
                  <option value="none">No Grouping</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 border border-border rounded-lg bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="updatedAt-desc">Recently Updated</option>
                  <option value="createdAt-desc">Recently Created</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="priority-desc">High Priority First</option>
                </select>
              </div>
            )}

            {/* Clear Filters */}
            {(statusFilter.length > 0 || priorityFilter.length > 0 || tagFilter.length > 0 || searchTerm) && (
              <Button
                variant="ghost"
                size="small"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Task View */}
      {currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-0"
        >
          {renderTaskView()}
        </motion.div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseForm}
        task={editingTask}
        defaultStatus={defaultTaskStatus}
      />
    </div>
  );
};

export default Tasks;