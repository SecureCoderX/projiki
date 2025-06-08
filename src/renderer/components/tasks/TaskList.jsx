import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '../ui';
import TaskCard from './TaskCard';

const TaskList = ({ 
  tasks = [], 
  onTaskEdit,
  onTaskDelete,
  onTaskDuplicate,
  onTaskStatusChange,
  onTaskPriorityChange,
  onTaskSelect,
  onTaskCreate,
  loading = false,
  groupBy = 'status', // 'status' | 'priority' | 'type' | 'none'
  sortBy = 'updatedAt',
  sortOrder = 'desc'
}) => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Group tasks based on groupBy prop
  const groupTasks = (tasks) => {
    if (groupBy === 'none') {
      return { 'All Tasks': tasks };
    }

    const groups = {};
    
    tasks.forEach(task => {
      let groupKey;
      
      switch (groupBy) {
        case 'status':
          groupKey = task.status;
          break;
        case 'priority':
          groupKey = task.metadata?.priority || 'medium';
          break;
        case 'type':
          groupKey = task.type;
          break;
        default:
          groupKey = 'All Tasks';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    // Sort groups by predefined order
    const sortedGroups = {};
    const groupOrder = getGroupOrder(groupBy);
    
    groupOrder.forEach(key => {
      if (groups[key]) {
        sortedGroups[key] = groups[key];
      }
    });

    // Add any remaining groups not in predefined order
    Object.keys(groups).forEach(key => {
      if (!sortedGroups[key]) {
        sortedGroups[key] = groups[key];
      }
    });

    return sortedGroups;
  };

  const getGroupOrder = (groupBy) => {
    switch (groupBy) {
      case 'status':
        return ['todo', 'in-progress', 'review', 'done', 'blocked'];
      case 'priority':
        return ['high', 'medium', 'low'];
      case 'type':
        return ['task', 'note', 'snippet', 'idea'];
      default:
        return [];
    }
  };

  const getGroupDisplayName = (groupKey, groupBy) => {
    switch (groupBy) {
      case 'status':
        return groupKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      case 'priority':
        return `${groupKey.charAt(0).toUpperCase() + groupKey.slice(1)} Priority`;
      case 'type':
        return `${groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}s`;
      default:
        return groupKey;
    }
  };

  const getGroupIcon = (groupKey, groupBy) => {
    switch (groupBy) {
      case 'status':
        switch (groupKey) {
          case 'todo':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
          case 'in-progress':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>;
          case 'review':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>;
          case 'done':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>;
          case 'blocked':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
        }
        break;
      case 'priority':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
      case 'type':
        switch (groupKey) {
          case 'task':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
          case 'note':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>;
          case 'snippet':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>;
          case 'idea':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
        }
        break;
    }
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
  };

  const getGroupBadgeVariant = (groupKey, groupBy) => {
    switch (groupBy) {
      case 'status':
        switch (groupKey) {
          case 'todo': return 'default';
          case 'in-progress': return 'warning';
          case 'review': return 'primary';
          case 'done': return 'success';
          case 'blocked': return 'danger';
        }
        break;
      case 'priority':
        switch (groupKey) {
          case 'high': return 'danger';
          case 'medium': return 'warning';
          case 'low': return 'default';
        }
        break;
      case 'type':
        switch (groupKey) {
          case 'task': return 'primary';
          case 'note': return 'success';
          case 'snippet': return 'warning';
          case 'idea': return 'default';
        }
        break;
    }
    return 'default';
  };

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    setSelectedTasks(tasks.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  const groupedTasks = groupTasks(tasks);

  // Initialize all groups as expanded for better UX
  React.useEffect(() => {
    if (groupBy !== 'none') {
      setExpandedGroups(new Set(Object.keys(groupedTasks)));
    }
  }, [groupBy, groupedTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* List Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Task List</h2>
          <p className="text-sm text-text-muted mt-1">
            {groupBy !== 'none' ? `Grouped by ${groupBy}` : 'All tasks in chronological order'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" size="small">
            {tasks.length} tasks total
          </Badge>
          
          {selectedTasks.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="primary" size="small">
                {selectedTasks.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="small"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          )}
          
          <Button
            variant="primary"
            size="small"
            onClick={() => onTaskCreate?.('todo')}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Task Groups */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
          const isExpanded = expandedGroups.has(groupKey);
          const groupDisplayName = getGroupDisplayName(groupKey, groupBy);
          const groupIcon = getGroupIcon(groupKey, groupBy);
          const badgeVariant = getGroupBadgeVariant(groupKey, groupBy);

          return (
            <motion.div
              key={groupKey}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-secondary border border-border rounded-lg overflow-hidden"
            >
              {/* Group Header */}
              {groupBy !== 'none' && (
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg-tertiary transition-colors"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <div className="flex items-center space-x-3">
                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-text-muted"
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <polyline points="9,18 15,12 9,6"/>
                    </motion.svg>
                    
                    <span className="text-text-muted">{groupIcon}</span>
                    
                    <h3 className="font-semibold text-text-primary">
                      {groupDisplayName}
                    </h3>
                    
                    <Badge variant={badgeVariant} size="small">
                      {groupTasks.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {groupTasks.filter(t => t.metadata?.priority === 'high').length > 0 && (
                      <Badge variant="danger" size="small">
                        {groupTasks.filter(t => t.metadata?.priority === 'high').length} high priority
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskCreate?.(groupKey === 'todo' || groupKey === 'in-progress' || groupKey === 'review' || groupKey === 'done' || groupKey === 'blocked' ? groupKey : 'todo');
                      }}
                      className="opacity-70 hover:opacity-100"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              )}

              {/* Group Content */}
              <AnimatePresence>
                {(isExpanded || groupBy === 'none') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 p-4"
                  >
                    {groupTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                        </div>
                        <p className="text-sm text-text-muted mb-2">No tasks in {groupDisplayName}</p>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => onTaskCreate?.(groupKey)}
                          className="text-xs"
                        >
                          Add first task
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {groupTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`relative ${
                              selectedTasks.includes(task.id) ? 'ring-2 ring-accent rounded-lg' : ''
                            }`}
                          >
                            {/* Selection Checkbox */}
                            <div className="absolute top-3 left-3 z-10">
                              <input
                                type="checkbox"
                                checked={selectedTasks.includes(task.id)}
                                onChange={() => toggleTaskSelection(task.id)}
                                className="w-4 h-4 text-accent bg-bg-primary border-border rounded focus:ring-accent focus:ring-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            
                            {/* Task Card */}
                            <div className="ml-8">
                              <TaskCard
                                task={task}
                                onEdit={onTaskEdit}
                                onDelete={onTaskDelete}
                                onDuplicate={onTaskDuplicate}
                                onStatusChange={onTaskStatusChange}
                                onPriorityChange={onTaskPriorityChange}
                                onSelect={onTaskSelect}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No tasks yet</h3>
          <p className="text-text-muted mb-4 max-w-md">
            Get started by creating your first task. You can organize them by status, priority, or type.
          </p>
          <Button
            variant="primary"
            onClick={() => onTaskCreate?.('todo')}
          >
            Create First Task
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default TaskList;