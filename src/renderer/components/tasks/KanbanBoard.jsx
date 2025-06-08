import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '../ui';
import TaskCard from './TaskCard';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ 
  tasks = [], 
  onTaskEdit,
  onTaskDelete,
  onTaskDuplicate,
  onTaskStatusChange,
  onTaskPriorityChange,
  onTaskSelect,
  onTaskCreate,
  loading = false
}) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Kanban columns configuration
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      status: 'todo',
      color: 'bg-gray-100 dark:bg-gray-800',
      headerColor: 'text-gray-700 dark:text-gray-300',
      accent: 'border-gray-300 dark:border-gray-600'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      headerColor: 'text-blue-700 dark:text-blue-300',
      accent: 'border-blue-300 dark:border-blue-600'
    },
    {
      id: 'review',
      title: 'Review',
      status: 'review',
      color: 'bg-yellow-50 dark:bg-yellow-900/20',
      headerColor: 'text-yellow-700 dark:text-yellow-300',
      accent: 'border-yellow-300 dark:border-yellow-600'
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      color: 'bg-green-50 dark:bg-green-900/20',
      headerColor: 'text-green-700 dark:text-green-300',
      accent: 'border-green-300 dark:border-green-600'
    },
    {
      id: 'blocked',
      title: 'Blocked',
      status: 'blocked',
      color: 'bg-red-50 dark:bg-red-900/20',
      headerColor: 'text-red-700 dark:text-red-300',
      accent: 'border-red-300 dark:border-red-600'
    }
  ];

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {};
    columns.forEach(column => {
      grouped[column.status] = tasks.filter(task => task.status === column.status);
    });
    return grouped;
  }, [tasks, columns]);

  // Handle drag start
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setData('text/plain', task.id);
  };

  // Handle drag over column
  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  };

  // Handle drag leave column
  const handleDragLeave = (e) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  // Handle drop
  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnStatus) {
      onTaskStatusChange?.(draggedTask.id, columnStatus);
    }
    
    setDraggedTask(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Calculate stats for each column
  const getColumnStats = (status) => {
    const columnTasks = tasksByStatus[status] || [];
    const highPriority = columnTasks.filter(t => t.metadata?.priority === 'high').length;
    const totalEstimate = columnTasks.reduce((sum, t) => sum + (t.metadata?.estimatedTime || 0), 0);
    
    return {
      total: columnTasks.length,
      highPriority,
      totalEstimate
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Kanban Board</h2>
          <p className="text-sm text-text-muted mt-1">
            Drag and drop tasks between columns to update their status
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" size="small">
            {tasks.length} tasks total
          </Badge>
          
          <Button
            variant="primary"
            size="small"
            onClick={() => onTaskCreate?.('todo')}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = tasksByStatus[column.status] || [];
          const stats = getColumnStats(column.status);
          const isDropTarget = dragOverColumn === column.status;
          const isDraggingOver = draggedTask && dragOverColumn === column.status;

          return (
            <motion.div
              key={column.id}
              className="flex-shrink-0 w-80"
              layout
            >
              <KanbanColumn
                column={column}
                tasks={columnTasks}
                stats={stats}
                isDropTarget={isDropTarget}
                isDraggingOver={isDraggingOver}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
                onTaskCreate={() => onTaskCreate?.(column.status)}
              >
                <AnimatePresence>
                  {columnTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`${
                        draggedTask?.id === task.id ? 'opacity-50' : ''
                      }`}
                    >
                      <TaskCard
                        task={task}
                        onEdit={onTaskEdit}
                        onDelete={onTaskDelete}
                        onDuplicate={onTaskDuplicate}
                        onStatusChange={onTaskStatusChange}
                        onPriorityChange={onTaskPriorityChange}
                        onSelect={onTaskSelect}
                        isDragging={draggedTask?.id === task.id}
                        dragHandleProps={{
                          onMouseDown: (e) => e.stopPropagation()
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <p className="text-sm text-text-muted mb-2">No tasks in {column.title}</p>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => onTaskCreate?.(column.status)}
                      className="text-xs"
                    >
                      Add first task
                    </Button>
                  </motion.div>
                )}

                {/* Drop Zone Indicator */}
                {isDraggingOver && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-2 border-dashed border-accent bg-accent/10 rounded-lg p-4 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-accent mb-2">
                        <path d="M12 5v14"/>
                        <path d="M19 12l-7 7-7-7"/>
                      </svg>
                      <p className="text-sm font-medium text-accent">
                        Drop task here
                      </p>
                    </div>
                  </motion.div>
                )}
              </KanbanColumn>
            </motion.div>
          );
        })}
      </div>

      {/* Board Footer with Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-4 bg-bg-secondary border border-border rounded-lg"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-text-muted">Total Tasks:</span>
              <span className="font-medium text-text-primary ml-2">{tasks.length}</span>
            </div>
            
            <div className="text-sm">
              <span className="text-text-muted">In Progress:</span>
              <span className="font-medium text-text-primary ml-2">
                {(tasksByStatus['in-progress']?.length || 0) + (tasksByStatus['review']?.length || 0)}
              </span>
            </div>
            
            <div className="text-sm">
              <span className="text-text-muted">Completed:</span>
              <span className="font-medium text-text-primary ml-2">
                {tasksByStatus['done']?.length || 0}
              </span>
            </div>
            
            <div className="text-sm">
              <span className="text-text-muted">High Priority:</span>
              <span className="font-medium text-red-600 ml-2">
                {tasks.filter(t => t.metadata?.priority === 'high').length}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KanbanBoard;