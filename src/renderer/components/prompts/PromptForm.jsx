// src/renderer/components/prompts/PromptForm.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Card } from '../ui';
import usePromptStore from '../../stores/usePromptStore';

const PromptForm = ({ isOpen, onClose, prompt = null, mode = 'create' }) => {
  const { categories, createPrompt, updatePrompt } = usePromptStore();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    response: '',
    metadata: {
      aiModel: '',
      language: '',
      project: ''
    }
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when prompt prop changes
  useEffect(() => {
    if (prompt && mode === 'edit') {
      setFormData({
        title: prompt.title || '',
        content: prompt.content || '',
        category: prompt.category || 'general',
        tags: prompt.tags || [],
        response: prompt.response || '',
        metadata: {
          aiModel: prompt.metadata?.aiModel || '',
          language: prompt.metadata?.language || '',
          project: prompt.metadata?.project || ''
        }
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        content: '',
        category: 'general',
        tags: [],
        response: '',
        metadata: {
          aiModel: '',
          language: '',
          project: ''
        }
      });
    }
    setErrors({});
  }, [prompt, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Prompt content is required';
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
      const promptData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim()), // Remove empty tags
        metadata: {
          ...formData.metadata,
          // Remove empty metadata fields
          aiModel: formData.metadata.aiModel.trim() || null,
          language: formData.metadata.language.trim() || null,
          project: formData.metadata.project.trim() || null
        }
      };

      if (mode === 'edit' && prompt) {
        await updatePrompt(prompt.id, promptData);
      } else {
        await createPrompt(promptData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      setErrors({
        submit: 'Failed to save prompt. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = mode === 'edit' ? 'Edit Prompt' : 'Create New Prompt';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter prompt title..."
          error={errors.title}
          required
          maxLength={100}
        />

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Prompt Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter your AI prompt here..."
            rows={6}
            className={`w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary placeholder-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none ${
              errors.content 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-border hover:border-text-muted'
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-500">{errors.content}</p>
          )}
        </div>

        {/* Category and Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  name="tagInput"
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
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
              
              {/* Tag Display */}
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
                        onClick={() => handleRemoveTag(tag)}
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
        </div>

        {/* Response (Optional) */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            AI Response (Optional)
          </label>
          <textarea
            value={formData.response}
            onChange={(e) => handleInputChange('response', e.target.value)}
            placeholder="Paste the AI response here for future reference..."
            rows={4}
            className="w-full border rounded-lg px-4 py-2 text-sm bg-bg-secondary text-text-primary placeholder-text-muted border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200 resize-none"
          />
        </div>

        {/* Metadata */}
        <Card padding="medium" className="bg-bg-primary border border-border">
          <h4 className="text-sm font-medium text-text-primary mb-3">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="AI Model"
              value={formData.metadata.aiModel}
              onChange={(e) => handleMetadataChange('aiModel', e.target.value)}
              placeholder="e.g., GPT-4, Claude-3"
              size="small"
            />
            
            <Input
              label="Programming Language"
              value={formData.metadata.language}
              onChange={(e) => handleMetadataChange('language', e.target.value)}
              placeholder="e.g., JavaScript, Python"
              size="small"
            />
            
            <Input
              label="Related Project"
              value={formData.metadata.project}
              onChange={(e) => handleMetadataChange('project', e.target.value)}
              placeholder="Project name"
              size="small"
            />
          </div>
        </Card>

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
            {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Prompt' : 'Create Prompt')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PromptForm;