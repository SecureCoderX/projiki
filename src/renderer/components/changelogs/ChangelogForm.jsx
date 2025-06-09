// src/renderer/components/changelogs/ChangelogForm.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Badge } from '../ui';
import useChangelogStore from '../../stores/useChangelogStore';
import useTaskStore from '../../stores/useTaskStore';
import { v4 as uuidv4 } from 'uuid';

const ChangelogForm = ({ 
  isOpen, 
  onClose, 
  changelog = null, // null for create, changelog object for edit
  defaultProjectId = null,
  onSuccess 
}) => {
  const { createChangelog, updateChangelog, suggestNextVersion, getLatestVersionForProject } = useChangelogStore();
  const { tasks } = useTaskStore();
  
  const [formData, setFormData] = useState({
    version: '',
    releaseDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    releaseNotes: '',
    tags: [],
    createdBy: '',
    changes: [],
    metadata: {
      breakingChanges: false,
      securityUpdate: false,
      hotfix: false,
      prerelease: false
    }
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newChange, setNewChange] = useState({
    category: 'feature',
    description: '',
    linkedTasks: [],
    impact: 'minor'
  });

  // Available project tasks for linking
  const projectTasks = tasks.filter(task => task.projectId === defaultProjectId);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (changelog) {
        // Edit mode - populate with existing changelog data
        setFormData({
          version: changelog.version || '',
          releaseDate: changelog.releaseDate ? changelog.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
          status: changelog.status || 'draft',
          releaseNotes: changelog.releaseNotes || '',
          tags: changelog.tags || [],
          createdBy: changelog.createdBy || '',
          changes: changelog.changes || [],
          metadata: {
            breakingChanges: changelog.metadata?.breakingChanges || false,
            securityUpdate: changelog.metadata?.securityUpdate || false,
            hotfix: changelog.metadata?.hotfix || false,
            prerelease: changelog.metadata?.prerelease || false,
            ...changelog.metadata
          }
        });
      } else {
        // Create new - suggest next version
        const suggestedVersion = defaultProjectId ? 
          suggestNextVersion(defaultProjectId, 'minor') : '1.0.0';
        
        setFormData({
          version: suggestedVersion,
          releaseDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          releaseNotes: '',
          tags: [],
          createdBy: '',
          changes: [],
          metadata: {
            breakingChanges: false,
            securityUpdate: false,
            hotfix: false,
            prerelease: false
          }
        });
      }
      setErrors({});
      setTagInput('');
      setNewChange({
        category: 'feature',
        description: '',
        linkedTasks: [],
        impact: 'minor'
      });
    }
  }, [isOpen, changelog, defaultProjectId, suggestNextVersion]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleNewChangeInput = (field) => (e) => {
    setNewChange(prev => ({
      ...prev,
      [field]: e.target.value
    }));
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

  const handleAddChange = () => {
    if (newChange.description.trim()) {
      const change = {
        id: uuidv4(),
        ...newChange,
        description: newChange.description.trim()
      };
      
      setFormData(prev => ({
        ...prev,
        changes: [...prev.changes, change]
      }));
      
      setNewChange({
        category: 'feature',
        description: '',
        linkedTasks: [],
        impact: 'minor'
      });
    }
  };

  const handleRemoveChange = (changeId) => {
    setFormData(prev => ({
      ...prev,
      changes: prev.changes.filter(change => change.id !== changeId)
    }));
  };

  const handleTaskLinkToggle = (taskId) => {
    setNewChange(prev => ({
      ...prev,
      linkedTasks: prev.linkedTasks.includes(taskId)
        ? prev.linkedTasks.filter(id => id !== taskId)
        : [...prev.linkedTasks, taskId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    } else if (!/^\d+\.\d+\.\d+/.test(formData.version)) {
      newErrors.version = 'Version must follow semantic versioning (e.g., 1.0.0)';
    }
    
    if (!formData.releaseDate) {
      newErrors.releaseDate = 'Release date is required';
    }
    
    if (formData.changes.length === 0) {
      newErrors.changes = 'At least one change is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuggestVersion = (impactLevel) => {
    if (defaultProjectId) {
      const suggestedVersion = suggestNextVersion(defaultProjectId, impactLevel);
      setFormData(prev => ({
        ...prev,
        version: suggestedVersion
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const changelogData = {
        ...formData,
        projectId: defaultProjectId,
        releaseDate: new Date(formData.releaseDate).toISOString()
      };
      
      if (changelog) {
        // Update existing changelog
        await updateChangelog(changelog.id, changelogData);
      } else {
        // Create new changelog
        await createChangelog(changelogData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save changelog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'feature':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
      case 'bugfix':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h10"/><path d="M6 12h12"/><path d="M8 18h10"/></svg>;
      case 'improvement':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>;
      case 'breaking':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
      case 'deprecated':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>;
      default:
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={changelog ? 'Edit Changelog' : 'Create New Changelog'}
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
            disabled={!formData.version.trim() || formData.changes.length === 0}
          >
            {changelog ? 'Update Changelog' : 'Create Changelog'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Version and Release Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              label="Version"
              value={formData.version}
              onChange={handleInputChange('version')}
              placeholder="e.g., 1.0.0"
              required
              error={errors.version}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={() => handleSuggestVersion('patch')}
              >
                Patch
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={() => handleSuggestVersion('minor')}
              >
                Minor
              </Button>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={() => handleSuggestVersion('major')}
              >
                Major
              </Button>
            </div>
          </div>

          <Input
            label="Release Date"
            type="date"
            value={formData.releaseDate}
            onChange={handleInputChange('releaseDate')}
            required
            error={errors.releaseDate}
          />
        </div>

        {/* Status and Created By */}
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <Input
            label="Created By"
            value={formData.createdBy}
            onChange={handleInputChange('createdBy')}
            placeholder="Your name"
          />
        </div>

        {/* Metadata Checkboxes */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Release Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.metadata.breakingChanges}
                onChange={handleInputChange('metadata.breakingChanges')}
                className="text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-primary">Breaking Changes</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.metadata.securityUpdate}
                onChange={handleInputChange('metadata.securityUpdate')}
                className="text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-primary">Security Update</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.metadata.hotfix}
                onChange={handleInputChange('metadata.hotfix')}
                className="text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-primary">Hotfix</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.metadata.prerelease}
                onChange={handleInputChange('metadata.prerelease')}
                className="text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-primary">Pre-release</span>
            </label>
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-primary">
            Release Notes
          </label>
          <textarea
            value={formData.releaseNotes}
            onChange={handleInputChange('releaseNotes')}
            placeholder="Describe this release..."
            rows={4}
            className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary placeholder-text-muted border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
          />
        </div>

        {/* Changes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text-primary">
              Changes {errors.changes && <span className="text-red-500">*</span>}
            </label>
            {errors.changes && (
              <span className="text-sm text-red-500">{errors.changes}</span>
            )}
          </div>

          {/* Add New Change */}
                      <div className="border rounded-lg p-4 bg-bg-tertiary">
            <h4 className="text-sm font-medium text-text-primary mb-3">Add Change</h4>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-text-primary">Category</label>
                <select
                  value={newChange.category}
                  onChange={handleNewChangeInput('category')}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="feature">Feature</option>
                  <option value="bugfix">Bug Fix</option>
                  <option value="improvement">Improvement</option>
                  <option value="breaking">Breaking Change</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-text-primary">Impact</label>
                <select
                  value={newChange.impact}
                  onChange={handleNewChangeInput('impact')}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="patch">Patch</option>
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="Description"
                value={newChange.description}
                onChange={handleNewChangeInput('description')}
                placeholder="Describe the change..."
                required
              />

              {/* Task Linking */}
              {projectTasks.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-text-primary">
                    Link to Tasks (Optional)
                  </label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-bg-secondary">
                    {projectTasks.slice(0, 10).map((task) => (
                      <label key={task.id} className="flex items-center space-x-2 p-1 hover:bg-bg-tertiary rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newChange.linkedTasks.includes(task.id)}
                          onChange={() => handleTaskLinkToggle(task.id)}
                          className="text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-text-primary truncate flex-1">
                          {task.title}
                        </span>
                        {task.type === 'bug' && (
                          <Badge variant="error" size="small">Bug</Badge>
                        )}
                      </label>
                    ))}
                  </div>
                  {newChange.linkedTasks.length > 0 && (
                    <p className="text-xs text-text-muted">
                      {newChange.linkedTasks.length} task(s) selected
                    </p>
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={handleAddChange}
                disabled={!newChange.description.trim()}
                className="w-full"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Add Change
              </Button>
            </div>
          </div>

          {/* Existing Changes */}
          {formData.changes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">
                Changes ({formData.changes.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {formData.changes.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-bg-secondary"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getCategoryIcon(change.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            change.category === 'feature' ? 'primary' :
                            change.category === 'bugfix' ? 'error' :
                            change.category === 'improvement' ? 'success' :
                            change.category === 'breaking' ? 'warning' :
                            'secondary'
                          }
                          size="small"
                        >
                          {change.category}
                        </Badge>
                        <Badge variant="outline" size="small">
                          {change.impact}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-text-primary mb-1">
                        {change.description}
                      </p>
                      
                      {change.linkedTasks && change.linkedTasks.length > 0 && (
                        <p className="text-xs text-text-muted">
                          Linked: {change.linkedTasks.length} task(s)
                        </p>
                      )}
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="small"
                      onClick={() => handleRemoveChange(change.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

        {/* Summary */}
        {formData.changes.length > 0 && (
          <div className="bg-bg-tertiary border border-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">
              Changelog Summary
            </h4>
            <div className="text-sm text-text-secondary">
              <p><strong>Version:</strong> {formData.version}</p>
              <p><strong>Release Date:</strong> {new Date(formData.releaseDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {formData.status}</p>
              <p><strong>Changes:</strong> {formData.changes.length} items</p>
              {formData.metadata.breakingChanges && (
                <p className="text-orange-600 font-medium">⚠️ Contains breaking changes</p>
              )}
              {formData.metadata.securityUpdate && (
                <p className="text-red-600 font-medium">🔒 Security update</p>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ChangelogForm;