import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../ui';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onStatusChange,
  onPriorityChange,
  onSelect,
  isDragging = false,
  dragHandleProps = {},
  showProject = false
}) => {
  const statusColors = {
    todo: 'default',
    'in-progress': 'warning',
    review: 'primary', 
    done: 'success',
    blocked: 'danger'
  };

  const priorityColors = {
    low: 'default',
    medium: 'warning',
    high: 'danger'
  };

  const typeColors = {
    task: 'primary',
    note: 'success',
    snippet: 'warning',
    idea: 'default'
  };

  const typeIcons = {
    task: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    note: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    snippet: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16,18 22,12 16,6"/>
        <polyline points="8,6 2,12 8,18"/>
      </svg>
    ),
    idea: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
        <path d="M12 16v4"/>
        <path d="M8 19h8"/>
      </svg>
    )
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

  const handleStatusClick = (e) => {
    e.stopPropagation();
    const statuses = ['todo', 'in-progress', 'review', 'done', 'blocked'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange?.(task.id, nextStatus);
  };

  const handlePriorityClick = (e) => {
    e.stopPropagation();
    const priorities = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.metadata.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    onPriorityChange?.(task.id, nextPriority);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
        rotateZ: isDragging ? 2 : 0
      }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={isDragging ? 'z-50' : ''}
    >
      <Card 
        variant="elevated" 
        padding="medium" 
        hover={!isDragging}
        className={`group relative overflow-hidden cursor-pointer ${
          isDragging ? 'shadow-2xl ring-2 ring-accent' : ''
        }`}
        onClick={() => onSelect?.(task)}
      >
        {/* Drag Handle */}
        <div 
          {...dragHandleProps}
          className="absolute left-0 top-0 bottom-0 w-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-text-muted flex-shrink-0">
                {typeIcons[task.type]}
              </span>
              <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                {task.title}
              </h3>
            </div>
            
            {task.content && (
              <p className="text-sm text-text-muted mt-1 line-clamp-2">
                {task.content}
              </p>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
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
                onDuplicate?.(task);
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

        {/* Status, Type, and Priority Badges */}
        <div className="flex items-center space-x-2 mb-4">
          <Badge 
            variant={statusColors[task.status]} 
            size="small"
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={handleStatusClick}
          >
            {task.status.replace('-', ' ')}
          </Badge>
          
          <Badge variant={typeColors[task.type]} size="small">
            {task.type}
          </Badge>
          
          {task.metadata?.priority && (
            <Badge 
              variant={priorityColors[task.metadata.priority]} 
              size="small"
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={handlePriorityClick}
            >
              {task.metadata.priority}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {task.metadata?.tags && task.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {task.metadata.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="small">
                {tag}
              </Badge>
            ))}
            {task.metadata.tags.length > 3 && (
              <Badge variant="outline" size="small">
                +{task.metadata.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-text-muted">Created</span>
            <div className="font-medium text-text-primary">
              {formatDate(task.createdAt)}
            </div>
          </div>
          <div>
            <span className="text-text-muted">Updated</span>
            <div className="font-medium text-text-primary">
              {getTimeAgo(task.updatedAt)}
            </div>
          </div>
        </div>

        {/* Estimated/Actual Time */}
        {(task.metadata?.estimatedTime || task.metadata?.actualTime) && (
          <div className="mb-4">
            <div className="flex items-center text-sm space-x-4">
              {task.metadata.estimatedTime && (
                <div className="flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1 text-text-muted">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span className="text-text-muted mr-1">Est:</span>
                  <span className="font-medium text-text-primary">
                    {task.metadata.estimatedTime}h
                  </span>
                </div>
              )}
              
              {task.metadata.actualTime && (
                <div className="flex items-center">
                  <span className="text-text-muted mr-1">Actual:</span>
                  <span className="font-medium text-text-primary">
                    {task.metadata.actualTime}h
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {task.metadata?.dependencies && task.metadata.dependencies.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-text-muted">
                <polyline points="16,18 22,12 16,6"/>
                <polyline points="8,6 2,12 8,18"/>
              </svg>
              <span className="text-text-muted mr-2">Dependencies:</span>
              <span className="font-medium text-text-primary">
                {task.metadata.dependencies.length}
              </span>
            </div>
          </div>
        )}

        {/* Project Information (if showing cross-project tasks) */}
        {showProject && (
          <div className="mb-4">
            <div className="flex items-center text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-text-muted">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span className="text-text-muted mr-2">Project:</span>
              <span className="font-medium text-text-primary truncate">
                {task.projectId}
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
                onDelete?.(task);
              }}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </Button>
          </div>
          
          <div className="text-xs text-text-muted">
            ID: {task.id.slice(0, 8)}...
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default TaskCard;