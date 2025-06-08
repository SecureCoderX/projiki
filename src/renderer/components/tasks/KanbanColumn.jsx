import React from 'react';
import { motion } from 'framer-motion';
import { Button, Badge } from '../ui';

const KanbanColumn = ({ 
  column,
  tasks = [],
  stats = { total: 0, highPriority: 0, totalEstimate: 0 },
  isDropTarget = false,
  isDraggingOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskCreate,
  children
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        );
      case 'in-progress':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12l2 2 4-4"/>
          </svg>
        );
      case 'review':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
        );
      case 'done':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        );
      case 'blocked':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'todo':
        return 'default';
      case 'in-progress':
        return 'warning';
      case 'review':
        return 'primary';
      case 'done':
        return 'success';
      case 'blocked':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      className={`h-full flex flex-col border-2 rounded-lg transition-all duration-200 ${
        isDraggingOver 
          ? `${column.accent} bg-accent/5 shadow-lg` 
          : 'border-border bg-bg-secondary'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      layout
    >
      {/* Column Header */}
      <div className={`p-4 border-b border-border ${column.color}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={column.headerColor}>
              {getStatusIcon(column.status)}
            </span>
            <h3 className={`font-semibold ${column.headerColor}`}>
              {column.title}
            </h3>
            <Badge 
              variant={getStatusBadgeVariant(column.status)} 
              size="small"
            >
              {stats.total}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="small"
            onClick={onTaskCreate}
            className="opacity-70 hover:opacity-100 h-8 w-8 p-0"
            title={`Add task to ${column.title}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </Button>
        </div>

        {/* Column Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            {stats.highPriority > 0 && (
              <div className="flex items-center space-x-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-red-600 font-medium">{stats.highPriority}</span>
              </div>
            )}
            
            {stats.totalEstimate > 0 && (
              <div className="flex items-center space-x-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span className="text-text-muted">{stats.totalEstimate}h</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
        {children}
      </div>

      {/* Column Footer */}
      {stats.total > 0 && (
        <div className="p-3 border-t border-border bg-bg-tertiary/50">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              {stats.total} {stats.total === 1 ? 'task' : 'tasks'}
            </span>
            
            {stats.totalEstimate > 0 && (
              <span>
                {stats.totalEstimate}h estimated
              </span>
            )}
          </div>
          
          {/* Progress bar for done column */}
          {column.status === 'done' && stats.total > 0 && (
            <div className="mt-2">
              <div className="w-full bg-bg-secondary rounded-full h-1">
                <motion.div
                  className="bg-green-500 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drop Zone Overlay */}
      {isDraggingOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-accent/10 border-2 border-dashed border-accent rounded-lg flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-accent mb-2">
                <path d="M12 5v14"/>
                <path d="M19 12l-7 7-7-7"/>
              </svg>
            </motion.div>
            <p className="text-sm font-medium text-accent">
              Drop to move to {column.title}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default KanbanColumn;