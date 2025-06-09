import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/ui';
import useTaskStore from '../stores/useTaskStore';
import useProjectStore from '../stores/useProjectStore';
import useAppStore from '../stores/useAppStore';
import TaskForm from '../components/tasks/TaskForm';

const Tasks = () => {
  const navigate = useNavigate();
  const createTask = useTaskStore(state => state.createTask);
  const projects = useProjectStore(state => state.projects);
  const addNotification = useAppStore(state => state.addNotification);

  // Local state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  // Handle quick task creation
  const handleQuickCreate = async (e) => {
    e.preventDefault();
    
    if (!quickTaskTitle.trim()) {
      addNotification({
        type: 'error',
        title: 'Invalid Input',
        message: 'Please enter a task title.'
      });
      return;
    }

    if (!selectedProjectId) {
      addNotification({
        type: 'error',
        title: 'No Project Selected',
        message: 'Please select a project for this task.'
      });
      return;
    }

    try {
      await createTask({
        title: quickTaskTitle.trim(),
        projectId: selectedProjectId,
        status: 'todo',
        type: 'task'
      });

      const project = projects.find(p => p.id === selectedProjectId);
      
      addNotification({
        type: 'success',
        title: 'Task Created',
        message: `Task added to "${project?.name}"`
      });

      // Clear form
      setQuickTaskTitle('');
      
      // Navigate to project workspace to see the task
      navigate(`/projects/${selectedProjectId}`);
      
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDetailedCreate = () => {
    if (!selectedProjectId) {
      addNotification({
        type: 'error',
        title: 'No Project Selected',
        message: 'Please select a project before creating a detailed task.'
      });
      return;
    }
    setShowTaskForm(true);
  };

  const handleGoToProjects = () => {
    navigate('/projects');
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create Task</h1>
        <p className="text-text-muted">
          Create tasks and attach them to your projects
        </p>
      </motion.div>

      {projects.length === 0 ? (
        /* No Projects State */
        <Card className="p-8 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Projects Found
          </h3>
          <p className="text-text-muted mb-4">
            You need to create a project before you can add tasks.
          </p>
          <Button onClick={handleGoToProjects}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Create Your First Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Project Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Select Project
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <motion.button
  key={project.id}
  onClick={() => setSelectedProjectId(project.id)}
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.98 }}
  className={`p-4 rounded-lg border-2 text-left transition-all ${
    selectedProjectId === project.id
      ? 'border-accent bg-accent/10'
      : 'border-border bg-bg-secondary hover:border-accent/50'
  }`}
>
  <div className="flex items-center justify-between mb-2">
    <h3 className="font-medium text-text-primary">{project.name}</h3>
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      project.status === 'active' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }`}>
      {project.status}
    </span>
  </div>
  {project.description && (
    <p className="text-sm text-text-muted line-clamp-2">
      {project.description}
    </p>
  )}
  <div className="mt-2 flex items-center justify-between">
    <span className={`px-2 py-1 rounded text-xs ${
      project.mode === 'structured' 
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    }`}>
      {project.mode}
    </span>
    {/* FIXED: Changed button to span */}
    <span
      onClick={(e) => {
        e.stopPropagation();
        handleViewProject(project.id);
      }}
      className="text-xs text-accent hover:underline cursor-pointer"
    >
      View Project →
    </span>
  </div>
</motion.button>
              ))}
            </div>
          </Card>

          {/* Task Creation */}
          {selectedProjectId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Quick Create */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  Quick Task Creation
                </h2>
                <form onSubmit={handleQuickCreate} className="flex gap-3">
                  <Input
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!quickTaskTitle.trim()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    Create Task
                  </Button>
                </form>
                <p className="text-sm text-text-muted mt-2">
                  Task will be added to:{" "}
                  <span className="font-medium text-text-primary">
                    {projects.find(p => p.id === selectedProjectId)?.name}
                  </span>
                </p>
              </Card>

              {/* Detailed Create */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  Detailed Task Creation
                </h2>
                <p className="text-text-muted mb-4">
                  Need to add more details like description, priority, or due date?
                </p>
                <Button variant="outline" onClick={handleDetailedCreate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Create Detailed Task
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        task={null}
        defaultProjectId={selectedProjectId}
        onSuccess={(task) => {
  setShowTaskForm(false);
  // Use the selectedProjectId instead of task.projectId
  navigate(`/projects/${selectedProjectId}`);
}}
      />
    </div>
  );
};

export default Tasks;