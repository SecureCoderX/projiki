import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../ui';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onArchive, 
  onSelect 
}) => {
  const statusColors = {
    active: 'success',
    paused: 'warning', 
    completed: 'primary',
    archived: 'default'
  };

  const priorityColors = {
    low: 'default',
    medium: 'warning',
    high: 'danger'
  };

  const modeColors = {
    structured: 'primary',
    creative: 'success',
    hybrid: 'warning'
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
        onClick={() => onSelect?.(project)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-text-muted mt-1 line-clamp-2">
              {project.description || 'No description provided'}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(project);
              }}
              className="h-8 w-8 p-0"
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
                onDuplicate?.(project);
              }}
              className="h-8 w-8 p-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </Button>
          </div>
        </div>

        {/* Status and Mode Badges */}
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant={statusColors[project.status]} size="small">
            {project.status}
          </Badge>
          <Badge variant={modeColors[project.mode]} size="small">
            {project.mode}
          </Badge>
          {project.metadata?.priority && (
            <Badge variant={priorityColors[project.metadata.priority]} size="small">
              {project.metadata.priority} priority
            </Badge>
          )}
        </div>

        {/* Tags */}
        {project.metadata?.tags && project.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.metadata.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="small">
                {tag}
              </Badge>
            ))}
            {project.metadata.tags.length > 3 && (
              <Badge variant="outline" size="small">
                +{project.metadata.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-text-muted">Created</span>
            <div className="font-medium text-text-primary">
              {formatDate(project.createdAt)}
            </div>
          </div>
          <div>
            <span className="text-text-muted">Updated</span>
            <div className="font-medium text-text-primary">
              {getTimeAgo(project.updatedAt)}
            </div>
          </div>
        </div>

        {/* Deadline */}
        {project.metadata?.deadline && (
          <div className="mb-4">
            <div className="flex items-center text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-text-muted">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span className="text-text-muted mr-2">Deadline:</span>
              <span className="font-medium text-text-primary">
                {formatDate(project.metadata.deadline)}
              </span>
            </div>
          </div>
        )}

        {/* Estimated Hours */}
        {project.metadata?.estimatedHours && (
          <div className="mb-4">
            <div className="flex items-center text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-text-muted">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span className="text-text-muted mr-2">Estimated:</span>
              <span className="font-medium text-text-primary">
                {project.metadata.estimatedHours}h
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(project);
              }}
              className="text-text-muted hover:text-text-primary"
            >
              {project.status === 'archived' ? 'Unarchive' : 'Archive'}
            </Button>
            
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(project);
              }}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </Button>
          </div>
          
          <div className="text-xs text-text-muted">
            ID: {project.id.slice(0, 8)}...
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default ProjectCard;