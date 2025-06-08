import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Badge } from '../ui';
import useProjectStore from '../../stores/useProjectStore';

const ProjectForm = ({ 
  isOpen, 
  onClose, 
  project = null, // null for create, project object for edit
  templateId = null 
}) => {
  const { templates, createProject, updateProject, createProjectFromTemplate } = useProjectStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mode: 'structured',
    status: 'active',
    priority: 'medium',
    deadline: '',
    estimatedHours: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Edit mode - populate with existing project data
        setFormData({
          name: project.name || '',
          description: project.description || '',
          mode: project.mode || 'structured',
          status: project.status || 'active',
          priority: project.metadata?.priority || 'medium',
          deadline: project.metadata?.deadline ? project.metadata.deadline.split('T')[0] : '',
          estimatedHours: project.metadata?.estimatedHours || '',
          tags: project.metadata?.tags || []
        });
      } else if (templateId) {
        // Create from template
        const template = templates.find(t => t.id === templateId);
        if (template) {
          setFormData({
            name: template.name,
            description: template.description,
            mode: template.defaultMode,
            status: 'active',
            priority: 'medium',
            deadline: '',
            estimatedHours: '',
            tags: []
          });
        }
      } else {
        // Create new - reset form
        setFormData({
          name: '',
          description: '',
          mode: 'structured',
          status: 'active',
          priority: 'medium',
          deadline: '',
          estimatedHours: '',
          tags: []
        });
      }
      setErrors({});
      setTagInput('');
    }
  }, [isOpen, project, templateId, templates]);

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)) {
      newErrors.estimatedHours = 'Estimated hours must be a positive number';
    }
    
    if (formData.deadline && new Date(formData.deadline) < new Date().setHours(0,0,0,0)) {
      newErrors.deadline = 'Deadline cannot be in the past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        mode: formData.mode,
        status: formData.status,
        metadata: {
          priority: formData.priority,
          deadline: formData.deadline || null,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
          tags: formData.tags
        }
      };
      
      if (project) {
        // Update existing project
        updateProject(project.id, projectData);
      } else if (templateId) {
        // Create from template
        createProjectFromTemplate(templateId, projectData);
      } else {
        // Create new project
        createProject(projectData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modeDescriptions = {
    structured: 'Traditional project management with timelines and milestones',
    creative: 'Fluid, inspiration-driven workflow for creative projects',
    hybrid: 'Combine structured planning with creative flexibility'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create New Project'}
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
            disabled={!formData.name.trim()}
          >
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <Input
          label="Project Name"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Enter project name"
          required
          error={errors.name}
        />

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-primary">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Describe your project..."
            rows={3}
            className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary placeholder-text-muted border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
          />
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Project Mode
          </label>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(modeDescriptions).map(([mode, description]) => (
              <div key={mode}>
                <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value={mode}
                    checked={formData.mode === mode}
                    onChange={handleInputChange('mode')}
                    className="mt-1 text-accent focus:ring-accent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-text-primary capitalize">
                        {mode}
                      </span>
                      <Badge 
                        variant={mode === 'structured' ? 'primary' : mode === 'creative' ? 'success' : 'warning'}
                        size="small"
                      >
                        {mode}
                      </Badge>
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

        {/* Priority and Status */}
        <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">
              Status
            </label>
            <select
              value={formData.status}
              onChange={handleInputChange('status')}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Deadline and Estimated Hours */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Deadline"
            type="date"
            value={formData.deadline}
            onChange={handleInputChange('deadline')}
            error={errors.deadline}
          />

          <Input
            label="Estimated Hours"
            type="number"
            value={formData.estimatedHours}
            onChange={handleInputChange('estimatedHours')}
            placeholder="e.g. 40"
            min="0"
            error={errors.estimatedHours}
          />
        </div>

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

export default ProjectForm;