import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Badge } from '../ui';
import useTaskStore from '../../stores/useTaskStore';
import useAppStore from '../../stores/useAppStore';

const TaskForm = ({ 
  isOpen, 
  onClose, 
  task = null, // null for create, task object for edit
  defaultStatus = 'todo'
}) => {
  const { createTask, updateTask } = useTaskStore();
  const { currentProject } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    estimatedTime: '',
    actualTime: '',
    assignee: '',
    tags: [],
    dependencies: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Edit mode - populate with existing task data
        setFormData({
          title: task.title || '',
          content: task.content || '',
          type: task.type || 'task',
          status: task.status || 'todo',
          priority: task.metadata?.priority || 'medium',
          estimatedTime: task.metadata?.estimatedTime || '',
          actualTime: task.metadata?.actualTime || '',
          assignee: task.metadata?.assignee || '',
          tags: task.metadata?.tags || [],
          dependencies: task.metadata?.dependencies || []
        });
      } else {
        // Create new - reset form with defaults
        setFormData({
          title: '',
          content: '',
          type: 'task',
          status: defaultStatus,
          priority: 'medium',
          estimatedTime: '',
          actualTime: '',
          assignee: '',
          tags: [],
          dependencies: []
        });
      }
      setErrors({});
      setTagInput('');
    }
  }, [isOpen, task, defaultStatus]);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (formData.estimatedTime && (isNaN(formData.estimatedTime) || formData.estimatedTime < 0)) {
      newErrors.estimatedTime = 'Estimated time must be a positive number';
    }
    
    if (formData.actualTime && (isNaN(formData.actualTime) || formData.actualTime < 0)) {
      newErrors.actualTime = 'Actual time must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentProject) {
      setErrors({ general: 'No project selected. Please select a project first.' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const taskData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        status: formData.status,
        metadata: {
          priority: formData.priority,
          estimatedTime: formData.estimatedTime ? parseFloat(formData.estimatedTime) : null,
          actualTime: formData.actualTime ? parseFloat(formData.actualTime) : null,
          assignee: formData.assignee.trim() || null,
          tags: formData.tags,
          dependencies: formData.dependencies
        }
      };
      
      if (task) {
        // Update existing task
        await updateTask(task.id, taskData);
      } else {
        // Create new task
        await createTask(taskData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ general: `Failed to save task: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeDescriptions = {
    task: 'Regular task or to-do item',
    note: 'Documentation, ideas, or reference material',
    snippet: 'Code snippet or technical reference',
    idea: 'Creative idea or concept to explore'
  };

  const typeIcons = {
    task: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    note: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    snippet: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16,18 22,12 16,6"/>
        <polyline points="8,6 2,12 8,18"/>
      </svg>
    ),
    idea: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="large"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!formData.title.trim()}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        {/* Current Project Info */}
        {currentProject && (
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-center text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-accent">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span className="text-text-muted mr-2">Creating task in:</span>
              <span className="font-medium text-text-primary">{currentProject.name}</span>
            </div>
          </div>
        )}

        {/* Task Title */}
        <Input
          label="Task Title"
          value={formData.title}
          onChange={handleInputChange('title')}
          placeholder="Enter task title"
          required
          error={errors.title}
        />

        {/* Task Content */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-primary">
            Description
          </label>
          <textarea
            value={formData.content}
            onChange={handleInputChange('content')}
            placeholder="Describe the task, add notes, or paste code snippets..."
            rows={4}
            className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary placeholder-text-muted border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
          />
        </div>

        {/* Task Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Task Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(typeDescriptions).map(([type, description]) => (
              <div key={type}>
                <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleInputChange('type')}
                    className="mt-1 text-accent focus:ring-accent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-muted">{typeIcons[type]}</span>
                      <span className="font-medium text-text-primary capitalize">
                        {type}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      {description}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">
              Status
            </label>
            <select
              value={formData.status}
              onChange={handleInputChange('status')}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={handleInputChange('priority')}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Time Estimates */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Estimated Time (hours)"
            type="number"
            value={formData.estimatedTime}
            onChange={handleInputChange('estimatedTime')}
            placeholder="e.g. 2.5"
            min="0"
            step="0.5"
            error={errors.estimatedTime}
          />

          <Input
            label="Actual Time (hours)"
            type="number"
            value={formData.actualTime}
            onChange={handleInputChange('actualTime')}
            placeholder="e.g. 3"
            min="0"
            step="0.5"
            error={errors.actualTime}
          />
        </div>

        {/* Assignee */}
        <Input
          label="Assignee"
          value={formData.assignee}
          onChange={handleInputChange('assignee')}
          placeholder="Who is responsible for this task?"
        />

        {/* Tags */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Tags
          </label>
          
          <div className="flex space-x-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-colors"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;