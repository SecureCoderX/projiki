// src/renderer/components/notes/NoteForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Card } from '../ui';
import useNotesStore from '../../stores/useNotesStore';
import useProjectStore from '../../stores/useProjectStore';

const NoteForm = ({ isOpen, onClose, note, mode = 'create' }) => {
  const { 
    createNote, 
    updateNote, 
    noteTypes 
  } = useNotesStore();

  const { projects } = useProjectStore();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'note',
    tags: [],
    projectId: null,
    metadata: {}
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef(null);

  // Initialize form data when note prop changes
  useEffect(() => {
    if (mode === 'edit' && note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        type: note.type || 'note',
        tags: note.tags || [],
        projectId: note.projectId || null,
        metadata: note.metadata || {}
      });
    } else {
      // Reset form for new note
      setFormData({
        title: '',
        content: '',
        type: 'note',
        tags: [],
        projectId: null,
        metadata: {}
      });
    }
    setTagInput('');
    setErrors({});
  }, [note, mode, isOpen]);

  // Focus content area when modal opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setTimeout(() => {
        if (mode === 'create') {
          contentRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, mode]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Auto-generate title from content if empty
    if (field === 'content' && !formData.title && value.trim()) {
      const firstLine = value.split('\n')[0].trim();
      if (firstLine && firstLine.length <= 100) {
        setFormData(prev => ({
          ...prev,
          title: firstLine.substring(0, 50)
        }));
      }
    }
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim() && !formData.content.trim()) {
      newErrors.content = 'Either title or content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const noteData = {
        ...formData,
        title: formData.title.trim() || formData.content.split('\n')[0].substring(0, 50) || 'Untitled Note',
        tags: formData.tags.filter(tag => tag.trim())
      };

      if (mode === 'edit' && note) {
        await updateNote(note.id, noteData);
      } else {
        await createNote(noteData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save note:', error);
      setErrors({ submit: 'Failed to save note. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSubmit(e);
    }
    // Ctrl/Cmd + Enter to save and close
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Note' : 'Create New Note'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
        {/* Title and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Note title (optional - will auto-generate from content)"
            error={errors.title}
          />
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              {noteTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Association */}
        {projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Project (Optional)
            </label>
            <select
              value={formData.projectId || ''}
              onChange={(e) => handleChange('projectId', e.target.value || null)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              <option value="">No project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-primary">
              Content
            </label>
            <div className="text-xs text-text-muted">
              {wordCount} words • {readTime} min read
            </div>
          </div>
          <div className="border rounded-lg border-border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-bg-secondary border-b border-border">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-muted">Markdown supported</span>
                <span className="text-xs text-text-muted">•</span>
                <span className="text-xs text-text-muted">
                  {formData.content.split('\n').length} lines
                </span>
              </div>
              <div className="text-xs text-text-muted">
                <kbd className="px-1 py-0.5 bg-bg-primary rounded text-xs">⌘/Ctrl</kbd> + 
                <kbd className="px-1 py-0.5 bg-bg-primary rounded text-xs ml-1">S</kbd> to save
              </div>
            </div>
            <textarea
              ref={contentRef}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Start writing your note... Markdown formatting is supported."
              className="w-full h-64 p-3 resize-none border-none outline-none bg-bg-primary text-text-primary placeholder-text-muted font-mono text-sm leading-relaxed"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}
            />
          </div>
          {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Tags</label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent/10 text-accent border border-accent/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-accent/60 hover:text-accent transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview (if content exists) */}
        {formData.content && (
          <Card padding="medium" className="bg-bg-secondary">
            <h4 className="text-sm font-medium text-text-primary mb-3">Preview</h4>
            <div className="prose prose-sm max-w-none text-text-secondary">
              {formData.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line || <br />}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Error Display */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Note' : 'Create Note')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NoteForm;