// src/renderer/components/notes/NoteCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../ui';

const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleFavorite,
  onArchive
}) => {
  const typeColors = {
    note: 'default',
    journal: 'primary',
    idea: 'warning',
    meeting: 'info',
    changelog: 'success',
    bug: 'danger',
    feature: 'primary',
    research: 'secondary',
    todo: 'warning',
    other: 'outline'
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

  const getTypeIcon = (type) => {
    const icons = {
      note: '📝',
      journal: '📖',
      idea: '💡',
      meeting: '🤝',
      changelog: '📋',
      bug: '🐛',
      feature: '✨',
      research: '🔬',
      todo: '✅',
      other: '📄'
    };
    return icons[type] || icons.other;
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
        className={`group relative overflow-hidden cursor-pointer ${note.isArchived ? 'opacity-75' : ''}`}
        onClick={() => onEdit?.(note)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{getTypeIcon(note.type)}</span>
              <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                {note.title}
              </h3>
              {note.isFavorite && (
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
              {note.isArchived && (
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-text-muted flex-shrink-0"
                >
                  <rect x="2" y="3" width="20" height="5"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <rect x="2" y="8" width="20" height="13"/>
                </svg>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(note);
              }}
              className="h-8 w-8 p-0"
              title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill={note.isFavorite ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2"
                className={note.isFavorite ? "text-yellow-500" : ""}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(note);
              }}
              className="h-8 w-8 p-0"
              title="Edit note"
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
                onDuplicate?.(note);
              }}
              className="h-8 w-8 p-0"
              title="Duplicate note"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Type and Tags */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <Badge variant={typeColors[note.type]} size="small">
            {note.type.toUpperCase()}
          </Badge>
          {note.projectId && (
            <Badge variant="outline" size="small">
              Project
            </Badge>
          )}
        </div>

        {/* Content Preview */}
        {note.content && (
          <div className="mb-3">
            <p className="text-sm text-text-secondary line-clamp-3">
              {truncateContent(note.content)}
            </p>
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="small">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" size="small">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-text-muted">Words</span>
            <div className="font-medium text-text-primary">
              {note.metadata?.wordCount || 0}
            </div>
          </div>
          <div>
            <span className="text-text-muted">Read time</span>
            <div className="font-medium text-text-primary">
              {note.metadata?.readTime || 1} min
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(note);
              }}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              {note.isArchived ? 'Unarchive' : 'Archive'}
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(note);
              }}
              className="text-red-500 hover:text-red-600 text-xs"
            >
              Delete
            </Button>
          </div>
          
          <div className="text-xs text-text-muted">
            <div>{getTimeAgo(note.updatedAt)}</div>
            <div className="text-xs opacity-75">{formatDate(note.createdAt)}</div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default NoteCard;