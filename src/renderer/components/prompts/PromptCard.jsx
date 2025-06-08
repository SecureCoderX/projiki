// src/renderer/components/prompts/PromptCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../ui';

const PromptCard = ({ 
  prompt, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleFavorite,
  onUse,
  onSelect 
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const categoryColors = {
    debugging: 'danger',
    optimization: 'warning',
    documentation: 'primary',
    'code-generation': 'success',
    'code-review': 'info',
    testing: 'secondary',
    refactoring: 'warning',
    planning: 'primary',
    learning: 'info',
    general: 'default'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCopyPrompt = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const handleUse = (e) => {
    e.stopPropagation();
    onUse?.(prompt);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        variant="elevated" 
        padding="medium" 
        hover={true}
        className="group relative overflow-hidden cursor-pointer"
        onClick={() => onSelect?.(prompt)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                {prompt.title}
              </h3>
              {prompt.isFavorite && (
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="text-yellow-500 flex-shrink-0"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              )}
            </div>
            <p className="text-sm text-text-muted mt-1">
              {showFullContent ? prompt.content : truncateContent(prompt.content)}
              {prompt.content.length > 150 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullContent(!showFullContent);
                  }}
                  className="ml-2 text-accent hover:text-accent-dark text-xs"
                >
                  {showFullContent ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="small"
              onClick={handleCopyPrompt}
              className="h-8 w-8 p-0"
              title="Copy prompt"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(prompt);
              }}
              className="h-8 w-8 p-0"
              title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill={prompt.isFavorite ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2"
                className={prompt.isFavorite ? "text-yellow-500" : ""}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(prompt);
              }}
              className="h-8 w-8 p-0"
              title="Edit prompt"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(prompt);
              }}
              className="h-8 w-8 p-0"
              title="Duplicate prompt"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Category and Tags */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <Badge variant={categoryColors[prompt.category]} size="small">
            {prompt.category}
          </Badge>
          {prompt.tags && prompt.tags.length > 0 && (
            <>
              {prompt.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" size="small">
                  {tag}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="outline" size="small">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* AI Model and Language */}
        {(prompt.metadata?.aiModel || prompt.metadata?.language) && (
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {prompt.metadata?.aiModel && (
              <div>
                <span className="text-text-muted">AI Model</span>
                <div className="font-medium text-text-primary">
                  {prompt.metadata.aiModel}
                </div>
              </div>
            )}
            {prompt.metadata?.language && (
              <div>
                <span className="text-text-muted">Language</span>
                <div className="font-medium text-text-primary">
                  {prompt.metadata.language}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Response Preview */}
        {prompt.response && (
          <div className="mb-4">
            <div className="text-sm text-text-muted mb-1">Response Preview:</div>
            <div className="text-sm text-text-primary bg-background-secondary rounded p-2 border-l-2 border-accent">
              {truncateContent(prompt.response, 100)}
            </div>
          </div>
        )}

        {/* Usage Stats and Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-text-muted">Usage</span>
            <div className="font-medium text-text-primary">
              {prompt.usageCount} times
            </div>
          </div>
          <div>
            <span className="text-text-muted">Updated</span>
            <div className="font-medium text-text-primary">
              {getTimeAgo(prompt.updatedAt)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="small"
              onClick={handleUse}
              className="text-xs"
            >
              Use Prompt
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(prompt);
              }}
              className="text-red-500 hover:text-red-600 text-xs"
            >
              Delete
            </Button>
          </div>
          
          <div className="text-xs text-text-muted">
            {formatDate(prompt.createdAt)}
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default PromptCard;