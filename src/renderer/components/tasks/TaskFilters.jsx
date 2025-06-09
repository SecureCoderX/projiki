import React from 'react';
import { Button, Input, Badge } from '../ui';

const TaskFilters = ({
  searchTerm = '',
  onSearchChange,
  statusFilter = [],
  onStatusFilterChange,
  priorityFilter = [],
  onPriorityFilterChange,
  tagFilter = [],
  onTagFilterChange,
  sortBy = 'updatedAt',
  onSortByChange,
  sortOrder = 'desc',
  onSortOrderChange,
  availableTags = [],
  onClearFilters,
  taskCounts = {}
}) => {
  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'gray' },
    { value: 'in-progress', label: 'In Progress', color: 'blue' },
    { value: 'done', label: 'Done', color: 'green' },
    { value: 'blocked', label: 'Blocked', color: 'red' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const sortOptions = [
    { value: 'updatedAt', label: 'Recently Updated' },
    { value: 'createdAt', label: 'Recently Created' },
    { value: 'title', label: 'Alphabetical' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' }
  ];

  const handleStatusToggle = (status) => {
    const newFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    onStatusFilterChange?.(newFilter);
  };

  const handlePriorityToggle = (priority) => {
    const newFilter = priorityFilter.includes(priority)
      ? priorityFilter.filter(p => p !== priority)
      : [...priorityFilter, priority];
    onPriorityFilterChange?.(newFilter);
  };

  const handleTagToggle = (tag) => {
    const newFilter = tagFilter.includes(tag)
      ? tagFilter.filter(t => t !== tag)
      : [...tagFilter, tag];
    onTagFilterChange?.(newFilter);
  };

  const hasActiveFilters = searchTerm || statusFilter.length > 0 || priorityFilter.length > 0 || tagFilter.length > 0;

  return (
    <div className="space-y-4 p-4 bg-bg-secondary rounded-lg border border-border">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange?.(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-bg-primary text-text-primary border-border hover:border-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort Order */}
          <Button
            variant="outline"
            size="small"
            onClick={() => onSortOrderChange?.(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sortOrder === 'asc' ? (
                <path d="M3 16l4-4 4 4M7 20V4"/>
              ) : (
                <path d="M3 8l4 4 4-4M7 4v16"/>
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(status => {
            const isActive = statusFilter.includes(status.value);
            const count = taskCounts[status.value] || 0;
            
            return (
              <button
                key={status.value}
                onClick={() => handleStatusToggle(status.value)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-bg-primary border border-border text-text-primary hover:bg-bg-secondary'
                }`}
              >
                {status.label}
                {count > 0 && (
                  <span className={`ml-1 text-xs ${isActive ? 'text-white' : 'text-text-muted'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Filters */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Priority
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map(priority => {
            const isActive = priorityFilter.includes(priority.value);
            
            return (
              <button
                key={priority.value}
                onClick={() => handlePriorityToggle(priority.value)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-bg-primary border border-border text-text-primary hover:bg-bg-secondary'
                }`}
              >
                {priority.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
              const isActive = tagFilter.includes(tag);
              
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'bg-bg-primary border border-border text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-sm text-text-muted">
            {statusFilter.length + priorityFilter.length + tagFilter.length} filter(s) active
          </span>
          <Button
            variant="ghost"
            size="small"
            onClick={onClearFilters}
            className="text-text-muted hover:text-text-primary"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;