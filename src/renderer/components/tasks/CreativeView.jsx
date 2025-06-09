import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '../ui';
import TaskCard from './TaskCard';

const CreativeView = ({ tasks = [], onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onCreateTask?.({
        title: newTaskTitle.trim(),
        type: 'idea',
        status: 'todo'
      });
      setNewTaskTitle('');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // In a real implementation, you might update task position here
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="space-y-6">
      {/* Quick Add */}
      <Card className="p-4">
        <form onSubmit={handleQuickAdd} className="flex gap-3">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Quick add an idea or task..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newTaskTitle.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Add
          </Button>
        </form>
      </Card>

      {tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-4">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
          </svg>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Creative Canvas
          </h3>
          <p className="text-text-muted mb-4">
            This is your creative space for brainstorming and organizing ideas freely.
          </p>
          <p className="text-sm text-text-muted">
            Add your first idea using the quick add form above.
          </p>
        </Card>
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-96"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              className={`cursor-move ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}
            >
              <TaskCard
                task={task}
                onEdit={(updatedTask) => onUpdateTask?.(task.id, updatedTask)}
                onDelete={() => onDeleteTask?.(task.id)}
                onUpdateStatus={(status) => onUpdateTask?.(task.id, { status })}
                compact={true}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Creative View Info */}
      {tasks.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Creative Mode</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Drag and drop to reorganize your ideas. This view is perfect for brainstorming and visual thinking.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CreativeView;