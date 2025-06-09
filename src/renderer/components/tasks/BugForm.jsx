import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Badge } from '../ui';
import useTaskStore from '../../stores/useTaskStore';
import useProjectStore from '../../stores/useProjectStore';

const BugForm = ({ 
  isOpen, 
  onClose, 
  bug = null, 
  mode = 'create', 
  defaultProjectId = null 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    severity: 'medium',
    priority: 'medium',
    category: 'general',
    source: 'user-report',
    reproduction: '',
    environment: '',
    reportedBy: '',
    tags: [],
    projectId: defaultProjectId || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const createTask = useTaskStore(state => state.createTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const projects = useProjectStore(state => state.projects);

  // Initialize form data when bug prop changes
  useEffect(() => {
    if (mode === 'edit' && bug) {
      setFormData({
        title: bug.title || '',
        content: bug.content || '',
        severity: bug.metadata?.severity || 'medium',
        priority: bug.metadata?.priority || 'medium',
        category: bug.metadata?.category || 'general',
        source: bug.metadata?.source || 'user-report',
        reproduction: bug.metadata?.reproduction || '',
        environment: bug.metadata?.environment || '',
        reportedBy: bug.metadata?.reportedBy || '',
        tags: bug.metadata?.tags || [],
        projectId: bug.projectId || defaultProjectId || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        content: '',
        severity: 'medium',
        priority: 'medium',
        category: 'general',
        source: 'user-report',
        reproduction: '',
        environment: '',
        reportedBy: '',
        tags: [],
        projectId: defaultProjectId || ''
      });
    }
  }, [bug, mode, defaultProjectId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'tagInput') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Bug title is required');
      return;
    }

    if (!formData.projectId) {
      alert('Project selection is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const bugData = {
        ...formData,
        type: 'bug',
        tags: formData.tags,
        severity: formData.severity,
        category: formData.category,
        source: formData.source,
        reproduction: formData.reproduction,
        environment: formData.environment,
        reportedBy: formData.reportedBy
      };

      if (mode === 'edit' && bug) {
        await updateTask(bug.id, {
          title: formData.title,
          content: formData.content,
          metadata: {
            ...bug.metadata,
            severity: formData.severity,
            priority: formData.priority,
            category: formData.category,
            source: formData.source,
            reproduction: formData.reproduction,
            environment: formData.environment,
            reportedBy: formData.reportedBy,
            tags: formData.tags
          }
        });
      } else {
        await createTask(bugData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save bug:', error);
      alert(`Failed to ${mode} bug: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityOptions = [
    { value: 'critical', label: 'Critical', color: 'text-red-500' },
    { value: 'major', label: 'Major', color: 'text-orange-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'minor', label: 'Minor', color: 'text-blue-500' },
    { value: 'trivial', label: 'Trivial', color: 'text-gray-500' }
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'low', label: 'Low', color: 'text-green-500' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'ui-ux', label: 'UI/UX' },
    { value: 'backend', label: 'Backend' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'documentation', label: 'Documentation' }
  ];

  const sourceOptions = [
    { value: 'user-report', label: 'User Report' },
    { value: 'qa-testing', label: 'QA Testing' },
    { value: 'code-review', label: 'Code Review' },
    { value: 'automated', label: 'Automated Testing' },
    { value: 'internal', label: 'Internal Discovery' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${mode === 'edit' ? 'Edit' : 'Report'} Bug`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Project *
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => handleInputChange('projectId', e.target.value)}
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            required
            disabled={mode === 'edit'}
          >
            <option value="">Select a project...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bug Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Bug Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Brief description of the bug"
            required
            className="w-full"
          />
        </div>

        {/* Severity and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Severity
            </label>
            <select
              value={formData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {severityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category and Source */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bug Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Description
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Detailed description of the bug..."
            rows={4}
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Steps to Reproduce
          </label>
          <textarea
            value={formData.reproduction}
            onChange={(e) => handleInputChange('reproduction', e.target.value)}
            placeholder="1. Go to...&#10;2. Click on...&#10;3. Expected vs Actual behavior..."
            rows={4}
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        {/* Environment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Environment
            </label>
            <Input
              type="text"
              value={formData.environment}
              onChange={(e) => handleInputChange('environment', e.target.value)}
              placeholder="Browser, OS, Device..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Reported By
            </label>
            <Input
              type="text"
              value={formData.reportedBy}
              onChange={(e) => handleInputChange('reportedBy', e.target.value)}
              placeholder="Reporter name or email"
              className="w-full"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-text-muted hover:text-text-primary"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              name="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
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
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !formData.title.trim() || !formData.projectId}
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Bug' : 'Report Bug'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BugForm;