// src/renderer/components/snippets/SnippetForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Card, CodeEditor } from '../ui';
import useSnippetStore from '../../stores/useSnippetStore';

// Enhanced language detection utility
const detectLanguage = (code) => {
  if (!code || code.trim().length < 10) return null; // Don't auto-detect for very short code
  
  const content = code.toLowerCase().trim();
  const lines = content.split('\n');
  
  // Score-based detection for better accuracy
  const scores = {};
  
  // HTML Detection
  if (content.includes('<html') || content.includes('<!doctype') || 
      content.includes('<head>') || content.includes('<body>') ||
      content.includes('<div') || content.includes('<span') ||
      content.includes('<p>') || content.includes('<h1')) {
    scores.html = (scores.html || 0) + 10;
  }
  
  // CSS Detection
  if ((content.includes('{') && content.includes('}') && content.includes(':')) ||
      content.includes('@media') || content.includes('display:') ||
      content.includes('margin:') || content.includes('padding:') ||
      content.includes('color:') || content.includes('background:')) {
    scores.css = (scores.css || 0) + 8;
  }
  
  // JSON Detection - be more strict
  if ((content.startsWith('{') && content.endsWith('}')) ||
      (content.startsWith('[') && content.endsWith(']'))) {
    try {
      JSON.parse(code.trim());
      scores.json = (scores.json || 0) + 10;
    } catch (e) {
      // Not valid JSON
    }
  }
  
  // TypeScript Detection (check before JavaScript)
  if (content.includes('interface ') || content.includes('type ') ||
      content.includes(': string') || content.includes(': number') ||
      content.includes(': boolean') || content.includes('enum ') ||
      content.includes('public ') || content.includes('private ') ||
      content.includes('<t>') || content.includes('extends ')) {
    scores.typescript = (scores.typescript || 0) + 8;
  }
  
  // JavaScript Detection
  if (content.includes('function ') || content.includes('const ') || 
      content.includes('let ') || content.includes('var ') ||
      content.includes('=>') || content.includes('console.log') ||
      content.includes('document.') || content.includes('window.') ||
      content.includes('import ') || content.includes('export ') ||
      content.includes('require(')) {
    scores.javascript = (scores.javascript || 0) + 6;
  }
  
  // Python Detection
  if (content.includes('def ') || content.includes('import ') ||
      content.includes('from ') || content.includes('print(') ||
      content.includes('if __name__') || content.includes('class ') ||
      content.includes('self.') || content.includes('elif ') ||
      lines.some(line => line.trim().startsWith('#'))) {
    scores.python = (scores.python || 0) + 8;
  }
  
  // Java Detection
  if (content.includes('public class ') || content.includes('private ') ||
      content.includes('public static void main') || content.includes('system.out.println') ||
      content.includes('import java.') || content.includes('package ')) {
    scores.java = (scores.java || 0) + 9;
  }
  
  // C++ Detection
  if (content.includes('#include') || content.includes('std::') ||
      content.includes('cout <<') || content.includes('int main()') ||
      content.includes('namespace ') || content.includes('using namespace')) {
    scores['c++'] = (scores['c++'] || 0) + 9;
  }
  
  // C# Detection
  if (content.includes('using system') || content.includes('console.writeline') ||
      content.includes('namespace ') || content.includes('public static void main')) {
    scores['c#'] = (scores['c#'] || 0) + 8;
  }
  
  // Go Detection
  if (content.includes('package main') || content.includes('func main()') ||
      content.includes('fmt.println') || content.includes('import (')) {
    scores.go = (scores.go || 0) + 9;
  }
  
  // Rust Detection
  if (content.includes('fn main') || content.includes('println!') ||
      content.includes('let mut') || content.includes('use std::')) {
    scores.rust = (scores.rust || 0) + 9;
  }
  
  // PHP Detection
  if (content.includes('<?php') || content.includes('<?=') ||
      content.includes('echo ') || content.includes('$_')) {
    scores.php = (scores.php || 0) + 10;
  }
  
  // Ruby Detection
  if ((content.includes('def ') && content.includes('end')) ||
      content.includes('puts ') || content.includes('require ')) {
    scores.ruby = (scores.ruby || 0) + 8;
  }
  
  // SQL Detection
  if (content.includes('select ') || content.includes('from ') ||
      content.includes('where ') || content.includes('insert into') ||
      content.includes('update ') || content.includes('create table')) {
    scores.sql = (scores.sql || 0) + 9;
  }
  
  // Shell/Bash Detection
  if (content.includes('#!/bin/bash') || content.includes('#!/bin/sh') ||
      content.includes('echo ') || content.includes('cd ') ||
      lines.some(line => line.trim().startsWith('#'))) {
    scores.bash = (scores.bash || 0) + 8;
  }

  // Find the language with the highest score
  let detected = null;
  let maxScore = 0;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detected = lang;
    }
  }
  return detected;
};

const SnippetForm = ({ isOpen, onClose, snippet, mode = 'create' }) => {
  const { 
    createSnippet, 
    updateSnippet, 
    languages, 
    categories 
  } = useSnippetStore();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    category: 'snippet',
    tags: [],
    metadata: {
      framework: '',
      version: '',
      author: '',
      project: '',
      dependencies: []
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [depInput, setDepInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(null);
  const [userChangedLanguage, setUserChangedLanguage] = useState(false);

  // Initialize form data when snippet prop changes
  useEffect(() => {
    if (mode === 'edit' && snippet) {
      setFormData({
        title: snippet.title || '',
        description: snippet.description || '',
        code: snippet.code || '',
        language: snippet.language || 'javascript',
        category: snippet.category || 'snippet',
        tags: snippet.tags || [],
        metadata: {
          framework: snippet.metadata?.framework || '',
          version: snippet.metadata?.version || '',
          author: snippet.metadata?.author || '',
          project: snippet.metadata?.project || '',
          dependencies: snippet.metadata?.dependencies || []
        }
      });
      setUserChangedLanguage(true); // Don't auto-detect for existing snippets
    } else {
      // Reset form for new snippet
      setFormData({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        category: 'snippet',
        tags: [],
        metadata: {
          framework: '',
          version: '',
          author: '',
          project: '',
          dependencies: []
        }
      });
      setUserChangedLanguage(false);
    }
    setTagInput('');
    setDepInput('');
    setErrors({});
    setAutoDetected(null);
  }, [snippet, mode, isOpen]);

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

    // Special handling for language changes
    if (field === 'language') {
      setUserChangedLanguage(true);
      setAutoDetected(null);
    }
  };

  // Handle metadata changes
  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  // Handle code changes with auto-detection
  const handleCodeChange = (code) => {
    setFormData(prev => ({
      ...prev,
      code
    }));

    // Only auto-detect if user hasn't manually changed language
    if (!userChangedLanguage && code.trim().length > 10) {
      const detected = detectLanguage(code);
      if (detected && detected !== formData.language) {
        setAutoDetected(detected);
        // Auto-apply the detected language after a short delay
        setTimeout(() => {
          if (!userChangedLanguage) {
            setFormData(prev => ({
              ...prev,
              language: detected
            }));
          }
        }, 1000);
      }
    }

    // Clear errors
    if (errors.code) {
      setErrors(prev => ({
        ...prev,
        code: undefined
      }));
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

  // Dependency management
  const addDependency = () => {
    if (depInput.trim() && !formData.metadata.dependencies.includes(depInput.trim())) {
      handleMetadataChange('dependencies', [...formData.metadata.dependencies, depInput.trim()]);
      setDepInput('');
    }
  };

  const removeDependency = (dep) => {
    const newDeps = formData.metadata.dependencies.filter(d => d !== dep);
    handleMetadataChange('dependencies', newDeps);
  };

  // Handle enter key for tags and dependencies
  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'tag') addTag();
      if (type === 'dep') addDependency();
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const snippetData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim()),
        metadata: {
          ...formData.metadata,
          framework: formData.metadata.framework.trim() || null,
          version: formData.metadata.version.trim() || null,
          author: formData.metadata.author.trim() || null,
          project: formData.metadata.project.trim() || null,
          dependencies: formData.metadata.dependencies.filter(dep => dep.trim())
        }
      };

      if (mode === 'edit' && snippet) {
        await updateSnippet(snippet.id, snippetData);
      } else {
        await createSnippet(snippetData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save snippet:', error);
      setErrors({ submit: 'Failed to save snippet. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Code Snippet' : 'Create New Snippet'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter snippet title..."
            error={errors.title}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description (optional)..."
          />
        </div>

        {/* Language and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Programming Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-bg-secondary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Code Editor */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Code *
          </label>
          <div className="relative">
            {/* Auto-detection indicator */}
            {autoDetected && !userChangedLanguage && (
              <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-green-100 text-green-700 rounded text-xs animate-pulse">
                Auto-detected: {autoDetected}
              </div>
            )}
            <CodeEditor
              value={formData.code}
              onChange={handleCodeChange}
              language={formData.language}
              placeholder={`Enter your ${formData.language} code here...\n\nFeatures:\n• Syntax highlighting\n• Line numbers\n• Tab support\n• Auto-language detection`}
              error={errors.code}
              height="300px"
            />
          </div>
          {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
        </div>

        {/* Tags and Dependencies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Tags</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'tag')}
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

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Dependencies</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={depInput}
                  onChange={(e) => setDepInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'dep')}
                  placeholder="e.g., react, lodash..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  onClick={addDependency}
                  disabled={!depInput.trim()}
                >
                  Add
                </Button>
              </div>
              {formData.metadata.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.metadata.dependencies.map((dep, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200 font-mono"
                    >
                      {dep}
                      <button
                        type="button"
                        onClick={() => removeDependency(dep)}
                        className="ml-1 text-blue-500 hover:text-blue-700 transition-colors"
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

        {/* Metadata */}
        <Card padding="medium" className="bg-bg-primary border border-border">
          <h4 className="text-sm font-medium text-text-primary mb-3">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Framework"
              value={formData.metadata.framework}
              onChange={(e) => handleMetadataChange('framework', e.target.value)}
              placeholder="e.g., React, Vue"
              size="small"
            />
            <Input
              label="Version"
              value={formData.metadata.version}
              onChange={(e) => handleMetadataChange('version', e.target.value)}
              placeholder="e.g., 1.0.0"
              size="small"
            />
            <Input
              label="Author"
              value={formData.metadata.author}
              onChange={(e) => handleMetadataChange('author', e.target.value)}
              placeholder="Code author"
              size="small"
            />
            <Input
              label="Project"
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
            {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Snippet' : 'Create Snippet')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SnippetForm;