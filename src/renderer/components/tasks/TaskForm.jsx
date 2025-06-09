import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Badge } from '../ui';
import useTaskStore from '../../stores/useTaskStore';
import useProjectStore from '../../stores/useProjectStore';
import useAppStore from '../../stores/useAppStore';

const TaskForm = ({ 
  isOpen, 
  onClose, 
  task = null,
  defaultStatus = 'todo',
  defaultProjectId = null,
  onSuccess = null
}) => {
  const createTask = useTaskStore(state => state.createTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const projects = useProjectStore(state => state.projects);
  const currentProject = useAppStore(state => state.currentProject);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    estimatedTime: '',
    tags: [],
    projectId: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Edit mode
        setFormData({
          title: task.title || '',
          content: task.content || '',
          type: task.type || 'task',
          status: task.status || 'todo',
          priority: task.metadata?.priority || 'medium',
          estimatedTime: task.metadata?.estimatedTime || '',
          tags: task.metadata?.tags || [],
          projectId: task.projectId || ''
        });
      } else {
        // Create mode
        setFormData({
          title: '',
          content: '',
          type: 'task',
          status: defaultStatus,
          priority: 'medium',
          estimatedTime: '',
          tags: [],
          projectId: defaultProjectId || currentProject?.id || ''
        });
      }
      setErrors({});
      setTagInput('');
    }
  }, [isOpen, task, defaultStatus, defaultProjectId, currentProject]);

  // Handle form changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Tag management
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      handleChange('tags', [...formData.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }
    
    if (formData.estimatedTime && (isNaN(formData.estimatedTime) || formData.estimatedTime < 0)) {
      newErrors.estimatedTime = 'Must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('🐛 DEBUG: Starting task creation...');
      console.log('🐛 DEBUG: Form data:', formData);
      console.log('🐛 DEBUG: Current project:', formData.projectId);

      const taskData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        status: formData.status,
        projectId: formData.projectId,
        metadata: {
          priority: formData.priority,
          estimatedTime: formData.estimatedTime ? parseFloat(formData.estimatedTime) : null,
          tags: formData.tags
        }
      };

      console.log('🐛 DEBUG: Task data to save:', taskData);
      
      let savedTask;
      if (task) {
  console.log('🐛 DEBUG: Updating existing task...');
  savedTask = await updateTask(task.id, taskData);
} else {
        console.log('🐛 DEBUG: Creating new task...');
      console.log('🐛 DEBUG: createTask function:', typeof createTask);
        savedTask = await createTask(taskData);
        console.log('🐛 DEBUG: Task created successfully:', savedTask);
      }
      
      if (onSuccess) {
        onSuccess(savedTask);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('🐛 DEBUG: Task creation failed:', error);
      console.error('Failed to save task:', error);
      setErrors({ general: `Failed to save task: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const isFormValid = formData.title.trim() && formData.projectId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="large"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isFormValid}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {errors.general}
            </div>
          )}

          {/* Project Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Project <span className="text-red-500">*</span>
            </label>
            
            {!formData.projectId && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">
                <div className="flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  No project selected. Please select a project first.
                </div>
              </div>
            )}
            
            <select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary transition-colors ${
                errors.projectId 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-border hover:border-text-muted focus:ring-accent'
              } focus:outline-none focus:ring-2 focus:border-transparent`}
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.status})
                </option>
              ))}
            </select>
            
            {errors.projectId && (
              <p className="text-red-500 text-sm">{errors.projectId}</p>
            )}
            
            {/* Project Info */}
            {selectedProject && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-accent">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span className="text-text-muted mr-2">Project:</span>
                  <span className="font-medium text-text-primary">{selectedProject.name}</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    selectedProject.mode === 'structured' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {selectedProject.mode}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title"
              error={errors.title}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Description
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Describe the task (optional)"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary placeholder-text-muted border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'task', label: 'Task', desc: 'Regular task or to-do', icon: '✓' },
                { value: 'idea', label: 'Idea', desc: 'Creative concept to explore', icon: '💡' },
                { value: 'note', label: 'Note', desc: 'Documentation or reference', icon: '📝' },
                { value: 'snippet', label: 'Code', desc: 'Code snippet or technical', icon: '⟨⟩' }
              ].map((type) => (
                <label key={type.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="mt-1 text-accent focus:ring-accent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium text-text-primary">{type.label}</span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">{type.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Estimated Time (hours)
            </label>
            <Input
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => handleChange('estimatedTime', e.target.value)}
              placeholder="e.g. 2.5"
              min="0"
              step="0.5"
              error={errors.estimatedTime}
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">Tags</label>
            
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!tagInput.trim()}
                size="small"
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
                    className="cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                    onClick={() => removeTag(tag)}
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
      </div>
    </Modal>
  );
};

export default TaskForm;