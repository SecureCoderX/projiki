// src/renderer/components/snippets/SnippetCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../ui';

const SnippetCard = ({ 
  snippet, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleFavorite,
  onUse,
  onSelect 
}) => {
  const [showFullCode, setShowFullCode] = useState(false);

  const languageColors = {
    javascript: 'warning',
    typescript: 'primary',
    python: 'success',
    java: 'danger',
    'c++': 'secondary',
    'c#': 'info',
    go: 'primary',
    rust: 'warning',
    php: 'info',
    ruby: 'danger',
    swift: 'warning',
    kotlin: 'primary',
    dart: 'primary',
    html: 'danger',
    css: 'primary',
    scss: 'info',
    sql: 'secondary',
    json: 'success',
    yaml: 'warning',
    markdown: 'secondary',
    bash: 'secondary',
    powershell: 'primary',
    other: 'default'
  };

  const categoryColors = {
    function: 'primary',
    component: 'success',
    utility: 'warning',
    algorithm: 'info',
    pattern: 'secondary',
    config: 'default',
    template: 'primary',
    hook: 'success',
    class: 'warning',
    module: 'info',
    snippet: 'default',
    boilerplate: 'secondary',
    example: 'outline'
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

  const truncateCode = (code, maxLines = 10) => {
    const lines = code.split('\n');
    if (lines.length <= maxLines) return code;
    return lines.slice(0, maxLines).join('\n') + '\n...';
  };

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet.code);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleUse = (e) => {
    e.stopPropagation();
    onUse?.(snippet);
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      java: '☕',
      'c++': '⚡',
      'c#': '🔷',
      go: '🐹',
      rust: '🦀',
      php: '🐘',
      ruby: '💎',
      swift: '🍎',
      kotlin: '🎯',
      html: '🌐',
      css: '🎨',
      json: '📄',
      sql: '🗃️',
      bash: '💻',
      other: '📝'
    };
    return icons[language] || icons.other;
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
        onClick={() => onSelect?.(snippet)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{getLanguageIcon(snippet.language)}</span>
              <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                {snippet.title}
              </h3>
              {snippet.isFavorite && (
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
            {snippet.description && (
              <p className="text-sm text-text-muted mb-2 line-clamp-2">
                {snippet.description}
              </p>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="small"
              onClick={handleCopyCode}
              className="h-8 w-8 p-0"
              title="Copy code"
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
                onToggleFavorite?.(snippet);
              }}
              className="h-8 w-8 p-0"
              title={snippet.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill={snippet.isFavorite ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2"
                className={snippet.isFavorite ? "text-yellow-500" : ""}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(snippet);
              }}
              className="h-8 w-8 p-0"
              title="Edit snippet"
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
                onDuplicate?.(snippet);
              }}
              className="h-8 w-8 p-0"
              title="Duplicate snippet"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Language and Category Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <Badge variant={languageColors[snippet.language]} size="small">
            {snippet.language.toUpperCase()}
          </Badge>
          <Badge variant={categoryColors[snippet.category]} size="small">
            {snippet.category}
          </Badge>
          {snippet.metadata?.framework && (
            <Badge variant="outline" size="small">
              {snippet.metadata.framework}
            </Badge>
          )}
        </div>

        {/* Code Preview */}
        <div className="mb-3">
          <div className="bg-bg-primary border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-bg-secondary border-b border-border">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-muted font-mono">{snippet.language}</span>
                {snippet.metadata?.version && (
                  <span className="text-xs text-text-muted">v{snippet.metadata.version}</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullCode(!showFullCode);
                }}
                className="text-xs text-accent hover:text-accent-dark"
              >
                {showFullCode ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-text-primary overflow-x-auto whitespace-pre-wrap break-words">
              <code>
                {showFullCode ? snippet.code : truncateCode(snippet.code)}
              </code>
            </pre>
          </div>
        </div>

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {snippet.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="small">
                {tag}
              </Badge>
            ))}
            {snippet.tags.length > 3 && (
              <Badge variant="outline" size="small">
                +{snippet.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Dependencies */}
        {snippet.metadata?.dependencies && snippet.metadata.dependencies.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-text-muted mb-1">Dependencies:</div>
            <div className="flex flex-wrap gap-1">
              {snippet.metadata.dependencies.slice(0, 3).map((dep, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-bg-secondary rounded border border-border font-mono">
                  {dep}
                </span>
              ))}
              {snippet.metadata.dependencies.length > 3 && (
                <span className="text-xs px-2 py-1 bg-bg-secondary rounded border border-border">
                  +{snippet.metadata.dependencies.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Usage Stats and Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-text-muted">Usage</span>
            <div className="font-medium text-text-primary">
              {snippet.usageCount} times
            </div>
          </div>
          <div>
            <span className="text-text-muted">Updated</span>
            <div className="font-medium text-text-primary">
              {getTimeAgo(snippet.updatedAt)}
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
              Use Code
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(snippet);
              }}
              className="text-red-500 hover:text-red-600 text-xs"
            >
              Delete
            </Button>
          </div>
          
          <div className="text-xs text-text-muted">
            {formatDate(snippet.createdAt)}
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default SnippetCard;